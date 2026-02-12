# Patient-Centric Clinical Workflow System - Demo Guide

This guide demonstrates the end-to-end clinical workflow coordination system.

## Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the System:**
   ```bash
   npm run dev
   ```
   This starts both the backend server (port 5000) and frontend (port 3000) concurrently.

3. **Open the Application:**
   Navigate to `http://localhost:3000` in your browser.

## Demo Scenario

The system comes pre-loaded with sample patients and demonstrates a complete clinical workflow:

### Sample Patients
- **John Smith** (45, Male) - Admitted with Chest Pain
- **Sarah Johnson** (32, Female) - Admitted with Fractured Leg

### End-to-End Workflow Demonstration

#### Step 1: Doctor Initiates Clinical Action
1. Go to the **Actions** tab
2. Select **John Smith** as the patient
3. Create a **Diagnostic Request**:
   - Title: "Chest X-Ray"
   - Description: "Perform chest X-ray to evaluate chest pain"
   - Priority: High
   - Assigned to: Diagnostics
4. Click **Create Clinical Action**

#### Step 2: Real-Time Visibility
- Notice the action appears immediately in:
  - Patient's timeline (Timeline tab)
  - Department queue (Departments tab)
  - Recent actions list

#### Step 3: Department Processing
1. Go to **Departments** tab
2. Filter by **Diagnostics**
3. Find the "Chest X-Ray" request
4. Click **Start Working** (status changes to "in-progress")
5. Click **Mark Complete** (status changes to "completed")

#### Step 4: Multi-Department Coordination
1. Create another action for John Smith:
   - Type: **Prescription**
   - Title: "Pain Management"
   - Description: "Prescribe acetaminophen for pain relief"
   - Assigned to: Pharmacy
2. Switch to **Departments** tab → **Pharmacy**
3. Process the prescription (Start Working → Mark Complete)

#### Step 5: Patient Timeline View
1. Select **John Smith** from the patient list
2. View the complete care timeline showing:
   - All clinical actions in chronological order
   - Status indicators (pending, in-progress, completed)
   - Department assignments and timestamps
   - Priority indicators

## Key Features Demonstrated

### 1. Patient-Centric Organization
- All actions revolve around individual patient records
- Complete patient information at a glance
- Unified view of all clinical activities

### 2. Real-Time Updates
- Instant visibility across all departments
- Live status updates without page refresh
- WebSocket-based communication

### 3. Departmental Coordination
- Clear assignment of actions to specific departments
- Department-wise queue management
- Status tracking for each action

### 4. Clinical Workflow Management
- Multiple action types (prescriptions, diagnostics, referrals, etc.)
- Priority-based handling
- Status progression (pending → in-progress → completed)

### 5. Timeline Visualization
- Chronological view of patient care journey
- Visual indicators for status and priority
- Comprehensive audit trail

## System Architecture

### Frontend (React.js)
- Modern UI with TailwindCSS
- Real-time Socket.io integration
- Responsive design for all screen sizes

### Backend (Node.js + Express)
- RESTful API for data management
- Socket.io for real-time communication
- In-memory data storage for demo purposes

### Real-Time Features
- Live status updates
- Cross-department visibility
- Instant notifications

## Expected Outcomes Achieved

✅ **Patient-wise hospital records with real-time workflow visibility**
- Complete patient profiles with all associated actions
- Real-time status tracking across departments

✅ **Clear tracking of clinical actions and departmental updates**
- Action lifecycle management
- Department-wise queue and processing

✅ **Demo showing end-to-end coordination (doctor → diagnostics/pharmacy → update)**
- Complete workflow from initiation to completion
- Multi-department coordination demonstration

## Extensions for Production Use

- Database integration (PostgreSQL/MongoDB)
- User authentication and role-based access
- Advanced notification system
- Integration with hospital information systems
- Mobile app support
- Advanced reporting and analytics
