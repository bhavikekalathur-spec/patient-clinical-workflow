import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User } from 'lucide-react';

const PatientList = ({ patients, onPatientSelect, selectedPatient }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted':
        return 'bg-green-100 text-green-800';
      case 'discharged':
        return 'bg-gray-100 text-gray-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onPatientSelect(patient)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedPatient?.id === patient.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900">{patient.name}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Age: {patient.age} • {patient.gender}</div>
                <div>Blood Group: {patient.bloodGroup}</div>
                <div className="text-xs text-gray-500">
                  Admitted: {new Date(patient.admissionDate).toLocaleDateString()}
                </div>
                <div className="text-xs font-medium text-blue-600">
                  {patient.condition}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientList;
