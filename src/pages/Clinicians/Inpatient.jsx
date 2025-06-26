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
  Bed,
  Utensils,
  HeartPulse,
  ClipboardList,
  Syringe,
  Thermometer,
  Weight
} from 'lucide-react';
import { patientAPI } from '../../services/api';

const InpatientSystem = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [history, setHistory] = useState('');
  const [labRequests, setLabRequests] = useState([]);
  const [imagingRequests, setImagingRequests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [nursingNotes, setNursingNotes] = useState([]);
  const [meals, setMeals] = useState([]);
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
  const [newVitalSign, setNewVitalSign] = useState({
    type: 'BP',
    value: '',
    time: new Date().toLocaleTimeString(),
  });
  const [newNursingNote, setNewNursingNote] = useState('');
  const [newMeal, setNewMeal] = useState({
    type: 'Breakfast',
    description: '',
    time: new Date().toLocaleTimeString(),
  });

  const patients = [
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      condition: 'Pneumonia',
      admissionDate: '2025-06-10',
      room: '304B',
      bed: '2',
      department: 'Internal Medicine',
      status: 'Stable',
      mrn: 'MRN001',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      condition: 'Post-op Hysterectomy',
      admissionDate: '2025-06-08',
      room: '205A',
      bed: '1',
      department: 'Gynecology',
      status: 'Recovering',
      mrn: 'MRN002',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      age: 28,
      condition: 'Fractured Femur',
      admissionDate: '2025-06-05',
      room: '102C',
      bed: '3',
      department: 'Orthopedics',
      status: 'Stable',
      mrn: 'MRN003',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      age: 38,
      condition: 'CHF Exacerbation',
      admissionDate: '2025-06-12',
      room: '401D',
      bed: '1',
      department: 'Cardiology',
      status: 'Critical',
      mrn: 'MRN004',
    },
  ];

  useEffect(() => {
    if (history.length > 10) {
      const suggestions = generateAISuggestions(history);
      setAiSuggestions(suggestions);
    } else {
      setAiSuggestions([]);
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

    if (lowerText.includes('pneumonia') || lowerText.includes('respiratory')) {
      suggestions.push({
        type: 'diagnosis',
        text: 'Consider: Bacterial vs Viral Pneumonia',
        confidence: 92,
      });
      suggestions.push({
        type: 'lab',
        text: 'Recommended: CBC, CRP, Blood Culture',
        confidence: 95,
      });
      suggestions.push({
        type: 'prescription',
        text: 'Consider: Ceftriaxone + Azithromycin',
        confidence: 87,
      });
    }

    if (lowerText.includes('post-op') || lowerText.includes('surgical')) {
      suggestions.push({
        type: 'monitoring',
        text: 'Monitor: Pain levels, wound site, vitals q4h',
        confidence: 89,
      });
      suggestions.push({
        type: 'prescription',
        text: 'Consider: Analgesics, Antibiotics',
        confidence: 85,
      });
    }

    return suggestions;
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('overview');
    setHistory('');
    setLabRequests([]);
    setImagingRequests([]);
    setPrescriptions([]);
    setVitalSigns([]);
    setNursingNotes([]);
    setMeals([]);
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

  const addPrescription = async () => {
    if (newPrescription.medication.trim() && selectedPatient) {
      try {
        await patientAPI.createPrescription(selectedPatient.id, {
          doctor_id: /* get doctor id from context or state */ 1,
          medications: newPrescription.medication,
          dosage: newPrescription.dosage,
          instructions: `${newPrescription.frequency} for ${newPrescription.duration}`
        });
        // Optionally refresh local state or show a success message
        setNewPrescription({
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
        });
      } catch (err) {
        alert('Failed to create prescription');
      }
    }
  };

  const addVitalSign = () => {
    if (newVitalSign.value.trim()) {
      setVitalSigns([
        ...vitalSigns,
        {
          id: Date.now(),
          ...newVitalSign,
          recordedAt: new Date().toLocaleString(),
        },
      ]);
      setNewVitalSign({
        type: 'BP',
        value: '',
        time: new Date().toLocaleTimeString(),
      });
    }
  };

  const addNursingNote = () => {
    if (newNursingNote.trim()) {
      setNursingNotes([
        ...nursingNotes,
        {
          id: Date.now(),
          note: newNursingNote,
          recordedAt: new Date().toLocaleString(),
        },
      ]);
      setNewNursingNote('');
    }
  };

  const addMeal = () => {
    if (newMeal.description.trim()) {
      setMeals([
        ...meals,
        {
          id: Date.now(),
          ...newMeal,
          recordedAt: new Date().toLocaleString(),
        },
      ]);
      setNewMeal({
        type: 'Breakfast',
        description: '',
        time: new Date().toLocaleTimeString(),
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
      "The patient's condition suggests monitoring oxygen saturation every 4 hours would be beneficial.",
      'Consider prescribing IV fluids and monitoring intake/output.',
      'The vital signs indicate monitoring blood pressure is essential.',
      'I suggest scheduling a specialist consultation based on these findings.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical':
        return 'status-critical';
      case 'Stable':
        return 'status-stable';
      case 'Recovering':
        return 'status-recovering';
      case 'Improving':
        return 'status-improving';
      default:
        return 'status-default';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'history', label: 'History', icon: FileText },
    { id: 'labs', label: 'Lab Orders', icon: TestTube },
    { id: 'imaging', label: 'Imaging', icon: Scan },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'vitals', label: 'Vital Signs', icon: Thermometer },
    { id: 'nursing', label: 'Nursing Notes', icon: HeartPulse },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  ];

  return (
    <div className="inpatient-container">
      <div className="max-container">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-title">
              <Bed size={32} color="#2563eb" />
              <h1>Inpatient Care</h1>
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
                Inpatient List
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
                      <p>Room: {patient.room} • Bed: {patient.bed}</p>
                      <p className="last-visit">Admitted: {patient.admissionDate}</p>
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
                      <div className="patient-location">
                        <span className="location-item">
                          <Bed size={16} />
                          Room: {selectedPatient.room} • Bed: {selectedPatient.bed}
                        </span>
                        <span className="location-item">
                          <Stethoscope size={16} />
                          Department: {selectedPatient.department}
                        </span>
                      </div>
                    </div>
                    <div className="session-time">
                      <Clock size={16} />
                      <span>Admitted: {selectedPatient.admissionDate}</span>
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
                  {activeTab === 'overview' && (
                    <div>
                      <div className="overview-section">
                        <h3 className="overview-title">
                          <HeartPulse size={18} />
                          Current Status
                        </h3>
                        <p>{selectedPatient.name} is currently {selectedPatient.status.toLowerCase()} in {selectedPatient.department}.</p>
                        <p>Primary diagnosis: {selectedPatient.condition}</p>
                      </div>

                      <div className="overview-section">
                        <h3 className="overview-title">
                          <Thermometer size={18} />
                          Recent Vital Signs
                        </h3>
                        {vitalSigns.length > 0 ? (
                          <div className="vitals-grid">
                            {vitalSigns.slice(0, 6).map((vital) => (
                              <div key={vital.id} className="vital-card">
                                <div className="vital-label">{vital.type}</div>
                                <div className="vital-value">{vital.value}</div>
                                <div className="vital-time">{vital.time}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No vital signs recorded yet.</p>
                        )}
                      </div>

                      <div className="overview-section">
                        <h3 className="overview-title">
                          <Utensils size={18} />
                          Recent Meals
                        </h3>
                        {meals.length > 0 ? (
                          <div className="item-list">
                            {meals.slice(0, 3).map((meal) => (
                              <div key={meal.id} className="meal-card">
                                <div className="meal-header">
                                  <span className="meal-type">{meal.type}</span>
                                  <span className="meal-time">{meal.time}</span>
                                </div>
                                <p className="meal-description">{meal.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No meal records yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div>
                      <div className="form-row">
                        <h3>Patient History & Progress Notes</h3>
                        <button className="upload-btn">
                          <Upload size={16} />
                          <span>Upload Files</span>
                        </button>
                      </div>
                      <textarea
                        value={history}
                        onChange={(e) => setHistory(e.target.value)}
                        placeholder="Enter patient history, progress notes, examination findings..."
                        className="textarea"
                      />
                      <button className="btn btn-blue" style={{ marginTop: '1rem' }}>
                        <Save size={16} />
                        <span>Save Notes</span>
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
                              <span className="status-badge status-default">
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
                              <span className="status-badge status-default">
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
                          placeholder="Medication"
                          className="input"
                        />
                        <input
                          type="text"
                          value={newPrescription.dosage}
                          onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                          placeholder="Dosage"
                          className="input"
                        />
                        <input
                          type="text"
                          value={newPrescription.frequency}
                          onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                          placeholder="Frequency"
                          className="input"
                        />
                        <input
                          type="text"
                          value={newPrescription.duration}
                          onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                          placeholder="Duration"
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
                              <span className="status-badge status-stable">
                                Active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'vitals' && (
                    <div>
                      <h3>Vital Signs</h3>
                      <div className="input-row">
                        <select
                          value={newVitalSign.type}
                          onChange={(e) => setNewVitalSign({...newVitalSign, type: e.target.value})}
                          className="input"
                        >
                          <option value="BP">Blood Pressure</option>
                          <option value="HR">Heart Rate</option>
                          <option value="RR">Respiratory Rate</option>
                          <option value="Temp">Temperature</option>
                          <option value="SpO2">Oxygen Saturation</option>
                          <option value="Weight">Weight</option>
                        </select>
                        <input
                          type="text"
                          value={newVitalSign.value}
                          onChange={(e) => setNewVitalSign({...newVitalSign, value: e.target.value})}
                          placeholder="Value"
                          className="input input-flex"
                        />
                        <button onClick={addVitalSign} className="btn btn-green">
                          <Plus size={16} />
                          <span>Add</span>
                        </button>
                      </div>
                      <div className="item-list">
                        {vitalSigns.map((vital) => (
                          <div key={vital.id} className="item-card">
                            <div className="item-header">
                              <div>
                                <p className="item-title">{vital.type}: {vital.value}</p>
                                <p className="item-time">Recorded: {vital.recordedAt}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'nursing' && (
                    <div>
                      <h3>Nursing Notes</h3>
                      <textarea
                        value={newNursingNote}
                        onChange={(e) => setNewNursingNote(e.target.value)}
                        placeholder="Enter nursing notes..."
                        className="textarea"
                        style={{ height: '8rem', marginBottom: '1rem' }}
                      />
                      <button onClick={addNursingNote} className="btn btn-blue">
                        <Plus size={16} />
                        <span>Add Note</span>
                      </button>
                      <div className="item-list">
                        {nursingNotes.map((note) => (
                          <div key={note.id} className="item-card">
                            <p className="item-title">{note.note}</p>
                            <p className="item-time">Recorded: {note.recordedAt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'nutrition' && (
                    <div>
                      <h3>Nutrition & Meals</h3>
                      <div className="input-row">
                        <select
                          value={newMeal.type}
                          onChange={(e) => setNewMeal({...newMeal, type: e.target.value})}
                          className="input"
                        >
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snack</option>
                        </select>
                        <input
                          type="text"
                          value={newMeal.description}
                          onChange={(e) => setNewMeal({...newMeal, description: e.target.value})}
                          placeholder="Description"
                          className="input input-flex"
                        />
                        <button onClick={addMeal} className="btn btn-purple">
                          <Plus size={16} />
                          <span>Add</span>
                        </button>
                      </div>
                      <div className="item-list">
                        {meals.map((meal) => (
                          <div key={meal.id} className="meal-card">
                            <div className="meal-header">
                              <span className="meal-type">{meal.type}</span>
                              <span className="meal-time">{meal.time}</span>
                            </div>
                            <p className="meal-description">{meal.description}</p>
                            <p className="item-time">Recorded: {meal.recordedAt}</p>
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
                  <User size={48} color="#9ca3af" />
                  <h2>Select a patient to view details</h2>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="card ai-panel">
            <div className="card-header">
              <div className="card-title">
                <Bot size={20} color="#9333ea" style={{ marginRight: '0.5rem' }} />
                AI Clinical Assistant
              </div>
              <div className="ai-status">
                <div className="status-dot"></div>
                <span className="status-text">Analyzing patient data</span>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="suggestions-section">
              <h3 className="suggestions-title">
                <Activity size={16} />
                Clinical Suggestions
              </h3>
              <div className="suggestions-list">
                {aiSuggestions.length > 0 ? (
                  aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <div className="suggestion-header">
                        <span className={`suggestion-type type-${suggestion.type}`}>
                          {suggestion.type}
                        </span>
                        <span className="suggestion-confidence">
                          Confidence: {suggestion.confidence}%
                        </span>
                      </div>
                      <p className="suggestion-text">{suggestion.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="suggestions-empty">
                    {selectedPatient
                      ? "Start typing in the history section to get AI suggestions"
                      : "Select a patient to get AI suggestions"}
                  </p>
                )}
              </div>
            </div>

            {/* AI Chat */}
            <div className="chat-section">
              <h3 className="chat-title">
                <MessageCircle size={16} />
                Ask the AI Assistant
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
            <div className="chat-input-section">
              <div className="chat-input-row">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a clinical question..."
                  className="chat-input"
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <button onClick={sendChatMessage} className="send-btn">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .inpatient-container {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 1rem;
          padding-top: 80px;
          padding-bottom: 80px;
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

        .status-critical {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .status-stable {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-recovering {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .status-improving {
          background-color: #e9d5ff;
          color: #7e22ce;
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

        .patient-title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .patient-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .patient-location {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .location-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
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
          gap: 1rem;
          padding: 0 1rem;
          overflow-x: auto;
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
          white-space: nowrap;
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
          background-color: #2563eb;          color: white;
        }

        .btn-blue:hover {
          background-color: #1d4ed8;
        }

        .btn-green {
          background-color: #059669;
          color: white;
        }

        .btn-green:hover {
          background-color: #047857;
        }

        .btn-purple {
          background-color: #7c3aed;
          color: white;
        }

        .btn-purple:hover {
          background-color: #6d28d9;
        }

        .btn-indigo {
          background-color: #4f46e5;
          color: white;
        }

        .btn-indigo:hover {
          background-color: #4338ca;
        }

        .item-list {
          max-height: 20rem;
          overflow-y: auto;
        }

        .item-card {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          background-color: #f9fafb;
        }

        .item-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .item-title {
          font-weight: 500;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }

        .item-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .item-time {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0.25rem 0 0 0;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .vital-card {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          text-align: center;
          background-color: #f9fafb;
        }

        .vital-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .vital-value {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .vital-time {
          font-size: 0.625rem;
          color: #9ca3af;
        }

        .meal-card {
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          background-color: #f9fafb;
        }

        .meal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .meal-type {
          font-weight: 500;
          color: #111827;
        }

        .meal-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .meal-description {
          font-size: 0.875rem;
          color: #4b5563;
          margin: 0;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 20rem;
        }

        .empty-content {
          text-align: center;
          color: #9ca3af;
        }

        .empty-content h2 {
          font-size: 1.125rem;
          font-weight: 500;
          margin-top: 1rem;
        }

        .ai-panel {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 12rem);
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .status-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background-color: #10b981;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        .suggestions-section {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .suggestions-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .suggestions-list {
          max-height: 16rem;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 0.75rem;
          border-radius: 0.375rem;
          background-color: #f9fafb;
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
          background-color: #dbeafe;
          color: #1e40af;
        }

        .type-lab {
          background-color: #d1fae5;
          color: #065f46;
        }

        .type-imaging {
          background-color: #e9d5ff;
          color: #7e22ce;
        }

        .type-prescription {
          background-color: #fce7f3;
          color: #be185d;
        }

        .type-monitoring {
          background-color: #fef3c7;
          color: #92400e;
        }

        .suggestion-confidence {
          font-size: 0.625rem;
          color: #6b7280;
        }

        .suggestion-text {
          font-size: 0.875rem;
          color: #374151;
          margin: 0;
        }

        .suggestions-empty {
          font-size: 0.875rem;
          color: #9ca3af;
          text-align: center;
          padding: 1rem 0;
        }

        .chat-section {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chat-message {
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          max-width: 80%;
        }

        .message-user {
          align-self: flex-end;
          background-color: #2563eb;
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .message-ai {
          align-self: flex-start;
          background-color: #f3f4f6;
          color: #111827;
          border-bottom-left-radius: 0.25rem;
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
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .chat-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border: none;
          border-radius: 0.375rem;
          background-color: #9333ea;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-btn:hover {
          background-color: #7e22ce;
        }

        .overview-section {
          margin-bottom: 1.5rem;
        }

        .overview-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.75rem 0;
        }
      `}</style>
    </div>
  );
};

export default InpatientSystem;