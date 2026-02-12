#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define MAX_PATIENTS 100
#define MAX_ACTIONS 500
#define BUFFER_SIZE 8192
#define PORT 3000

// Data structures
typedef struct {
    char id[37];
    char name[100];
    int age;
    char gender[10];
    char bloodGroup[5];
    char admissionDate[11];
    char condition[100];
    char status[20];
} Patient;

typedef struct {
    char id[37];
    char patientId[37];
    char type[20];
    char title[100];
    char description[500];
    char initiatedBy[50];
    char initiatedByDepartment[20];
    char assignedTo[20];
    char status[20];
    char priority[10];
    char createdAt[25];
    char updatedAt[25];
} ClinicalAction;

// Global data storage
Patient patients[MAX_PATIENTS];
ClinicalAction clinicalActions[MAX_ACTIONS];
int patientCount = 0;
int actionCount = 0;

// Utility functions
void generate_uuid(char *uuid) {
    sprintf(uuid, "%08x-%04x-%04x-%04x-%012x",
            rand() % 0xFFFFFFFF,
            rand() % 0xFFFF,
            rand() % 0xFFFF,
            rand() % 0xFFFF,
            ((long long)rand() << 32) | rand());
}

void get_current_timestamp(char *timestamp) {
    time_t now = time(NULL);
    struct tm *tm_info = localtime(&now);
    strftime(timestamp, 25, "%Y-%m-%dT%H:%M:%S", tm_info);
}

void initialize_data() {
    // Sample patients
    strcpy(patients[0].name, "John Smith");
    patients[0].age = 45;
    strcpy(patients[0].gender, "Male");
    strcpy(patients[0].bloodGroup, "O+");
    strcpy(patients[0].admissionDate, "2024-01-15");
    strcpy(patients[0].condition, "Chest Pain");
    strcpy(patients[0].status, "admitted");
    generate_uuid(patients[0].id);
    
    strcpy(patients[1].name, "Sarah Johnson");
    patients[1].age = 32;
    strcpy(patients[1].gender, "Female");
    strcpy(patients[1].bloodGroup, "A+");
    strcpy(patients[1].admissionDate, "2024-01-16");
    strcpy(patients[1].condition, "Fractured Leg");
    strcpy(patients[1].status, "admitted");
    generate_uuid(patients[1].id);
    
    strcpy(patients[2].name, "Michael Chen");
    patients[2].age = 58;
    strcpy(patients[2].gender, "Male");
    strcpy(patients[2].bloodGroup, "B+");
    strcpy(patients[2].admissionDate, "2024-01-14");
    strcpy(patients[2].condition, "Diabetes Management");
    strcpy(patients[2].status, "admitted");
    generate_uuid(patients[2].id);
    
    patientCount = 3;
    
    // Sample clinical actions
    strcpy(clinicalActions[0].patientId, patients[0].id);
    strcpy(clinicalActions[0].type, "prescription");
    strcpy(clinicalActions[0].title, "Pain Medication");
    strcpy(clinicalActions[0].description, "Prescribe ibuprofen 400mg every 6 hours for chest pain");
    strcpy(clinicalActions[0].initiatedBy, "Dr. Wilson");
    strcpy(clinicalActions[0].initiatedByDepartment, "Doctor");
    strcpy(clinicalActions[0].assignedTo, "Pharmacy");
    strcpy(clinicalActions[0].status, "pending");
    strcpy(clinicalActions[0].priority, "medium");
    generate_uuid(clinicalActions[0].id);
    get_current_timestamp(clinicalActions[0].createdAt);
    strcpy(clinicalActions[0].updatedAt, clinicalActions[0].createdAt);
    
    strcpy(clinicalActions[1].patientId, patients[1].id);
    strcpy(clinicalActions[1].type, "diagnostic");
    strcpy(clinicalActions[1].title, "X-Ray Imaging");
    strcpy(clinicalActions[1].description, "Perform leg X-ray to assess fracture severity");
    strcpy(clinicalActions[1].initiatedBy, "Dr. Brown");
    strcpy(clinicalActions[1].initiatedByDepartment, "Doctor");
    strcpy(clinicalActions[1].assignedTo, "Radiology");
    strcpy(clinicalActions[1].status, "in-progress");
    strcpy(clinicalActions[1].priority, "high");
    generate_uuid(clinicalActions[1].id);
    get_current_timestamp(clinicalActions[1].createdAt);
    strcpy(clinicalActions[1].updatedAt, clinicalActions[1].createdAt);
    
    actionCount = 2;
}

// HTTP response helpers
void send_http_response(int client_socket, const char *status, const char *content_type, const char *body) {
    char response[BUFFER_SIZE];
    sprintf(response, 
            "HTTP/1.1 %s\r\n"
            "Content-Type: %s\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n"
            "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
            "Content-Length: %zu\r\n"
            "Connection: close\r\n"
            "\r\n%s",
            status, content_type, strlen(body), body);
    send(client_socket, response, strlen(response), 0);
}

void send_json_response(int client_socket, const char *json) {
    send_http_response(client_socket, "200 OK", "application/json", json);
}

void send_html_response(int client_socket, const char *html) {
    send_http_response(client_socket, "200 OK", "text/html", html);
}

// JSON generation functions
void patients_to_json(char *json) {
    strcpy(json, "[");
    for (int i = 0; i < patientCount; i++) {
        char patient_json[500];
        sprintf(patient_json,
                "{\"id\":\"%s\",\"name\":\"%s\",\"age\":%d,\"gender\":\"%s\","
                "\"bloodGroup\":\"%s\",\"admissionDate\":\"%s\",\"condition\":\"%s\","
                "\"status\":\"%s\"}",
                patients[i].id, patients[i].name, patients[i].age, patients[i].gender,
                patients[i].bloodGroup, patients[i].admissionDate, patients[i].condition,
                patients[i].status);
        
        strcat(json, patient_json);
        if (i < patientCount - 1) strcat(json, ",");
    }
    strcat(json, "]");
}

void actions_to_json(char *json) {
    strcpy(json, "[");
    for (int i = 0; i < actionCount; i++) {
        char action_json[800];
        sprintf(action_json,
                "{\"id\":\"%s\",\"patientId\":\"%s\",\"type\":\"%s\",\"title\":\"%s\","
                "\"description\":\"%s\",\"initiatedBy\":\"%s\",\"initiatedByDepartment\":\"%s\","
                "\"assignedTo\":\"%s\",\"status\":\"%s\",\"priority\":\"%s\","
                "\"createdAt\":\"%s\",\"updatedAt\":\"%s\"}",
                clinicalActions[i].id, clinicalActions[i].patientId, clinicalActions[i].type,
                clinicalActions[i].title, clinicalActions[i].description,
                clinicalActions[i].initiatedBy, clinicalActions[i].initiatedByDepartment,
                clinicalActions[i].assignedTo, clinicalActions[i].status, clinicalActions[i].priority,
                clinicalActions[i].createdAt, clinicalActions[i].updatedAt);
        
        strcat(json, action_json);
        if (i < actionCount - 1) strcat(json, ",");
    }
    strcat(json, "]");
}

void patient_actions_to_json(const char *patientId, char *json) {
    strcpy(json, "[");
    int first = 1;
    for (int i = 0; i < actionCount; i++) {
        if (strcmp(clinicalActions[i].patientId, patientId) == 0) {
            if (!first) strcat(json, ",");
            
            char action_json[800];
            sprintf(action_json,
                    "{\"id\":\"%s\",\"patientId\":\"%s\",\"type\":\"%s\",\"title\":\"%s\","
                    "\"description\":\"%s\",\"initiatedBy\":\"%s\",\"initiatedByDepartment\":\"%s\","
                    "\"assignedTo\":\"%s\",\"status\":\"%s\",\"priority\":\"%s\","
                    "\"createdAt\":\"%s\",\"updatedAt\":\"%s\"}",
                    clinicalActions[i].id, clinicalActions[i].patientId, clinicalActions[i].type,
                    clinicalActions[i].title, clinicalActions[i].description,
                    clinicalActions[i].initiatedBy, clinicalActions[i].initiatedByDepartment,
                    clinicalActions[i].assignedTo, clinicalActions[i].status, clinicalActions[i].priority,
                    clinicalActions[i].createdAt, clinicalActions[i].updatedAt);
            
            strcat(json, action_json);
            first = 0;
        }
    }
    strcat(json, "]");
}

// HTML template
const char* get_html_template() {
    return "<!DOCTYPE html>\n"
           "<html lang=\"en\">\n"
           "<head>\n"
           "    <meta charset=\"UTF-8\">\n"
           "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
           "    <title>Patient Clinical Workflow - C Version</title>\n"
           "    <style>\n"
           "        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }\n"
           "        .container { max-width: 1200px; margin: 0 auto; }\n"
           "        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n"
           "        .patient { border-left: 4px solid #007bff; }\n"
           "        .action { border-left: 4px solid #28a745; }\n"
           "        .status-pending { background: #fff3cd; }\n"
           "        .status-in-progress { background: #cce5ff; }\n"
           "        .status-completed { background: #d4edda; }\n"
           "        button { background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }\n"
           "        button:hover { background: #0056b3; }\n"
           "        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }\n"
           "        input, select, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }\n"
           "    </style>\n"
           "</head>\n"
           "<body>\n"
           "    <div class=\"container\">\n"
           "        <h1>Patient-Centric Clinical Workflow System</h1>\n"
           "        <p>C Implementation with Raw Sockets</p>\n"
           "        \n"
           "        <div class=\"card\">\n"
           "            <h2>Patients</h2>\n"
           "            <div id=\"patients-list\"></div>\n"
           "        </div>\n"
           "        \n"
           "        <div class=\"grid\">\n"
           "            <div class=\"card\">\n"
           "                <h2>Add Patient</h2>\n"
           "                <form id=\"patient-form\">\n"
           "                    <input type=\"text\" id=\"name\" placeholder=\"Patient Name\" required>\n"
           "                    <input type=\"number\" id=\"age\" placeholder=\"Age\" required>\n"
           "                    <select id=\"gender\" required>\n"
           "                        <option value=\"\">Select Gender</option>\n"
           "                        <option value=\"Male\">Male</option>\n"
           "                        <option value=\"Female\">Female</option>\n"
           "                    </select>\n"
           "                    <input type=\"text\" id=\"condition\" placeholder=\"Condition\" required>\n"
           "                    <button type=\"submit\">Add Patient</button>\n"
           "                </form>\n"
           "            </div>\n"
           "            \n"
           "            <div class=\"card\">\n"
           "                <h2>Create Clinical Action</h2>\n"
           "                <form id=\"action-form\">\n"
           "                    <select id=\"patient-select\" required>\n"
           "                        <option value=\"\">Select Patient</option>\n"
           "                    </select>\n"
           "                    <select id=\"action-type\" required>\n"
           "                        <option value=\"prescription\">Prescription</option>\n"
           "                        <option value=\"diagnostic\">Diagnostic</option>\n"
           "                        <option value=\"referral\">Referral</option>\n"
           "                    </select>\n"
           "                    <input type=\"text\" id=\"action-title\" placeholder=\"Action Title\" required>\n"
           "                    <textarea id=\"action-description\" placeholder=\"Description\" required></textarea>\n"
           "                    <select id=\"assigned-to\" required>\n"
           "                        <option value=\"Pharmacy\">Pharmacy</option>\n"
           "                        <option value=\"Diagnostics\">Diagnostics</option>\n"
           "                        <option value=\"Nursing\">Nursing</option>\n"
           "                    </select>\n"
           "                    <button type=\"submit\">Create Action</button>\n"
           "                </form>\n"
           "            </div>\n"
           "        </div>\n"
           "        \n"
           "        <div class=\"card\">\n"
           "            <h2>Clinical Actions</h2>\n"
           "            <div id=\"actions-list\"></div>\n"
           "        </div>\n"
           "    </div>\n"
           "    \n"
           "    <script>\n"
           "        let patients = [];\n"
           "        let actions = [];\n"
           "        \n"
           "        async function loadData() {\n"
           "            const [patientsRes, actionsRes] = await Promise.all([\n"
           "                fetch('/api/patients'),\n"
           "                fetch('/api/clinical-actions')\n"
           "            ]);\n"
           "            \n"
           "            patients = await patientsRes.json();\n"
           "            actions = await actionsRes.json();\n"
           "            \n"
           "            updateUI();\n"
           "        }\n"
           "        \n"
           "        function updateUI() {\n"
           "            updatePatientsList();\n"
           "            updateActionsList();\n"
           "            updatePatientSelect();\n"
           "        }\n"
           "        \n"
           "        function updatePatientsList() {\n"
           "            const list = document.getElementById('patients-list');\n"
           "            list.innerHTML = patients.map(p => \n"
           "                `<div class=\"patient\">\\n"
           "                    <strong>${p.name}</strong> (${p.age}, ${p.gender})<br>\\n"
           "                    ${p.condition} - ${p.status}\n"
           "                </div>`\n"
           "            ).join('');\n"
           "        }\n"
           "        \n"
           "        function updateActionsList() {\n"
           "            const list = document.getElementById('actions-list');\n"
           "            list.innerHTML = actions.map(a => {\n"
           "                const patient = patients.find(p => p.id === a.patientId);\n"
           "                return `<div class=\"action status-${a.status}\">\\n"
           "                    <strong>${a.title}</strong> - ${a.type}<br>\\n"
           "                    Patient: ${patient ? patient.name : 'Unknown'}<br>\\n"
           "                    Status: ${a.status} | Assigned to: ${a.assignedTo}\n"
           "                </div>`;\n"
           "            }).join('');\n"
           "        }\n"
           "        \n"
           "        function updatePatientSelect() {\n"
           "            const select = document.getElementById('patient-select');\n"
           "            select.innerHTML = '<option value=\"\">Select Patient</option>' + \n"
           "                patients.map(p => `<option value=\"${p.id}\">${p.name}</option>`).join('');\n"
           "        }\n"
           "        \n"
           "        document.getElementById('patient-form').addEventListener('submit', async (e) => {\n"
           "            e.preventDefault();\n"
           "            \n"
           "            const data = {\n"
           "                name: document.getElementById('name').value,\n"
           "                age: parseInt(document.getElementById('age').value),\n"
           "                gender: document.getElementById('gender').value,\n"
           "                condition: document.getElementById('condition').value\n"
           "            };\n"
           "            \n"
           "            await fetch('/api/patients', {\n"
           "                method: 'POST',\n"
           "                headers: {'Content-Type': 'application/json'},\n"
           "                body: JSON.stringify(data)\n"
           "            });\n"
           "            \n"
           "            e.target.reset();\n"
           "            loadData();\n"
           "        });\n"
           "        \n"
           "        document.getElementById('action-form').addEventListener('submit', async (e) => {\n"
           "            e.preventDefault();\n"
           "            \n"
           "            const data = {\n"
           "                patientId: document.getElementById('patient-select').value,\n"
           "                type: document.getElementById('action-type').value,\n"
           "                title: document.getElementById('action-title').value,\n"
           "                description: document.getElementById('action-description').value,\n"
           "                assignedTo: document.getElementById('assigned-to').value\n"
           "            };\n"
           "            \n"
           "            await fetch('/api/clinical-actions', {\n"
           "                method: 'POST',\n"
           "                headers: {'Content-Type': 'application/json'},\n"
           "                body: JSON.stringify(data)\n"
           "            });\n"
           "            \n"
           "            e.target.reset();\n"
           "            loadData();\n"
           "        });\n"
           "        \n"
           "        // Load initial data\n"
           "        loadData();\n"
           "    </script>\n"
           "</body>\n"
           "</html>";
}

// Route handlers
void handle_patients_request(int client_socket) {
    char json[10000];
    patients_to_json(json);
    send_json_response(client_socket, json);
}

void handle_patient_actions_request(int client_socket, const char *patientId) {
    char json[10000];
    patient_actions_to_json(patientId, json);
    send_json_response(client_socket, json);
}

void handle_actions_request(int client_socket) {
    char json[20000];
    actions_to_json(json);
    send_json_response(client_socket, json);
}

void handle_create_patient(int client_socket, const char *body) {
    if (patientCount >= MAX_PATIENTS) {
        send_http_response(client_socket, "400 Bad Request", "application/json", "{\"error\":\"Maximum patients reached\"}");
        return;
    }
    
    // Parse JSON body (simplified parsing)
    char name[100] = {0}, gender[10] = {0}, condition[100] = {0};
    int age = 0;
    
    // Simple JSON parsing (in production, use a proper JSON library)
    sscanf(body, "{\"name\":\"%99[^\"]\",\"age\":%d,\"gender\":\"%9[^\"]\",\"condition\":\"%99[^\"]}", 
           name, &age, gender, condition);
    
    strcpy(patients[patientCount].name, name);
    patients[patientCount].age = age;
    strcpy(patients[patientCount].gender, gender);
    strcpy(patients[patientCount].condition, condition);
    strcpy(patients[patientCount].bloodGroup, "O+");
    strcpy(patients[patientCount].status, "admitted");
    strcpy(patients[patientCount].admissionDate, "2024-01-17");
    generate_uuid(patients[patientCount].id);
    
    patientCount++;
    
    char response[200];
    sprintf(response, "{\"message\":\"Patient created successfully\",\"id\":\"%s\"}", patients[patientCount-1].id);
    send_json_response(client_socket, response);
}

void handle_create_action(int client_socket, const char *body) {
    if (actionCount >= MAX_ACTIONS) {
        send_http_response(client_socket, "400 Bad Request", "application/json", "{\"error\":\"Maximum actions reached\"}");
        return;
    }
    
    // Parse JSON body (simplified)
    char patientId[37] = {0}, type[20] = {0}, title[100] = {0};
    char description[500] = {0}, assignedTo[20] = {0};
    
    sscanf(body, "{\"patientId\":\"%36[^\"]\",\"type\":\"%19[^\"]\",\"title\":\"%99[^\"]\","
           "\"description\":\"%499[^\"]\",\"assignedTo\":\"%19[^\"]}", 
           patientId, type, title, description, assignedTo);
    
    strcpy(clinicalActions[actionCount].patientId, patientId);
    strcpy(clinicalActions[actionCount].type, type);
    strcpy(clinicalActions[actionCount].title, title);
    strcpy(clinicalActions[actionCount].description, description);
    strcpy(clinicalActions[actionCount].assignedTo, assignedTo);
    strcpy(clinicalActions[actionCount].initiatedBy, "Dr. Smith");
    strcpy(clinicalActions[actionCount].initiatedByDepartment, "Doctor");
    strcpy(clinicalActions[actionCount].status, "pending");
    strcpy(clinicalActions[actionCount].priority, "medium");
    generate_uuid(clinicalActions[actionCount].id);
    get_current_timestamp(clinicalActions[actionCount].createdAt);
    strcpy(clinicalActions[actionCount].updatedAt, clinicalActions[actionCount].createdAt);
    
    actionCount++;
    
    char response[200];
    sprintf(response, "{\"message\":\"Action created successfully\",\"id\":\"%s\"}", clinicalActions[actionCount-1].id);
    send_json_response(client_socket, response);
}

// Main request handler
void handle_request(int client_socket, const char *method, const char *path, const char *body) {
    printf("Request: %s %s\n", method, path);
    
    if (strcmp(path, "/") == 0) {
        const char *html = get_html_template();
        char response[BUFFER_SIZE];
        sprintf(response, 
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: text/html\r\n"
                "Access-Control-Allow-Origin: *\r\n"
                "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n"
                "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
                "Content-Length: %zu\r\n"
                "Connection: close\r\n"
                "\r\n%s",
                strlen(html), html);
        send(client_socket, response, strlen(response), 0);
    }
    else if (strcmp(path, "/api/patients") == 0) {
        if (strcmp(method, "GET") == 0) {
            handle_patients_request(client_socket);
        }
        else if (strcmp(method, "POST") == 0) {
            handle_create_patient(client_socket, body);
        }
    }
    else if (strcmp(path, "/api/clinical-actions") == 0) {
        if (strcmp(method, "GET") == 0) {
            handle_actions_request(client_socket);
        }
        else if (strcmp(method, "POST") == 0) {
            handle_create_action(client_socket, body);
        }
    }
    else if (strncmp(path, "/api/clinical-actions/patient/", 30) == 0) {
        char *patientId = (char*)path + 30;
        handle_patient_actions_request(client_socket, patientId);
    }
    else {
        send_http_response(client_socket, "404 Not Found", "text/html", "<h1>404 Not Found</h1>");
    }
}

// Main server function
int main() {
    srand(time(NULL));
    initialize_data();
    
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    char buffer[BUFFER_SIZE];
    
    // Create socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("Socket creation failed");
        exit(1);
    }
    
    // Set socket options
    int opt = 1;
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    // Configure server address
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);
    
    // Bind socket
    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Bind failed");
        exit(1);
    }
    
    // Listen for connections
    listen(server_socket, 5);
    
    printf("Patient-Centric Clinical Workflow System (C Version)\n");
    printf("Server running on http://localhost:%d\n", PORT);
    printf("Press Ctrl+C to stop\n\n");
    
    while (1) {
        // Accept connection
        client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_len);
        if (client_socket < 0) {
            perror("Accept failed");
            continue;
        }
        
        // Read request
        memset(buffer, 0, BUFFER_SIZE);
        int bytes_read = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
        if (bytes_read > 0) {
            // Parse HTTP request
            char method[10], path[256], *body_start = NULL;
            buffer[bytes_read] = '\0';
            
            // Extract method and path
            sscanf(buffer, "%9s %255s", method, path);
            
            // Find body (if any)
            body_start = strstr(buffer, "\r\n\r\n");
            if (body_start) {
                body_start += 4;
            }
            
            // Handle request
            handle_request(client_socket, method, path, body_start ? body_start : "");
        }
        
        // Close connection
        close(client_socket);
    }
    
    close(server_socket);
    return 0;
}