# Patient-Centric Clinical Workflow System - C Version

A complete patient-centric clinical workflow and coordination system implemented in pure C using raw socket programming.

## System Overview

This C implementation demonstrates the same patient-centric clinical workflow functionality as the Python and Node.js versions, but built from scratch using low-level socket programming and manual HTTP handling.

## Technology Stack

- **Language**: Pure C (C99 standard)
- **Networking**: Raw Berkeley Sockets
- **HTTP Protocol**: Manual HTTP request/response parsing
- **JSON**: Manual JSON generation and basic parsing
- **Web Interface**: Embedded HTML/CSS/JavaScript
- **Data Storage**: In-memory C structs and arrays

## Key Features

### ✅ **Patient-Centric Records Management**
- Complete patient profiles with demographics and medical information
- All clinical actions organized around individual patients
- In-memory storage with fixed-size arrays

### ✅ **Clinical Actions System**
- Multiple action types: prescriptions, diagnostics, referrals
- Priority-based handling (high, medium, low)
- Status tracking: pending, in-progress, completed
- Departmental assignment and routing

### ✅ **Web-Based Interface**
- Modern responsive web UI embedded in C code
- Real-time patient and action management
- RESTful API endpoints
- Interactive forms for data entry

### ✅ **HTTP Server Implementation**
- Raw socket-based HTTP server
- GET/POST request handling
- JSON API responses
- CORS support for web frontend

## Quick Start

### Prerequisites

- C compiler (gcc or clang)
- Unix-like system (Linux, macOS, or Windows with WSL)

### Installation & Running

1. **Navigate to the C directory**:
   ```bash
   cd "/Users/bhavi/CascadeProjects/windsurf-project/with c"
   ```

2. **Compile the program**:
   ```bash
   make
   # Or manually:
   gcc -Wall -Wextra -std=c99 -o workflow workflow.c
   ```

3. **Run the server**:
   ```bash
   make run
   # Or directly:
   ./workflow
   ```

4. **Access the application**:
   Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

### Build Options

```bash
# Standard build
make

# Debug build with symbols
make debug

# Clean build artifacts
make clean

# Run the server
make run
```

## System Architecture

### **Data Structures**

```c
typedef struct {
    char id[37];           // UUID
    char name[100];        // Patient name
    int age;               // Patient age
    char gender[10];       // Gender
    char bloodGroup[5];    // Blood type
    char admissionDate[11]; // Admission date
    char condition[100];   // Medical condition
    char status[20];       // Current status
} Patient;

typedef struct {
    char id[37];           // UUID
    char patientId[37];    // Reference to patient
    char type[20];         // Action type
    char title[100];       // Action title
    char description[500]; // Detailed description
    char initiatedBy[50];  // Who initiated
    char assignedTo[20];   // Department assignment
    char status[20];       // Current status
    char priority[10];     // Priority level
    char createdAt[25];    // Creation timestamp
    char updatedAt[25];    // Last update
} ClinicalAction;
```

### **HTTP Server Implementation**

- **Raw Socket Programming**: Uses Berkeley sockets for network communication
- **HTTP Request Parsing**: Manual parsing of HTTP methods, paths, and headers
- **JSON Generation**: Manual JSON string construction for API responses
- **CORS Support**: Cross-origin headers for web frontend compatibility

### **API Endpoints**

- `GET /` - Main web interface
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/clinical-actions` - List all clinical actions
- `POST /api/clinical-actions` - Create new clinical action
- `GET /api/clinical-actions/patient/{id}` - Get actions for specific patient

## Demo Scenario

### **Sample Data**
The system starts with 3 pre-loaded patients:
- **John Smith** (45, Male) - Chest Pain
- **Sarah Johnson** (32, Female) - Fractured Leg
- **Michael Chen** (58, Male) - Diabetes Management

### **Sample Clinical Actions**
- Pain medication prescription for John Smith
- X-Ray imaging request for Sarah Johnson

### **Workflow Demonstration**

1. **View Patients**: See all patients with their conditions
2. **Add New Patient**: Use the web form to add patients
3. **Create Clinical Actions**: Assign tasks to departments
4. **Track Progress**: Monitor action statuses
5. **Department Coordination**: See all actions by department

## Technical Implementation Details

### **Memory Management**
- Fixed-size arrays for patients (max 100) and actions (max 500)
- Stack-based string buffers for JSON generation
- No dynamic memory allocation for simplicity

### **JSON Handling**
- Manual JSON string construction using sprintf
- Basic JSON parsing using sscanf for POST requests
- Proper escaping for web content

### **HTTP Protocol**
- Manual HTTP/1.1 response generation
- Content-Type and CORS headers
- Proper HTTP status codes

### **UUID Generation**
- Simple pseudo-random UUID generation
- Sufficient for demonstration purposes

## Performance Characteristics

### **Advantages**
- **Extremely Fast**: No framework overhead
- **Minimal Memory**: Small binary footprint
- **No Dependencies**: Self-contained executable
- **Direct Control**: Complete control over networking

### **Limitations**
- **Single-threaded**: Handles one request at a time
- **Memory Limits**: Fixed array sizes
- **Basic JSON**: No advanced JSON features
- **No Database**: In-memory storage only

## Expected Outcomes Achieved

✅ **Patient-wise hospital records with workflow visibility**
- Complete patient profiles with associated clinical actions
- Web-based interface for easy access

✅ **Clear tracking of clinical actions and departmental updates**
- Action lifecycle management
- Department assignment and status tracking

✅ **Demo showing end-to-end coordination**
- Patient creation to action completion workflow
- Department-based task assignment

## Extensions for Production Use

### **Database Integration**
- Replace in-memory arrays with SQLite or PostgreSQL
- Implement proper data persistence
- Add database connection pooling

### **Advanced Features**
- Multi-threading for concurrent requests
- WebSocket support for real-time updates
- User authentication and authorization
- Advanced JSON parsing library
- TLS/HTTPS support

### **Production Optimizations**
- Event-driven architecture (libevent, libuv)
- Connection pooling
- Caching mechanisms
- Load balancing support

## Comparison with Other Implementations

| Feature | C Version | Python Version | Node.js Version |
|---------|-----------|----------------|-----------------|
| Performance | Highest | Good | Good |
| Memory Usage | Minimal | Moderate | Moderate |
| Dependencies | None | Flask, SocketIO | Express, SocketIO |
| Real-time Updates | No | Yes | Yes |
| Development Speed | Slow | Fast | Fast |
| Production Ready | Needs work | Ready | Ready |

## Troubleshooting

### **Common Issues**

1. **Port Already in Use**:
   ```bash
   # Kill process using port 8080
   sudo lsof -ti:8080 | xargs kill -9
   # Or change port in workflow.c (modify PORT constant)
   ```

2. **Compilation Errors**:
   ```bash
   # Ensure you have gcc installed
   gcc --version
   
   # On macOS, install Xcode Command Line Tools
   xcode-select --install
   ```

3. **Permission Denied**:
   ```bash
   # Make the executable executable
   chmod +x workflow
   ```

### **Debug Mode**

Compile with debug symbols:
```bash
make debug
gdb ./workflow
```

## Security Considerations

### **Current Limitations**
- No input validation
- No authentication
- No HTTPS/TLS
- Basic JSON parsing vulnerable to injection

### **Production Security**
- Add input sanitization
- Implement authentication
- Use HTTPS certificates
- Add rate limiting
- Implement proper logging

## License

This C implementation is provided for educational purposes to demonstrate low-level web server programming and healthcare workflow systems.
