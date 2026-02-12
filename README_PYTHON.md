# Patient-Centric Clinical Workflow System - Python Version

A comprehensive patient-centric clinical workflow and coordination system built with Python, Flask, and real-time WebSocket communication.

## System Overview

This Python-based system provides the same patient-centric clinical workflow functionality as the Node.js version, focusing on real-time coordination between hospital departments and complete visibility into patient care journeys.

## Technology Stack

- **Backend**: Python 3.8+ with Flask
- **Real-time Communication**: Flask-SocketIO with WebSocket support
- **Frontend**: HTML5, CSS3, JavaScript with TailwindCSS
- **Data Storage**: In-memory Python data structures (demo-ready)
- **Web Server**: Flask development server with eventlet for WebSocket support

## Key Features

- **Patient-Centric Records**: All clinical actions organized around individual patient records
- **Real-Time Workflow Visibility**: Live tracking via WebSocket connections
- **Departmental Coordination**: Seamless routing between doctors, diagnostics, pharmacy, and nursing
- **Clinical Actions Management**: Prescriptions, diagnostic requests, referrals, care instructions
- **Care Timeline**: Comprehensive chronological view of patient treatment
- **Department Queue Management**: Real-time status tracking for each department

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /Users/bhavi/CascadeProjects/windsurf-project
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Flask application**:
   ```bash
   python app.py
   ```

2. **Access the application**:
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

The system will start with sample patients and clinical actions pre-loaded for demonstration.

## Demo Scenario

The system comes pre-loaded with sample data:

### Sample Patients
- **John Smith** (45, Male) - Admitted with Chest Pain
- **Sarah Johnson** (32, Female) - Admitted with Fractured Leg  
- **Michael Chen** (58, Male) - Admitted for Diabetes Management

### End-to-End Workflow Demonstration

#### Step 1: Doctor Initiates Clinical Action
1. Go to the **Actions** tab
2. Select a patient (e.g., John Smith)
3. Create a clinical action:
   - Choose action type (Diagnostic Request, Prescription, etc.)
   - Enter title and description
   - Set priority level
   - Assign to appropriate department
4. Click **Create Clinical Action**

#### Step 2: Real-Time Visibility
- The action appears immediately in:
  - Patient's timeline (Timeline tab)
  - Department queue (Departments tab)
  - Recent actions list

#### Step 3: Department Processing
1. Go to **Departments** tab
2. Filter by the assigned department
3. Find the new action and update its status:
   - Click **Start Working** (status → in-progress)
   - Click **Mark Complete** (status → completed)

#### Step 4: Multi-Department Coordination
Create multiple actions for the same patient across different departments to demonstrate:
- Prescription → Pharmacy processing
- Diagnostic Request → Radiology processing
- Lab Test → Laboratory processing

## Project Structure

```
windsurf-project/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   └── js/
│       └── app.js        # Frontend JavaScript
└── README_PYTHON.md      # This file
```

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/<id>` - Get specific patient

### Clinical Actions
- `GET /api/clinical-actions` - Get all clinical actions
- `GET /api/clinical-actions/patient/<patient_id>` - Get actions for specific patient
- `POST /api/clinical-actions` - Create new clinical action
- `PUT /api/clinical-actions/<id>` - Update clinical action status

### Departments
- `GET /api/departments` - Get list of departments

## WebSocket Events

### Client to Server
- `joinPatientRoom` - Join a patient-specific room for real-time updates
- `leavePatientRoom` - Leave a patient-specific room

### Server to Client
- `clinicalActionCreated` - New clinical action created
- `clinicalActionUpdated` - Clinical action status updated

## Expected Outcomes Achieved

✅ **Patient-wise hospital records with real-time workflow visibility**
- Complete patient profiles with all associated clinical actions
- Real-time status tracking across all connected clients

✅ **Clear tracking of clinical actions and departmental updates**
- Action lifecycle management (pending → in-progress → completed)
- Department-wise queue and processing statistics

✅ **Demo showing end-to-end coordination (doctor → diagnostics/pharmacy → update)**
- Complete workflow from action creation to completion
- Multi-department coordination with real-time updates

## Extensions for Production Use

- **Database Integration**: Replace in-memory storage with PostgreSQL or MongoDB
- **Authentication**: Add user authentication and role-based access control
- **Advanced Notifications**: Email/SMS notifications for critical updates
- **Mobile Support**: Responsive design works on mobile devices
- **Reporting**: Add analytics and reporting capabilities
- **Integration**: Connect with existing Hospital Information Systems (HIS)

## Configuration

The application can be configured by modifying variables in `app.py`:

- `app.config['SECRET_KEY']` - Flask secret key for sessions
- Host and port settings in the `socketio.run()` call

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change the port in the last line of `app.py`: `socketio.run(app, port=5001)`

2. **Dependencies not installing**:
   - Ensure you have Python 3.8+
   - Try upgrading pip: `pip install --upgrade pip`

3. **WebSocket connection issues**:
   - Check that eventlet is installed correctly
   - Ensure no firewall is blocking WebSocket connections

### Development Tips

- Use the Flask debugger for development: `socketio.run(app, debug=True)`
- Monitor the console for real-time event logs
- Use browser developer tools to inspect WebSocket connections

## Performance Considerations

For production use:
- Replace in-memory storage with a proper database
- Implement connection pooling for database connections
- Add caching for frequently accessed data
- Consider using a production WSGI server like Gunicorn

## License

This project is provided as a demonstration of patient-centric clinical workflow systems.
