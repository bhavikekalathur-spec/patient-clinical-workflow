from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import uuid
from datetime import datetime
import json
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'clinical_workflow_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
CORS(app)

# In-memory data storage
patients = []
clinical_actions = []
departments = ['Doctor', 'Nursing', 'Diagnostics', 'Pharmacy', 'Referrals', 'Laboratory', 'Radiology']

# User credentials (in production, use database and hashed passwords)
users = {
    'admin': {'password': 'admin123', 'role': 'admin', 'name': 'Administrator', 'permissions': ['all']},
    'doctor': {'password': 'doctor123', 'role': 'doctor', 'name': 'Dr. Smith', 'permissions': ['create_patient', 'create_action', 'view_all']},
    'nurse': {'password': 'nurse123', 'role': 'nurse', 'name': 'Nurse Johnson', 'permissions': ['view_patients', 'update_actions', 'create_action']},
    'pharmacy': {'password': 'pharmacy123', 'role': 'pharmacy', 'name': 'Pharmacy Staff', 'permissions': ['view_assigned_actions', 'update_assigned_actions', 'view_patients']},
    'diagnostics': {'password': 'diagnostics123', 'role': 'diagnostics', 'name': 'Diagnostics Staff', 'permissions': ['view_assigned_actions', 'update_assigned_actions', 'view_patients']}
}

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Permission checking decorator
def permission_required(permission):
    def decorator(f):
        @wraps(f)
        @login_required
        def decorated_function(*args, **kwargs):
            user_role = session.get('user_role')
            user_permissions = users.get(user_role, {}).get('permissions', [])
            
            if 'all' in user_permissions or permission in user_permissions:
                return f(*args, **kwargs)
            else:
                return jsonify({'error': 'Insufficient permissions'}), 403
        return decorated_function
    return decorator

def initialize_data():
    """Initialize with sample data"""
    global patients, clinical_actions
    
    # Sample patients
    patients = [
        {
            'id': str(uuid.uuid4()),
            'name': 'John Smith',
            'age': 45,
            'gender': 'Male',
            'bloodGroup': 'O+',
            'admissionDate': '2024-01-15',
            'condition': 'Chest Pain',
            'status': 'admitted'
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Sarah Johnson',
            'age': 32,
            'gender': 'Female',
            'bloodGroup': 'A+',
            'admissionDate': '2024-01-16',
            'condition': 'Fractured Leg',
            'status': 'admitted'
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Michael Chen',
            'age': 58,
            'gender': 'Male',
            'bloodGroup': 'B+',
            'admissionDate': '2024-01-14',
            'condition': 'Diabetes Management',
            'status': 'admitted'
        }
    ]
    
    # Sample clinical actions
    clinical_actions = [
        {
            'id': str(uuid.uuid4()),
            'patientId': patients[0]['id'],
            'type': 'prescription',
            'title': 'Pain Medication',
            'description': 'Prescribe ibuprofen 400mg every 6 hours for chest pain',
            'initiatedBy': 'Dr. Wilson',
            'initiatedByDepartment': 'Doctor',
            'assignedTo': 'Pharmacy',
            'status': 'pending',
            'priority': 'medium',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'patientId': patients[1]['id'],
            'type': 'diagnostic',
            'title': 'X-Ray Imaging',
            'description': 'Perform leg X-ray to assess fracture severity',
            'initiatedBy': 'Dr. Brown',
            'initiatedByDepartment': 'Doctor',
            'assignedTo': 'Diagnostics',
            'status': 'in-progress',
            'priority': 'high',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
    ]

# Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username in users and users[username]['password'] == password:
            session['user_id'] = username
            session['user_role'] = users[username]['role']
            session['user_name'] = users[username]['name']
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/api/patients', methods=['GET'])
@permission_required('view_patients')
def get_patients():
    user_role = session.get('user_role')
    user_permissions = users.get(user_role, {}).get('permissions', [])
    
    # Admin and Doctor can see all patients
    if 'all' in user_permissions or 'view_all' in user_permissions:
        return jsonify(patients)
    # Pharmacy and Diagnostics need to see patient names for their assigned actions
    elif user_role in ['pharmacy', 'diagnostics']:
        # Get patient IDs from actions assigned to this department
        assigned_patient_ids = set(action['patientId'] for action in clinical_actions 
                              if action['assignedTo'].lower() == user_role)
        # Return full patient info for assigned patients
        assigned_patients = [p for p in patients if p['id'] in assigned_patient_ids]
        return jsonify(assigned_patients)
    # Others can see limited patient info
    else:
        limited_patients = [{'id': p['id'], 'name': p['name'], 'age': p['age']} for p in patients]
        return jsonify(limited_patients)

@app.route('/api/patients/<patient_id>', methods=['GET'])
@login_required
def get_patient(patient_id):
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify(patient)

@app.route('/api/patients', methods=['POST'])
@permission_required('create_patient')
def create_patient():
    data = request.get_json()
    
    new_patient = {
        'id': str(uuid.uuid4()),
        'name': data.get('name'),
        'age': int(data.get('age')),
        'gender': data.get('gender'),
        'bloodGroup': data.get('bloodGroup', 'O+'),
        'admissionDate': datetime.now().strftime('%Y-%m-%d'),
        'condition': data.get('condition'),
        'status': data.get('status', 'admitted')
    }
    
    patients.append(new_patient)
    
    # Emit real-time update
    socketio.emit('patientCreated', new_patient)
    
    return jsonify(new_patient), 201

@app.route('/api/user', methods=['GET'])
@login_required
def get_user_info():
    return jsonify({
        'username': session.get('user_id'),
        'role': session.get('user_role'),
        'name': session.get('user_name')
    })

@app.route('/api/clinical-actions', methods=['GET'])
@login_required
def get_clinical_actions():
    user_role = session.get('user_role')
    user_permissions = users.get(user_role, {}).get('permissions', [])
    
    # Admin can see all actions
    if user_role == 'admin':
        return jsonify(clinical_actions)
    # Pharmacy and Diagnostics only see actions assigned to their department
    elif user_role in ['pharmacy', 'diagnostics']:
        assigned_actions = [action for action in clinical_actions 
                         if action['assignedTo'].lower() == user_role]
        return jsonify(assigned_actions)
    # Doctors and Nurses see all actions (they have create_action permission)
    elif 'create_action' in user_permissions:
        return jsonify(clinical_actions)
    else:
        return jsonify([])

@app.route('/api/clinical-actions/patient/<patient_id>', methods=['GET'])
@login_required
def get_patient_clinical_actions(patient_id):
    actions = [action for action in clinical_actions if action['patientId'] == patient_id]
    return jsonify(actions)

@app.route('/api/clinical-actions', methods=['POST'])
@permission_required('create_action')
def create_clinical_action():
    data = request.get_json()
    
    new_action = {
        'id': str(uuid.uuid4()),
        'patientId': data.get('patientId'),
        'type': data.get('type'),
        'title': data.get('title'),
        'description': data.get('description'),
        'initiatedBy': data.get('initiatedBy', 'Dr. Wilson'),
        'initiatedByDepartment': data.get('initiatedByDepartment', 'Doctor'),
        'assignedTo': data.get('assignedTo', 'Pharmacy'),
        'priority': data.get('priority', 'medium'),
        'status': 'pending',
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    clinical_actions.append(new_action)
    
    # Emit real-time update
    socketio.emit('clinicalActionCreated', new_action)
    
    return jsonify(new_action), 201

@app.route('/api/clinical-actions/<action_id>/status', methods=['PUT'])
@permission_required('update_actions')
def update_action_status(action_id):
    data = request.get_json()
    new_status = data.get('status')
    
    action = next((a for a in clinical_actions if a['id'] == action_id), None)
    if not action:
        return jsonify({'error': 'Action not found'}), 404
    
    user_role = session.get('user_role')
    
    # Pharmacy and Diagnostics can only update actions assigned to their department
    if user_role in ['pharmacy', 'diagnostics']:
        if action['assignedTo'].lower() != user_role:
            return jsonify({'error': 'Cannot update action not assigned to your department'}), 403
    
    action['status'] = new_status
    action['updatedAt'] = datetime.now().isoformat()
    
    # Emit real-time update
    socketio.emit('actionUpdated', action)
    
    return jsonify(action)

@app.route('/api/clinical-actions/<action_id>', methods=['PUT'])
def update_clinical_action(action_id):
    action = next((a for a in clinical_actions if a['id'] == action_id), None)
    if not action:
        return jsonify({'error': 'Clinical action not found'}), 404
    
    data = request.get_json()
    action.update(data)
    action['updatedAt'] = datetime.now().isoformat()
    
    # Emit real-time update
    socketio.emit('clinicalActionUpdated', action)
    
    return jsonify(action)

@app.route('/api/departments', methods=['GET'])
def get_departments():
    return jsonify(departments)

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('joinPatientRoom')
def handle_join_patient_room(data):
    patient_id = data.get('patientId')
    join_room(f'patient-{patient_id}')
    print(f'Client {request.sid} joined patient room {patient_id}')

@socketio.on('leavePatientRoom')
def handle_leave_patient_room(data):
    patient_id = data.get('patientId')
    leave_room(f'patient-{patient_id}')
    print(f'Client {request.sid} left patient room {patient_id}')

if __name__ == '__main__':
    initialize_data()
    print("Patient-Centric Clinical Workflow System Starting...")
    print("Access the application at: http://localhost:5001")
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
