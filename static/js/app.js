// Global variables
let socket;
let patients = [];
let clinicalActions = [];
let selectedPatient = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    loadInitialData();
    setupEventListeners();
});

// Initialize Socket.IO connection
function initializeSocket() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });
    
    socket.on('clinicalActionCreated', function(action) {
        clinicalActions.push(action);
        updateUI();
        showNotification('New clinical action created: ' + action.title, 'success');
    });
    
    socket.on('clinicalActionUpdated', function(action) {
        const index = clinicalActions.findIndex(a => a.id === action.id);
        if (index !== -1) {
            clinicalActions[index] = action;
            updateUI();
            showNotification('Action updated: ' + action.title, 'info');
        }
    });
    
    socket.on('patientCreated', function(patient) {
        patients.push(patient);
        updateUI();
        showNotification('New patient added: ' + patient.name, 'success');
    });
}

// Load initial data from server
async function loadInitialData() {
    try {
        const [patientsResponse, actionsResponse] = await Promise.all([
            fetch('/api/patients'),
            fetch('/api/clinical-actions')
        ]);
        
        patients = await patientsResponse.json();
        clinicalActions = await actionsResponse.json();
        
        updateUI();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Error loading data', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Action form submission
    document.getElementById('action-form').addEventListener('submit', handleActionSubmit);
    
    // Patient form submission
    document.getElementById('patient-form').addEventListener('submit', handlePatientSubmit);
}

// Handle patient form submission
async function handlePatientSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('patient-name').value,
        age: document.getElementById('patient-age').value,
        gender: document.getElementById('patient-gender').value,
        bloodGroup: document.getElementById('patient-blood').value,
        condition: document.getElementById('patient-condition').value,
        status: document.getElementById('patient-status').value
    };
    
    try {
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            // Reset form
            document.getElementById('patient-form').reset();
            showNotification('Patient added successfully', 'success');
        } else {
            throw new Error('Failed to add patient');
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        showNotification('Error adding patient', 'error');
    }
}

// Handle tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-gray-500');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-blue-500', 'text-blue-600');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load tab-specific content
    if (tabName === 'departments') {
        loadDepartmentView();
    }
}

// Update UI components
function updateUI() {
    updatePatientList();
    updatePatientDetails();
    updateTimeline();
    updateRecentActions();
    updateActionForm();
}

// Update patient list
function updatePatientList() {
    const patientList = document.getElementById('patient-list');
    
    if (patients.length === 0) {
        patientList.innerHTML = '<div class="text-center text-gray-500">No patients found</div>';
        return;
    }
    
    patientList.innerHTML = patients.map(patient => `
        <div onclick="selectPatient('${patient.id}')" class="patient-card p-3 rounded-lg border cursor-pointer ${
            selectedPatient?.id === patient.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }">
            <div class="flex justify-between items-start mb-2">
                <div class="font-medium text-gray-900">${patient.name}</div>
                <span class="text-xs px-2 py-1 rounded-full ${getStatusColor(patient.status)}">
                    ${patient.status}
                </span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <div>Age: ${patient.age} • ${patient.gender}</div>
                <div>Blood Group: ${patient.bloodGroup}</div>
                <div class="text-xs text-gray-500">
                    Admitted: ${new Date(patient.admissionDate).toLocaleDateString()}
                </div>
                <div class="text-xs font-medium text-blue-600">
                    ${patient.condition}
                </div>
            </div>
        </div>
    `).join('');
}

// Update patient details
function updatePatientDetails() {
    const patientDetails = document.getElementById('patient-details');
    
    if (!selectedPatient) {
        patientDetails.innerHTML = '<div class="p-6 text-center text-gray-500">Select a patient to view details</div>';
        return;
    }
    
    const patientActions = clinicalActions.filter(action => action.patientId === selectedPatient.id);
    
    patientDetails.innerHTML = `
        <div class="space-y-6">
            <!-- Patient Information -->
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-user-injured mr-2"></i>Patient Information
                </h2>
            </div>
            <div class="px-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div class="text-sm text-gray-500">Name</div>
                        <div class="font-medium">${selectedPatient.name}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Age/Gender</div>
                        <div class="font-medium">${selectedPatient.age} • ${selectedPatient.gender}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Blood Group</div>
                        <div class="font-medium">${selectedPatient.bloodGroup}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Status</div>
                        <div class="font-medium capitalize">${selectedPatient.status}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Condition</div>
                        <div class="font-medium text-blue-600">${selectedPatient.condition}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Admission Date</div>
                        <div class="font-medium">${new Date(selectedPatient.admissionDate).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
            
            <!-- Clinical Actions Timeline -->
            <div class="px-6 py-4 border-t border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-clock mr-2"></i>Clinical Actions Timeline
                </h2>
            </div>
            <div class="px-6">
                ${renderTimeline(patientActions)}
            </div>
        </div>
    `;
}

// Render timeline
function renderTimeline(actions) {
    if (actions.length === 0) {
        return '<div class="text-center text-gray-500 py-8">No clinical actions recorded for this patient</div>';
    }
    
    const sortedActions = [...actions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return `
        <div class="space-y-4">
            ${sortedActions.map(action => `
                <div class="timeline-item slide-in ${getPriorityClass(action.priority)}">
                    <div class="bg-white p-4 rounded-lg border shadow-sm action-card">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex items-center gap-2">
                                ${getStatusIcon(action.status)}
                                <div class="font-medium">${action.title}</div>
                            </div>
                            <span class="text-xs px-2 py-1 rounded-full border ${getStatusColor(action.status)}">
                                ${action.status}
                            </span>
                        </div>
                        
                        <div class="text-sm text-gray-600 mb-2">
                            ${action.description}
                        </div>
                        
                        <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                            <div><strong>Type:</strong> ${action.type}</div>
                            <div><strong>From:</strong> ${action.initiatedBy} (${action.initiatedByDepartment})</div>
                            <div><strong>Assigned to:</strong> ${action.assignedTo}</div>
                            <div><strong>Created:</strong> ${new Date(action.createdAt).toLocaleString()}</div>
                        </div>
                        
                        ${action.updatedAt !== action.createdAt ? `
                            <div class="text-xs text-gray-500 mt-2">
                                <strong>Last updated:</strong> ${new Date(action.updatedAt).toLocaleString()}
                            </div>
                        ` : ''}
                        
                        <div class="mt-3 pt-3 border-t">
                            <div class="text-sm font-medium mb-2">Update Status:</div>
                            <div class="flex gap-2">
                                ${['pending', 'in-progress', 'completed'].map(status => `
                                    <button onclick="updateActionStatus('${action.id}', '${status}')" 
                                            class="px-3 py-1 text-xs rounded-full border transition-colors ${
                                                action.status === status ? getStatusColor(status) : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }">
                                        ${status}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Update timeline view
function updateTimeline() {
    const timelineContent = document.getElementById('timeline-content');
    
    if (!selectedPatient) {
        timelineContent.innerHTML = '<div class="p-6 text-center text-gray-500">Select a patient to view their care timeline</div>';
        return;
    }
    
    const patientActions = clinicalActions.filter(action => action.patientId === selectedPatient.id);
    
    timelineContent.innerHTML = `
        <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">
                <i class="fas fa-clock mr-2"></i>Care Timeline - ${selectedPatient.name}
            </h2>
        </div>
        <div class="p-6">
            ${renderTimeline(patientActions)}
        </div>
    `;
}

// Update recent actions
function updateRecentActions() {
    const recentActions = document.getElementById('recent-actions');
    
    if (clinicalActions.length === 0) {
        recentActions.innerHTML = '<div class="text-center text-gray-500">No clinical actions found</div>';
        return;
    }
    
    const recent = [...clinicalActions].slice(-5).reverse();
    
    recentActions.innerHTML = recent.map(action => {
        const patient = patients.find(p => p.id === action.patientId);
        return `
            <div class="border-l-4 border-blue-500 pl-4">
                <div class="font-medium">${action.title}</div>
                <div class="text-sm text-gray-600">${action.type} - ${action.status}</div>
                <div class="text-xs text-gray-500">
                    Patient: ${patient?.name || 'Unknown'}
                </div>
            </div>
        `;
    }).join('');
}

// Update action form
function updateActionForm() {
    const patientSelect = document.getElementById('action-patient');
    patientSelect.innerHTML = '<option value="">Select a patient</option>' + 
        patients.map(patient => `
            <option value="${patient.id}" ${selectedPatient?.id === patient.id ? 'selected' : ''}>
                ${patient.name} - ${patient.condition}
            </option>
        `).join('');
}

// Load department view
function loadDepartmentView() {
    const departmentsContent = document.getElementById('departments-content');
    
    // Calculate department statistics
    const departments = ['Pharmacy', 'Diagnostics', 'Nursing', 'Referrals', 'Laboratory', 'Radiology'];
    const departmentStats = departments.map(dept => {
        const deptActions = clinicalActions.filter(action => action.assignedTo === dept);
        return {
            name: dept,
            pending: deptActions.filter(a => a.status === 'pending').length,
            inProgress: deptActions.filter(a => a.status === 'in-progress').length,
            completed: deptActions.filter(a => a.status === 'completed').length,
            total: deptActions.length
        };
    });
    
    departmentsContent.innerHTML = `
        <!-- Department Overview -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-hospital mr-2"></i>Department Overview
                </h2>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${departmentStats.map(dept => `
                        <div class="border rounded-lg p-4">
                            <div class="font-medium text-gray-900 mb-3">${dept.name}</div>
                            <div class="space-y-2">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Pending:</span>
                                    <span class="font-medium text-yellow-600">${dept.pending}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">In Progress:</span>
                                    <span class="font-medium text-blue-600">${dept.inProgress}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">Completed:</span>
                                    <span class="font-medium text-green-600">${dept.completed}</span>
                                </div>
                                <div class="flex justify-between text-sm font-medium pt-2 border-t">
                                    <span>Total:</span>
                                    <span>${dept.total}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- Department Queue -->
        <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">
                    <i class="fas fa-list mr-2"></i>Department Queue
                </h2>
            </div>
            <div class="p-6">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Department:</label>
                    <select id="dept-filter" onchange="filterDepartmentActions(this.value)" class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all">All Departments</option>
                        ${departments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                    </select>
                </div>
                <div id="department-actions" class="space-y-3">
                    ${renderDepartmentActions('all')}
                </div>
            </div>
        </div>
    `;
}

// Render department actions
function renderDepartmentActions(department) {
    const filteredActions = department === 'all' 
        ? clinicalActions 
        : clinicalActions.filter(action => action.assignedTo === department);
    
    if (filteredActions.length === 0) {
        return '<div class="text-center text-gray-500 py-8">No actions found for ' + 
               (department === 'all' ? 'any department' : department) + '</div>';
    }
    
    return filteredActions.map(action => {
        const patient = patients.find(p => p.id === action.patientId);
        return `
            <div class="border rounded-lg p-4 ${getPriorityClass(action.priority)}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            ${getStatusIcon(action.status)}
                            <span class="font-medium">${action.title}</span>
                            <span class="text-xs px-2 py-1 rounded-full border ${getStatusColor(action.status)}">
                                ${action.status}
                            </span>
                        </div>
                        <div class="text-sm text-gray-600 mb-2">
                            ${action.description}
                        </div>
                        <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span><strong>Patient:</strong> ${patient?.name || 'Unknown'}</span>
                            <span><strong>Type:</strong> ${action.type}</span>
                            <span><strong>From:</strong> ${action.initiatedBy}</span>
                            <span><strong>Priority:</strong> ${action.priority}</span>
                            <span><strong>Created:</strong> ${new Date(action.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-2 mt-3 pt-3 border-t">
                    ${action.status === 'pending' ? `
                        <button onclick="updateActionStatus('${action.id}', 'in-progress')" 
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Start Working
                        </button>
                    ` : ''}
                    ${action.status === 'in-progress' ? `
                        <button onclick="updateActionStatus('${action.id}', 'completed')" 
                                class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            Mark Complete
                        </button>
                    ` : ''}
                    ${action.status !== 'completed' ? `
                        <button onclick="updateActionStatus('${action.id}', 'cancelled')" 
                                class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Filter department actions
function filterDepartmentActions(department) {
    const departmentActions = document.getElementById('department-actions');
    departmentActions.innerHTML = renderDepartmentActions(department);
}

// Select patient
function selectPatient(patientId) {
    selectedPatient = patients.find(p => p.id === patientId);
    
    // Leave previous patient room and join new one
    if (selectedPatient) {
        socket.emit('joinPatientRoom', { patientId: selectedPatient.id });
    }
    
    updateUI();
}

// Handle action form submission
async function handleActionSubmit(event) {
    event.preventDefault();
    
    const formData = {
        patientId: document.getElementById('action-patient').value,
        type: document.getElementById('action-type').value,
        title: document.getElementById('action-title').value,
        description: document.getElementById('action-description').value,
        assignedTo: document.getElementById('action-department').value,
        priority: document.querySelector('input[name="priority"]:checked').value,
        initiatedBy: 'Dr. Wilson',
        initiatedByDepartment: 'Doctor'
    };
    
    try {
        const response = await fetch('/api/clinical-actions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            // Reset form
            document.getElementById('action-form').reset();
            showNotification('Clinical action created successfully', 'success');
        } else {
            throw new Error('Failed to create action');
        }
    } catch (error) {
        console.error('Error creating action:', error);
        showNotification('Error creating clinical action', 'error');
    }
}

// Update action status
async function updateActionStatus(actionId, newStatus) {
    try {
        const response = await fetch(`/api/clinical-actions/${actionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update action');
        }
    } catch (error) {
        console.error('Error updating action:', error);
        showNotification('Error updating action status', 'error');
    }
}

// Utility functions
function getStatusColor(status) {
    switch (status) {
        case 'completed': return 'status-completed';
        case 'in-progress': return 'status-in-progress';
        case 'pending': return 'status-pending';
        case 'cancelled': return 'status-cancelled';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed': return '<i class="fas fa-check-circle text-green-600"></i>';
        case 'in-progress': return '<i class="fas fa-spinner text-blue-600"></i>';
        case 'pending': return '<i class="far fa-circle text-yellow-600"></i>';
        case 'cancelled': return '<i class="fas fa-exclamation-circle text-red-600"></i>';
        default: return '<i class="far fa-circle text-gray-400"></i>';
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return '';
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
