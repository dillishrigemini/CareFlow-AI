import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Phone, 
  CreditCard, 
  Check, 
  UserPlus, 
  ArrowRight, 
  Calendar, 
  Heart,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { LanguageCode, Patient } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface PatientIdentificationProps {
  currentLang: LanguageCode;
  mode: 'existing' | 'new';
  onPatientIdentified: (patient: Patient) => void;
  onCancel: () => void;
  onRequestStaffHelp: (reason: string) => void;
}

export const PatientIdentification: React.FC<PatientIdentificationProps> = ({
  currentLang,
  mode,
  onPatientIdentified,
  onCancel,
  onRequestStaffHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>(mode);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // New Patient Form State
  const [newForm, setNewForm] = useState({
    name: '',
    nameTa: '',
    age: '',
    gender: 'MALE' as Patient['gender'],
    mobile: '',
    address: '',
    bloodGroup: 'O+',
    isSeniorCitizen: false,
    isPregnant: false,
    isDisabled: false,
  });

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    sounds.playClick();
    setHasSearched(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 1) {
        setSelectedPatient(data[0]);
      }
    } catch (err) {
      console.error('Patient search error:', err);
    }
  };

  const handleCreateNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.age || !newForm.mobile) return;
    sounds.playClick();

    const ageNum = Number(newForm.age);
    const isSenior = ageNum >= 60 || newForm.isSeniorCitizen;

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newForm.name.trim(),
          nameTa: newForm.nameTa.trim() || undefined,
          age: ageNum,
          gender: newForm.gender,
          mobile: newForm.mobile.trim(),
          address: newForm.address.trim() || 'Tiruvallur District, Tamil Nadu',
          bloodGroup: newForm.bloodGroup,
          languagePreference: currentLang,
          isSeniorCitizen: isSenior,
          isPregnant: newForm.isPregnant,
          isDisabled: newForm.isDisabled,
        }),
      });
      const created: Patient = await res.json();
      sounds.playChime();
      onPatientIdentified(created);
    } catch (err) {
      console.error('Error creating patient:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <User className="w-6 h-6 text-teal-400" />
            <span>
              {activeTab === 'existing' 
                ? t('action_existing_patient', currentLang) 
                : t('action_new_patient', currentLang)}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeTab === 'existing' 
              ? 'Find your hospital record using UHID, Registered Mobile, or ABHA ID' 
              : 'Fill in essential patient information to create your new Government Hospital UHID'}
          </p>
        </div>
        <button
          id="btn-cancel-patient-id"
          onClick={() => {
            sounds.playClick();
            onCancel();
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
        >
          {t('btn_cancel', currentLang)}
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700 max-w-sm">
        <button
          id="tab-existing-patient"
          onClick={() => {
            sounds.playClick();
            setActiveTab('existing');
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'existing' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('action_existing_patient', currentLang).split(' ')[0]}
        </button>
        <button
          id="tab-new-patient"
          onClick={() => {
            sounds.playClick();
            setActiveTab('new');
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'new' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('action_new_patient', currentLang).split(' ')[0]}
        </button>
      </div>

      {/* Existing Patient Search Section */}
      {activeTab === 'existing' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="input-patient-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter UHID (TN-GH-...), Mobile No (9840...), or Name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-28 py-3.5 text-white placeholder-slate-500 font-medium focus:outline-none focus:border-teal-500 text-sm sm:text-base"
              />
              <button
                id="btn-execute-patient-search"
                onClick={() => handleSearch()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Search
              </button>
            </div>

            {/* Quick Demo Patients */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Test Patients (Pre-seeded in Registry):
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Ramasamy K', uhid: 'TN-GH-2026-00412', dept: 'General Medicine' },
                  { name: 'Kavitha Murugan', uhid: 'TN-GH-2026-00588', dept: 'Orthopaedics' },
                  { name: 'Arumugam P', uhid: 'TN-GH-2026-00701', dept: 'General Medicine (Senior)' },
                  { name: 'Deepa Rajendran', uhid: 'TN-GH-2026-01124', dept: 'Obstetrics' },
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    id={`btn-demo-patient-${idx}`}
                    onClick={() => {
                      setSearchQuery(demo.uhid);
                      handleSearch(demo.uhid);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-500 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
                  >
                    <span className="font-semibold text-teal-400">{demo.name}</span>
                    <span className="text-slate-500 font-mono">({demo.uhid})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results List */}
          {hasSearched && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Matching Patients ({searchResults.length}):
              </h3>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                  <p className="text-sm text-slate-400">
                    No registered patient found matching &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      id="btn-switch-to-new-patient"
                      onClick={() => setActiveTab('new')}
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
                    >
                      Register as New Patient
                    </button>
                    <button
                      id="btn-search-staff-help"
                      onClick={() => onRequestStaffHelp(`Patient lookup failed for query: ${searchQuery}`)}
                      className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Ask Staff for Help
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    return (
                      <div
                        key={patient.id}
                        id={`card-patient-${patient.id}`}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                          isSelected
                            ? 'bg-teal-950/30 border-teal-500 shadow-md shadow-teal-500/10'
                            : 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white text-base">
                              {patient.name} {patient.nameTa && <span className="text-teal-400 text-sm font-normal">({patient.nameTa})</span>}
                            </h4>
                            <p className="font-mono text-xs text-teal-400 font-semibold mt-0.5">
                              {patient.uhid} • OP: {patient.opNumber}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                          <div>Age/Gender: <strong>{patient.age} / {patient.gender}</strong></div>
                          <div>Mobile: <strong>{patient.mobile}</strong></div>
                          {patient.lastDepartment && (
                            <div className="col-span-2 text-slate-400">
                              Last OP: {patient.lastDepartment} ({patient.lastVisitDate})
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <button
                            id={`btn-proceed-patient-${patient.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              onPatientIdentified(patient);
                            }}
                            className="w-full mt-2 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95"
                          >
                            <span>Confirm &amp; Choose Department</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* New Patient Registration Form */}
      {activeTab === 'new' && (
        <form onSubmit={handleCreateNewPatient} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Patient Full Name (English) *
              </label>
              <input
                id="input-new-name"
                required
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                பெயர் (தமிழ் - விருப்பத்திற்குரியது)
              </label>
              <input
                id="input-new-name-ta"
                type="text"
                value={newForm.nameTa}
                onChange={(e) => setNewForm({ ...newForm, nameTa: e.target.value })}
                placeholder="எ.கா. ரமேஷ் குமார்"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Age (வயது) *
              </label>
              <input
                id="input-new-age"
                required
                type="number"
                min="0"
                max="120"
                value={newForm.age}
                onChange={(e) => {
                  const val = e.target.value;
                  const isSen = Number(val) >= 60;
                  setNewForm({ ...newForm, age: val, isSeniorCitizen: isSen });
                }}
                placeholder="e.g. 45"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender (பாலினம்) *
              </label>
              <select
                id="select-new-gender"
                value={newForm.gender}
                onChange={(e) => setNewForm({ ...newForm, gender: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm"
              >
                <option value="MALE">Male (ஆண்)</option>
                <option value="FEMALE">Female (பெண்)</option>
                <option value="OTHER">Transgender / Other (மற்றவை)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mobile Number (கைபேசி எண்) *
              </label>
              <input
                id="input-new-mobile"
                required
                type="tel"
                maxLength={10}
                value={newForm.mobile}
                onChange={(e) => setNewForm({ ...newForm, mobile: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Blood Group (இரத்த வகை)
              </label>
              <select
                id="select-new-blood"
                value={newForm.bloodGroup}
                onChange={(e) => setNewForm({ ...newForm, bloodGroup: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Village / Town / Address (முகவரி)
              </label>
              <input
                id="input-new-address"
                type="text"
                value={newForm.address}
                onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                placeholder="Door No, Street Name, Village/Taluk, District"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Priority Status Badges (Government Hospital Priority Triage) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Priority Flags (Fast-track Queue Routing):
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  id="chk-senior"
                  type="checkbox"
                  checked={newForm.isSeniorCitizen}
                  onChange={(e) => setNewForm({ ...newForm, isSeniorCitizen: e.target.checked })}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-200">Senior Citizen (60+ years)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  id="chk-pregnant"
                  type="checkbox"
                  checked={newForm.isPregnant}
                  onChange={(e) => setNewForm({ ...newForm, isPregnant: e.target.checked })}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-200">Pregnant Woman (கர்ப்பிணி தாய்)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  id="chk-disabled"
                  type="checkbox"
                  checked={newForm.isDisabled}
                  onChange={(e) => setNewForm({ ...newForm, isDisabled: e.target.checked })}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-slate-200">Divyang / Person with Disability (மாற்றுத்திறனாளி)</span>
              </label>
            </div>
          </div>

          <button
            id="btn-submit-new-patient"
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-98 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>Generate UHID &amp; Proceed to OPD Registration</span>
          </button>
        </form>
      )}
    </div>
  );
};
