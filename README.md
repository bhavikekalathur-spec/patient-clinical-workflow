# Patient-Centric Clinical Workflow System

A comprehensive patient-centric clinical workflow and coordination system that organizes all clinical actions around individual patient records with real-time visibility and departmental coordination.

## System Overview

This system focuses on patient-wise visibility, structured clinical workflows, and seamless coordination between hospital departments. It provides real-time tracking of clinical actions from initiation to completion.

## Key Features

- **Patient-Centric Records**: All clinical actions organized around individual patient records
- **Real-Time Workflow Visibility**: Live tracking of actions, progress, and status
- **Departmental Coordination**: Seamless routing between doctors, diagnostics, pharmacy, and nursing
- **Clinical Actions Management**: Prescriptions, diagnostic requests, referrals, care instructions
- **Care Timeline**: Comprehensive view of patient treatment journey
- **Real-Time Updates**: Immediate visibility of status changes across departments

## Architecture

- **Frontend**: React.js with modern UI components (TailwindCSS, shadcn/ui)
- **Backend**: Node.js with Express and Socket.io for real-time communication
- **Data Management**: In-memory storage with JSON-based data models
- **Real-Time Communication**: WebSocket connections for live updates

## Expected Outcomes

1. Patient-wise hospital records with real-time workflow visibility
2. Clear tracking of clinical actions and departmental updates
3. Demo showing end-to-end coordination (doctor → diagnostics/pharmacy → update)

## Getting Started

1. Install dependencies: `npm install`
2. Start backend server: `npm run server`
3. Start frontend: `npm start`
4. Open browser to `http://localhost:3000`

## Demo Flow

The system demonstrates a complete clinical workflow:
1. Doctor initiates clinical actions (prescription, diagnostic request)
2. Actions are routed to appropriate departments
3. Departments process and update status in real-time
4. All stakeholders see immediate updates in patient timeline
## License

This project is provided for educational purposes to demonstrate healthcare workflow systems and web development technologies.
