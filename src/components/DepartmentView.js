import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Building, Clock, CheckCircle, Activity, Circle, AlertCircle } from 'lucide-react';

const DepartmentView = ({ clinicalActions, patients, onActionUpdate }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const departments = ['all', 'Pharmacy', 'Diagnostics', 'Nursing', 'Referrals', 'Laboratory', 'Radiology'];

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

  const filteredActions = selectedDepartment === 'all' 
    ? clinicalActions 
    : clinicalActions.filter(action => action.assignedTo === selectedDepartment);

  const getStatusCounts = (actions) => {
    return {
      pending: actions.filter(a => a.status === 'pending').length,
      inProgress: actions.filter(a => a.status === 'in-progress').length,
      completed: actions.filter(a => a.status === 'completed').length,
      total: actions.length
    };
  };

  const handleStatusUpdate = (actionId, newStatus) => {
    onActionUpdate(actionId, { status: newStatus });
  };

  const departmentStats = departments.slice(1).map(dept => {
    const deptActions = clinicalActions.filter(action => action.assignedTo === dept);
    return {
      name: dept,
      ...getStatusCounts(deptActions)
    };
  });

  return (
    <div className="space-y-6">
      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="border rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-3">{dept.name}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium text-yellow-600">{dept.pending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Progress:</span>
                    <span className="font-medium text-blue-600">{dept.inProgress}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">{dept.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Total:</span>
                    <span>{dept.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Department Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Department:
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredActions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No actions found for {selectedDepartment === 'all' ? 'any department' : selectedDepartment}
              </div>
            ) : (
              filteredActions.map((action) => {
                const patient = patients.find(p => p.id === action.patientId);
                return (
                  <div
                    key={action.id}
                    className={`border rounded-lg p-4 ${getPriorityColor(action.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(action.status)}
                          <span className="font-medium">{action.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(action.status)}`}>
                            {action.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {action.description}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>
                            <strong>Patient:</strong> {patient?.name || 'Unknown'}
                          </span>
                          <span>
                            <strong>Type:</strong> {action.type}
                          </span>
                          <span>
                            <strong>From:</strong> {action.initiatedBy}
                          </span>
                          <span>
                            <strong>Priority:</strong> {action.priority}
                          </span>
                          <span>
                            <strong>Created:</strong> {new Date(action.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      {action.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(action.id, 'in-progress')}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Start Working
                        </button>
                      )}
                      {action.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusUpdate(action.id, 'completed')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      {action.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusUpdate(action.id, 'cancelled')}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentView;
