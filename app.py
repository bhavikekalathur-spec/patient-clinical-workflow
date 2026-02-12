from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import uuid
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'clinical_workflow_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
CORS(app)

# In-memory data storage
patients = []
clinical_actions = []
departments = ['Doctor', 'Nursing', 'Diagnostics', 'Pharmacy', 'Referrals', 'Laboratory', 'Radiology']

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
            'assignedTo': 'Radiology',
            'status': 'in-progress',
            'priority': 'high',
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
    ]

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/patients', methods=['GET'])
def get_patients():
    return jsonify(patients)

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify(patient)

@app.route('/api/patients', methods=['POST'])
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

@app.route('/api/clinical-actions', methods=['GET'])
def get_clinical_actions():
    return jsonify(clinical_actions)

@app.route('/api/clinical-actions/patient/<patient_id>', methods=['GET'])
def get_patient_clinical_actions(patient_id):
    actions = [action for action in clinical_actions if action['patientId'] == patient_id]
    return jsonify(actions)

@app.route('/api/clinical-actions', methods=['POST'])
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
    print("Access the application at: http://localhost:5000")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
