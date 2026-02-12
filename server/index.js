const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory data storage
let patients = [];
let clinicalActions = [];
let departments = ['Doctor', 'Nursing', 'Diagnostics', 'Pharmacy', 'Referrals'];

// Initialize with sample data
function initializeData() {
  // Sample patients
  patients = [
    {
      id: uuidv4(),
      name: "John Smith",
      age: 45,
      gender: "Male",
      bloodGroup: "O+",
      admissionDate: "2024-01-15",
      condition: "Chest Pain",
      status: "admitted"
    },
    {
      id: uuidv4(),
      name: "Sarah Johnson",
      age: 32,
      gender: "Female",
      bloodGroup: "A+",
      admissionDate: "2024-01-16",
      condition: "Fractured Leg",
      status: "admitted"
    }
  ];

  // Sample clinical actions
  clinicalActions = [
    {
      id: uuidv4(),
      patientId: patients[0].id,
      type: "prescription",
      title: "Pain Medication",
      description: "Prescribe ibuprofen 400mg every 6 hours",
      initiatedBy: "Dr. Wilson",
      initiatedByDepartment: "Doctor",
      assignedTo: "Pharmacy",
      status: "pending",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// API Routes
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.get('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

app.get('/api/clinical-actions', (req, res) => {
  res.json(clinicalActions);
});

app.get('/api/clinical-actions/patient/:patientId', (req, res) => {
  const actions = clinicalActions.filter(action => action.patientId === req.params.id);
  res.json(actions);
});

app.post('/api/clinical-actions', (req, res) => {
  const newAction = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  clinicalActions.push(newAction);
  
  // Emit real-time update
  io.emit('clinicalActionCreated', newAction);
  
  res.status(201).json(newAction);
});

app.put('/api/clinical-actions/:id', (req, res) => {
  const actionIndex = clinicalActions.findIndex(action => action.id === req.params.id);
  if (actionIndex === -1) {
    return res.status(404).json({ error: 'Clinical action not found' });
  }
  
  clinicalActions[actionIndex] = {
    ...clinicalActions[actionIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  // Emit real-time update
  io.emit('clinicalActionUpdated', clinicalActions[actionIndex]);
  
  res.json(clinicalActions[actionIndex]);
});

app.get('/api/departments', (req, res) => {
  res.json(departments);
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('joinPatientRoom', (patientId) => {
    socket.join(`patient-${patientId}`);
    console.log(`Socket ${socket.id} joined patient room ${patientId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  initializeData();
  console.log(`Server running on port ${PORT}`);
});
