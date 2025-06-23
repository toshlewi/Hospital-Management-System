import React, { useState, useEffect } from 'react';
import {
  Send,
  FileText,
  Upload,
  TestTube,
  Scan,
  Pill,
  User,
  Calendar,
  Clock,
  Plus,
  Save,
  Bot,
  MessageCircle,
  Eye,
  Activity,
  Stethoscope,
  AlertCircle,
} from 'lucide-react';

const OutpatientSystem = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState('');
  const [labRequests, setLabRequests] = useState([]);
  const [imagingRequests, setImagingRequests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [newLabRequest, setNewLabRequest] = useState('');
  const [newImagingRequest, setNewImagingRequest] = useState('');
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
  });

  const [patients] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      condition: 'Hypertension',
      lastVisit: '2025-06-10',
      status: 'Waiting',
      mrn: 'MRN001',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      condition: 'Type 2 Diabetes',
      lastVisit: '2025-06-08',
      status: 'In Progress',
      mrn: 'MRN002',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      age: 28,
      condition: 'Asthma',
      lastVisit: '2025-06-05',
      status: 'Completed',
      mrn: 'MRN003',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      age: 38,
      condition: 'Migraine',
      lastVisit: '2025-06-12',
      status: 'Waiting',
      mrn: 'MRN004',
    },
  ]);

  // Simulate AI suggestions based on what's being typed
  useEffect(() => {
    if (history.length > 10) {
      const suggestions = generateAISuggestions(history);
      setAiSuggestions(suggestions);
    }
  }, [history]);

  const generateAISuggestions = (text) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('chest pain') || lowerText.includes('cardiac')) {
      suggestions.push({
        type: 'diagnosis',
        text: 'Consider: Angina, MI, Pericarditis',
        confidence: 85,
      });
      suggestions.push({
        type: 'lab',
        text: 'Recommended: Troponin, CK-MB, D-dimer',
        confidence: 90,
      });
      suggestions.push({
        type: 'imaging',
        text: 'Consider: ECG, Chest X-ray, Echo',
        confidence: 88,
      });
    }

    if (lowerText.includes('diabetes') || lowerText.includes('glucose')) {
      suggestions.push({
        type: 'diagnosis',
        text: 'Monitor: HbA1c, diabetic complications',
        confidence: 92,
      });
      suggestions.push({
        type: 'lab',
        text: 'Recommended: HbA1c, FBG, Lipid profile',
        confidence: 95,
      });
    }

    if (lowerText.includes('hypertension') || lowerText.includes('bp')) {
      suggestions.push({
        type: 'prescription',
        text: 'Consider: ACE inhibitors, ARBs',
        confidence: 87,
      });
    }

    return suggestions;
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('history');
    // Reset forms when switching patients
    setHistory('');
    setLabRequests([]);
    setImagingRequests([]);
    setPrescriptions([]);
    setAiSuggestions([]);
  };

  const addLabRequest = () => {
    if (newLabRequest.trim()) {
      setLabRequests([
        ...labRequests,
        {
          id: Date.now(),
          test: newLabRequest,
          status: 'Pending',
          requestedAt: new Date().toLocaleString(),
        },
      ]);
      setNewLabRequest('');
    }
  };

  const addImagingRequest = () => {
    if (newImagingRequest.trim()) {
      setImagingRequests([
        ...imagingRequests,
        {
          id: Date.now(),
          study: newImagingRequest,
          status: 'Pending',
          requestedAt: new Date().toLocaleString(),
        },
      ]);
      setNewImagingRequest('');
    }
  };

  const addPrescription = () => {
    if (newPrescription.medication.trim()) {
      setPrescriptions([
        ...prescriptions,
        {
          id: Date.now(),
          ...newPrescription,
          prescribedAt: new Date().toLocaleString(),
        },
      ]);
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
      });
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      const userMessage = { id: Date.now(), type: 'user', text: chatInput };
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: generateAIResponse(chatInput),
      };
      setChatMessages([...chatMessages, userMessage, aiResponse]);
      setChatInput('');
    }
  };

  const generateAIResponse = (input) => {
    const responses = [
      'Based on the symptoms, I recommend ordering CBC and comprehensive metabolic panel.',
      "The patient's history suggests a follow-up cardiac workup would be beneficial.",
      'Consider prescribing a proton pump inhibitor for the gastric symptoms.',
      'The vital signs indicate monitoring blood pressure is essential.',
      'I suggest scheduling a specialist consultation based on these findings.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting':
        return 'status-waiting';
      case 'In Progress':
        return 'status-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const tabs = [
    { id: 'history', label: 'History', icon: FileText },
    { id: 'labs', label: 'Lab Orders', icon: TestTube },
    { id: 'imaging', label: 'Imaging', icon: Scan },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  ];

  return (
    <>
      <style>{`
        .outpatient-container {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 1rem;
          padding-top: 80px; /* Avoid overlap with the header */
          padding-bottom: 80px; /* Avoid overlap with the footer */
        }

        .max-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .header-card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
          padding: 1.5rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h1 {
          font-size: 1.875rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }

        .header-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 1.5rem;
        }

        .card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          margin: 0;
        }

        .patient-list {
          max-height: 24rem;
          overflow-y: auto;
        }

        .patient-item {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .patient-item:hover {
          background-color: #f9fafb;
        }

        .patient-item.selected {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
        }

        .patient-info {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .patient-details h3 {
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }

        .patient-details p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.125rem 0;
        }

        .patient-details .last-visit {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-waiting {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-progress {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-default {
          background-color: #f3f4f6;
          color: #374151;
        }

        .patient-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .patient-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .patient-title {
          h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin: 0;
          }
        }

        .patient-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .session-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .tabs-nav {
          border-bottom: 1px solid #e5e7eb;
        }

        .tabs-list {
          display: flex;
          gap: 2rem;
          padding: 0 1rem;
        }

        .tab-button {
          padding: 0.75rem 0.25rem;
          border-bottom: 2px solid transparent;
          font-weight: 500;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #374151;
          border-bottom-color: #d1d5db;
        }

        .tab-button.active {
          border-bottom-color: #3b82f6;
          color: #2563eb;
        }

        .tab-content {
          padding: 1rem;
        }

        .form-section {
          margin-bottom: 1rem;
        }

        .form-section h3 {
          font-size: 1.125rem;
          font-weight: 500;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background-color: #f3f4f6;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .upload-btn:hover {
          background-color: #e5e7eb;
        }

        .textarea {
          width: 100%;
          height: 16rem;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          resize: none;
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .input-flex {
          flex: 1;
        }

        .input-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-blue {
          background-color: #2563eb;
          color: white;
        }

        .btn-blue:hover {
          background-color: #1d4ed8;
        }

        .btn-green {
          background-color: #16a34a;
          color: white;
        }

        .btn-green:hover {
          background-color: #15803d;
        }

        .btn-purple {
          background-color: #9333ea;
          color: white;
        }

        .btn-purple:hover {
          background-color: #7c3aed;
        }

        .btn-indigo {
          background-color: #4f46e5;
          color: white;
        }

        .btn-indigo:hover {
          background-color: #4338ca;
        }

        .btn-light {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        .btn-light:hover {
          background-color: #bae6fd;
        }

        .item-list {
          margin-top: 1rem;
        }

        .item-card {
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
        }

        .item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .item-title {
          font-weight: 500;
          color: #111827;
          margin: 0;
        }

        .item-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.125rem 0;
        }

        .item-time {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24rem;
          text-align: center;
        }

        .empty-content h2 {
          font-size: 1.25rem;
          color: #6b7280;
          margin: 1rem 0 0 0;
        }

        .ai-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .ai-status {
          display: flex;
          align-items: center;
          margin-top: 0.25rem;
        }

        .status-dot {
          height: 0.5rem;
          width: 0.5rem;
          background-color: #4ade80;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .status-text {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .suggestions-section {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .suggestions-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .suggestions-list {
          max-height: 12rem;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 0.5rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .suggestion-type {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }

        .type-diagnosis {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .type-lab {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .type-imaging {
          background-color: #e9d5ff;
          color: #7c2d12;
        }

        .type-prescription {
          background-color: #d1fae5;
          color: #065f46;
        }

        .suggestion-confidence {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .suggestion-text {
          font-size: 0.75rem;
          color: #374151;
          margin: 0;
        }

        .suggestions-empty {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }

        .chat-section {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .chat-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .chat-messages {
          margin-bottom: 1rem;
        }

        .chat-message {
          padding: 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .message-user {
          background-color: #dbeafe;
          color: #1e3a8a;
          margin-left: 1rem;
        }

        .message-ai {
          background-color: #f3f4f6;
          color: #111827;
          margin-right: 1rem;
        }

        .chat-input-section {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .chat-input-row {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }

        .chat-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .send-btn {
          padding: 0.5rem 0.75rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-btn:hover {
          background-color: #1d4ed8;
        }
      `}</style>

      <div className="outpatient-container">
        <div className="max-container">
          {/* Header */}
          <div className="header-card">
            <div className="header-content">
              <div className="header-title">
                <Stethoscope size={32} color="#2563eb" />
                <h1>Outpatient Care</h1>
              </div>
              <div className="header-date">
                <Calendar size={16} />
                <span>Today: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-grid">
            {/* Left Panel - Patient List */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <User size={20} color="#2563eb" style={{ marginRight: '0.5rem' }} />
                  Patient Queue
                </h2>
              </div>
              <div className="patient-list">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`patient-item ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                  >
                    <div className="patient-info">
                      <div className="patient-details">
                        <h3>{patient.name}</h3>
                        <p>MRN: {patient.mrn}</p>
                        <p>Age: {patient.age} • {patient.condition}</p>
                        <p className="last-visit">Last visit: {patient.lastVisit}</p>
                      </div>
                      <span className={`status-badge ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Panel - Patient Details */}
            <div className="card">
              {selectedPatient ? (
                <>
                  {/* Patient Header */}
                  <div className="patient-header">
                    <div className="patient-header-content">
                      <div className="patient-title">
                        <h2>{selectedPatient.name}</h2>
                        <p className="patient-subtitle">
                          {selectedPatient.age} years old • {selectedPatient.condition} • MRN: {selectedPatient.mrn}
                        </p>
                      </div>
                      <div className="session-time">
                        <Clock size={16} />
                        <span>Session started: {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="tabs-nav">
                    <div className="tabs-list">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                          >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="tab-content">
                    {activeTab === 'history' && (
                      <div>
                        <div className="form-row">
                          <h3>Patient History & Notes</h3>
                          <button className="upload-btn">
                            <Upload size={16} />
                            <span>Upload Files</span>
                          </button>
                        </div>
                        <textarea
                          value={history}
                          onChange={(e) => setHistory(e.target.value)}
                          placeholder="Enter patient history, symptoms, examination findings..."
                          className="textarea"
                        />
                        <button className="btn btn-blue" style={{ marginTop: '1rem' }}>
                          <Save size={16} />
                          <span>Save History</span>
                        </button>
                      </div>
                    )}

                    {activeTab === 'labs' && (
                      <div>
                        <h3>Laboratory Orders</h3>
                        <div className="input-row">
                          <input
                            type="text"
                            value={newLabRequest}
                            onChange={(e) => setNewLabRequest(e.target.value)}
                            placeholder="Enter lab test (e.g., CBC, CMP, Lipid Panel)"
                            className="input input-flex"
                          />
                          <button onClick={addLabRequest} className="btn btn-green">
                            <Plus size={16} />
                            <span>Add</span>
                          </button>
                        </div>
                        <div className="item-list">
                          {labRequests.map((lab) => (
                            <div key={lab.id} className="item-card">
                              <div className="item-header">
                                <div>
                                  <p className="item-title">{lab.test}</p>
                                  <p className="item-subtitle">Requested: {lab.requestedAt}</p>
                                </div>
                                <span className="status-badge status-waiting">
                                  {lab.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'imaging' && (
                      <div>
                        <h3>Imaging Orders</h3>
                        <div className="input-row">
                          <input
                            type="text"
                            value={newImagingRequest}
                            onChange={(e) => setNewImagingRequest(e.target.value)}
                            placeholder="Enter imaging study (e.g., Chest X-ray, CT Abdomen, MRI Brain)"
                            className="input input-flex"
                          />
                          <button onClick={addImagingRequest} className="btn btn-purple">
                            <Plus size={16} />
                            <span>Add</span>
                          </button>
                        </div>
                        <div className="item-list">
                          {imagingRequests.map((imaging) => (
                            <div key={imaging.id} className="item-card">
                              <div className="item-header">
                                <div>
                                  <p className="item-title">{imaging.study}</p>
                                  <p className="item-subtitle">Requested: {imaging.requestedAt}</p>
                                </div>
                                <span className="status-badge status-waiting">
                                  {imaging.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'prescriptions' && (
                      <div>
                        <h3>Prescriptions</h3>
                        <div className="input-grid">
                          <input
                            type="text"
                            value={newPrescription.medication}
                            onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                            placeholder="Medication name"
                            className="input"
                          />
                          <input
                            type="text"
                            value={newPrescription.dosage}
                            onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                            placeholder="Dosage (e.g., 10mg)"
                            className="input"
                          />
                          <input
                            type="text"
                            value={newPrescription.frequency}
                            onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                            placeholder="Frequency (e.g., twice daily)"
                            className="input"
                          />
                          <input
                            type="text"
                            value={newPrescription.duration}
                            onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                            placeholder="Duration (e.g., 7 days)"
                            className="input"
                          />
                        </div>
                        <button onClick={addPrescription} className="btn btn-indigo">
                          <Plus size={16} />
                          <span>Add Prescription</span>
                        </button>
                        <div className="item-list">
                          {prescriptions.map((prescription) => (
                            <div key={prescription.id} className="item-card">
                              <div className="item-header">
                                <div>
                                  <p className="item-title">{prescription.medication}</p>
                                  <p className="item-subtitle">
                                    {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                                  </p>
                                  <p className="item-time">Prescribed: {prescription.prescribedAt}</p>
                                </div>
                                <button className="btn btn-light">
                                  Print Rx
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-content">
                    <User size={64} color="#d1d5db" />
                    <h2>Select a patient to begin consultation</h2>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - AI Assistant */}
            <div className="card ai-panel">
              <div className="card-header">
                <h2 className="card-title">
                  <Bot size={20} color="#16a34a" style={{ marginRight: '0.5rem' }} />
                  AI Clinical Assistant
                </h2>
                <div className="ai-status">
                  <div className="status-dot"></div>
                  <span className="status-text">Active & Monitoring</span>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="suggestions-section">
                <h3 className="suggestions-title">
                  <Activity size={16} />
                  Real-time Suggestions
                </h3>
                <div className="suggestions-list">
                  {aiSuggestions.length > 0 ? (
                    aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-header">
                          <span className={`suggestion-type ${
                            suggestion.type === 'diagnosis' ? 'type-diagnosis' :
                            suggestion.type === 'lab' ? 'type-lab' :
                            suggestion.type === 'imaging' ? 'type-imaging' :
                            'type-prescription'
                          }`}>
                            {suggestion.type.toUpperCase()}
                          </span>
                          <span className="suggestion-confidence">{suggestion.confidence}%</span>
                        </div>
                        <p className="suggestion-text">{suggestion.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="suggestions-empty">Start typing in the history section to get AI suggestions...</p>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="chat-section">
                <h3 className="chat-title">
                  <MessageCircle size={16} />
                  AI Chat
                </h3>
                <div className="chat-messages">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-message ${
                        message.type === 'user' ? 'message-user' : 'message-ai'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="chat-input-section">
                <div className="chat-input-row">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask AI assistant..."
                    className="chat-input"
                  />
                  <button onClick={sendChatMessage} className="send-btn">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OutpatientSystem;