import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/database';
import { executeMCPTool, MCP_TOOLS } from './server/mcp';
import { ConversationAgent, OPDocOCRAgent, KnowledgeRAGAgent } from './server/agents';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for base64 documents and camera snaps
  app.use(express.json({ limit: '25mb' }));

  // Request logger for audit
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') && req.path !== '/api/health') {
      // safe logging without raw image base64
    }
    next();
  });

  // ===================== REST APIs =====================

  // 1. Health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AI CareFlow Government Hospital Kiosk Platform',
      timestamp: new Date().toISOString(),
      hospital: 'Thiruvalluvar Government Headquarters Hospital',
    });
  });

  // 2. Patients API
  app.get('/api/patients', (req, res) => {
    const list = Array.from(db.patients.values());
    res.json(list);
  });

  app.get('/api/patients/search', (req, res) => {
    const query = String(req.query.q || '');
    const results = db.searchPatients(query);
    res.json(results);
  });

  app.get('/api/patients/:id', (req, res) => {
    const patient = db.patients.get(req.params.id) || db.findPatientByUhid(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  });

  app.post('/api/patients', (req, res) => {
    try {
      const patient = db.createPatient(req.body);
      db.addAuditLog('KIOSK-01', 'REGISTRATION', 'PATIENT_CREATE', 'SYSTEM', 'SUCCESS', `Created patient ${patient.name} (${patient.uhid})`, patient.uhid);
      res.status(201).json(patient);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 3. OPD & Doctors API
  app.get('/api/opd/departments', (req, res) => {
    res.json(Array.from(db.departments.values()));
  });

  app.get('/api/doctors/availability', (req, res) => {
    const deptId = req.query.departmentId as string | undefined;
    let docs = Array.from(db.doctors.values());
    if (deptId) {
      docs = docs.filter(d => d.departmentId === deptId);
    }
    res.json(docs);
  });

  app.post('/api/opd/register', (req, res) => {
    try {
      const { patientId, departmentId, doctorId, priority, source, kioskId } = req.body;
      const visit = db.registerOPD(patientId, departmentId, doctorId, priority, source, kioskId);
      res.status(201).json(visit);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 4. Queues & Tokens API
  app.get('/api/queues/:deptId', (req, res) => {
    const deptId = req.params.deptId;
    const visitsInDept = Array.from(db.visits.values()).filter(v => v.departmentId === deptId);
    const doc = Array.from(db.doctors.values()).find(d => d.departmentId === deptId);
    res.json({
      departmentId: deptId,
      doctor: doc,
      activeVisits: visitsInDept,
      totalToday: visitsInDept.length,
      servingNow: doc?.currentToken || 0,
      waitingCount: visitsInDept.filter(v => v.status === 'WAITING').length,
    });
  });

  app.get('/api/tokens/:tokenId', (req, res) => {
    const token = Array.from(db.visits.values()).find(
      v => v.id === req.params.tokenId || v.tokenDisplay === req.params.tokenId || String(v.tokenNo) === req.params.tokenId
    );
    if (!token) return res.status(404).json({ error: 'Token not found' });
    res.json(token);
  });

  app.post('/api/queues/call-next', (req, res) => {
    try {
      const { doctorId } = req.body;
      const visit = db.callNextPatient(doctorId);
      res.json({ calledVisit: visit });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 5. Document Scanner & OCR
  app.post('/api/documents/scan', async (req, res) => {
    try {
      const { imageBase64, sampleId } = req.body;
      const ocrResult = await OPDocOCRAgent.processDocument(imageBase64 || '', sampleId);
      db.addAuditLog(
        'KIOSK-01',
        'SCAN_SESSION',
        'DOCUMENT_OCR',
        'OP_SHEET_OCR_AGENT',
        ocrResult.overallConfidence >= 0.75 ? 'SUCCESS' : 'ESCALATED',
        `OCR confidence: ${(ocrResult.overallConfidence * 100).toFixed(0)}%, Matched: ${ocrResult.matchedPatient?.name || 'None'}`,
        ocrResult.matchedPatient?.uhid,
        'document.ocr'
      );
      res.json(ocrResult);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Careflow & Consultations API
  app.get('/api/careflow/:visitId', (req, res) => {
    const visit = db.visits.get(req.params.visitId);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });

    const patient = db.findPatientByUhid(visit.uhid);
    const consultation = Array.from(db.consultations.values()).find(c => c.visitId === visit.id);
    const labOrder = Array.from(db.labOrders.values()).find(l => l.visitId === visit.id);
    const pharmacyOrder = Array.from(db.pharmacyOrders.values()).find(p => p.visitId === visit.id);

    res.json({
      visit,
      patient,
      consultation,
      labOrder,
      pharmacyOrder,
    });
  });

  app.post('/api/consultations', (req, res) => {
    try {
      const { visitId, consultationData } = req.body;
      const result = db.completeConsultation(visitId, consultationData);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 7. Lab Orders API
  app.get('/api/lab/orders', (req, res) => {
    res.json(Array.from(db.labOrders.values()));
  });

  app.post('/api/lab/orders/:id/sample', (req, res) => {
    const order = db.labOrders.get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Lab order not found' });
    order.status = 'SAMPLE_COLLECTED';
    order.sampleCollectedAt = new Date().toISOString();
    res.json(order);
  });

  app.post('/api/lab/orders/:id/result', (req, res) => {
    const order = db.labOrders.get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Lab order not found' });
    order.status = 'READY';
    order.readyAt = new Date().toISOString();
    if (req.body.results) order.results = req.body.results;
    if (req.body.doctorRemarks) order.doctorRemarks = req.body.doctorRemarks;
    res.json(order);
  });

  // 8. Pharmacy Orders API
  app.get('/api/pharmacy/orders', (req, res) => {
    res.json(Array.from(db.pharmacyOrders.values()));
  });

  app.post('/api/pharmacy/orders/:id/dispense', (req, res) => {
    const order = db.pharmacyOrders.get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Pharmacy order not found' });
    order.status = 'DISPENSED';
    order.dispensedAt = new Date().toISOString();
    order.medicines.forEach(m => (m.dispensed = true));

    // Update parent visit if pending
    const visit = db.visits.get(order.visitId);
    if (visit && visit.status === 'PHARMACY_PENDING') {
      visit.status = 'COMPLETED';
    }

    res.json(order);
  });

  // 9. Navigation & RAG API
  app.get('/api/hospital/route', (req, res) => {
    const dest = String(req.query.dest || 'dept-gm');
    const route = db.getNavigationRoute(dest);
    res.json(route);
  });

  app.post('/api/hospital/rag', (req, res) => {
    const { question, lang } = req.body;
    const result = KnowledgeRAGAgent.query(question || '', lang || 'en');
    res.json(result);
  });

  // 10. Staff & Kiosk Status API
  app.get('/api/staff/alerts', (req, res) => {
    res.json(Array.from(db.staffAlerts.values()));
  });

  app.post('/api/staff/alerts', async (req, res) => {
    try {
      const toolRes = await executeMCPTool('staff.request_assistance', req.body, {
        kioskId: req.body.kioskId,
        actor: 'KIOSK_USER',
      });
      res.json(toolRes.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/staff/alerts/:id/resolve', (req, res) => {
    const alert = db.staffAlerts.get(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    res.json(alert);
  });

  app.get('/api/kiosks/status', (req, res) => {
    res.json(Array.from(db.kiosks.values()));
  });

  // 11. Agent Chat & Observability API
  app.post('/api/agent/chat', async (req, res) => {
    try {
      const { message, lang, kioskId } = req.body;
      const agentResponse = await ConversationAgent.handle(message || '', lang || 'en', kioskId || 'KIOSK-01');
      res.json(agentResponse);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/agent/traces', (req, res) => {
    res.json(db.agentTraces);
  });

  app.get('/api/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  app.get('/api/mcp/tools', (req, res) => {
    res.json(MCP_TOOLS);
  });

  app.get('/api/analytics', (req, res) => {
    res.json(db.getAnalytics());
  });

  // ===================== Vite Middleware / Production Static =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI CareFlow Kiosk Hospital Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
