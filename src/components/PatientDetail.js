import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, User, Calendar, Activity, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const PatientDetail = ({ patient, clinicalActions, onActionUpdate, showTimelineOnly = false }) => {
  const [expandedActions, setExpandedActions] = useState(new Set());

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const toggleActionExpansion = (actionId) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const handleStatusUpdate = (actionId, newStatus) => {
    onActionUpdate(actionId, { status: newStatus });
  };

  const sortedActions = [...clinicalActions].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (showTimelineOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Care Timeline - {patient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedActions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No clinical actions recorded for this patient
              </div>
            ) : (
              sortedActions.map((action) => (
                <div
                  key={action.id}
                  className={`timeline-item slide-in ${getPriorityColor(action.priority)}`}
                >
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(action.status)}
                        <div className="font-medium">{action.title}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(action.status)}`}>
                        {action.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {action.description}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div>
                        <strong>Type:</strong> {action.type}
                      </div>
                      <div>
                        <strong>From:</strong> {action.initiatedBy} ({action.initiatedByDepartment})
                      </div>
                      <div>
                        <strong>Assigned to:</strong> {action.assignedTo}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(action.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {action.updatedAt !== action.createdAt && (
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Last updated:</strong> {new Date(action.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{patient.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Age/Gender</div>
              <div className="font-medium">{patient.age} • {patient.gender}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Blood Group</div>
              <div className="font-medium">{patient.bloodGroup}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium capitalize">{patient.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Condition</div>
              <div className="font-medium text-blue-600">{patient.condition}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Admission Date</div>
              <div className="font-medium">{new Date(patient.admissionDate).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Actions Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Clinical Actions Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedActions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No clinical actions recorded for this patient
              </div>
            ) : (
              sortedActions.map((action) => (
                <div
                  key={action.id}
                  className={`timeline-item slide-in ${getPriorityColor(action.priority)}`}
                >
                  <div 
                    className="bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => toggleActionExpansion(action.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(action.status)}
                        <div className="font-medium">{action.title}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(action.status)}`}>
                        {action.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {action.description}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div>
                        <strong>Type:</strong> {action.type}
                      </div>
                      <div>
                        <strong>From:</strong> {action.initiatedBy} ({action.initiatedByDepartment})
                      </div>
                      <div>
                        <strong>Assigned to:</strong> {action.assignedTo}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(action.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {expandedActions.has(action.id) && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Update Status:</div>
                        <div className="flex gap-2">
                          {['pending', 'in-progress', 'completed'].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(action.id, status);
                              }}
                              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                action.status === status
                                  ? getStatusColor(status)
                                  : 'bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetail;
