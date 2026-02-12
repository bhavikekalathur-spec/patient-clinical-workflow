import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import ClinicalActionForm from './components/ClinicalActionForm';
import DepartmentView from './components/DepartmentView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Activity, Users, FileText, Building } from 'lucide-react';

const socket = io('http://localhost:5000');

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalActions, setClinicalActions] = useState([]);
  const [activeTab, setActiveTab] = useState('patients');

  useEffect(() => {
    // Fetch initial data
    fetchPatients();
    fetchClinicalActions();

    // Set up real-time listeners
    socket.on('clinicalActionCreated', (action) => {
      setClinicalActions(prev => [...prev, action]);
    });

    socket.on('clinicalActionUpdated', (action) => {
      setClinicalActions(prev => 
        prev.map(a => a.id === action.id ? action : a)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchClinicalActions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/clinical-actions');
      const data = await response.json();
      setClinicalActions(data);
    } catch (error) {
      console.error('Error fetching clinical actions:', error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    if (patient) {
      socket.emit('joinPatientRoom', patient.id);
    }
  };

  const handleActionCreate = async (actionData) => {
    try {
      const response = await fetch('http://localhost:5000/api/clinical-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData),
      });
      
      if (response.ok) {
        // Real-time update will be handled by socket listener
      }
    } catch (error) {
      console.error('Error creating clinical action:', error);
    }
  };

  const handleActionUpdate = async (actionId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/clinical-actions/${actionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        // Real-time update will be handled by socket listener
      }
    } catch (error) {
      console.error('Error updating clinical action:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient-Centric Clinical Workflow
          </h1>
          <p className="text-gray-600">
            Real-time coordination and visibility for patient care
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PatientList 
                  patients={patients} 
                  onPatientSelect={handlePatientSelect}
                  selectedPatient={selectedPatient}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <PatientDetail 
                    patient={selectedPatient}
                    clinicalActions={clinicalActions.filter(action => action.patientId === selectedPatient.id)}
                    onActionUpdate={handleActionUpdate}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      Select a patient to view details
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            {selectedPatient ? (
              <PatientDetail 
                patient={selectedPatient}
                clinicalActions={clinicalActions.filter(action => action.patientId === selectedPatient.id)}
                onActionUpdate={handleActionUpdate}
                showTimelineOnly={true}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Select a patient to view their care timeline
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClinicalActionForm 
                patients={patients}
                onActionCreate={handleActionCreate}
                selectedPatient={selectedPatient}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Recent Actions</CardTitle>
                  <CardDescription>
                    Latest clinical actions across all patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clinicalActions.slice(-5).reverse().map(action => (
                      <div key={action.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.type} - {action.status}</div>
                        <div className="text-xs text-gray-500">
                          Patient: {patients.find(p => p.id === action.patientId)?.name || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentView 
              clinicalActions={clinicalActions}
              patients={patients}
              onActionUpdate={handleActionUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
