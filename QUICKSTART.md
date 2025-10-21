# Quick Start Guide - MedicalCopilot AI

## Option 1: Simple Local Run (Recommended for Testing)

### Backend API Only

```bash
# Install Python dependencies
pip install fastapi uvicorn python-multipart websockets pydantic anthropic openai python-dotenv

# Run the API server
python api_server.py
```

**Access:**
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Test the API

Open your browser and go to **http://localhost:8000/docs** for interactive API documentation.

Or use curl:

```bash
# Health check
curl http://localhost:8000/health

# List all 16 agents
curl http://localhost:8000/agents

# Start an analysis (basic test)
curl -X POST http://localhost:8000/analyze \
  -F 'intake={"chief_complaint":"Chest pain with exertion","hpi":"Started 3 days ago","age":"45","medications":"None","allergies":"None"}'
```

---

## Option 2: Docker (API + Database + Redis)

```bash
# Build and run
docker-compose -f docker-compose.simple.yml up -d --build

# Check status
docker-compose -f docker-compose.simple.yml ps

# View logs
docker-compose -f docker-compose.simple.yml logs -f api

# Stop
docker-compose -f docker-compose.simple.yml down
```

**Access:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Option 3: Full Production Stack

```bash
# First, set up Next.js frontend
npm install
npm run build

# Then run full stack
docker-compose up -d --build
```

---

## Testing the Multi-Agent System

### Using the API Docs (Easiest)

1. Open http://localhost:8000/docs
2. Click on **POST /analyze**
3. Click "Try it out"
4. Fill in the form:
   - **intake**: `{"chief_complaint":"Chest pain with exertion for 3 days","hpi":"45 year old with cardiovascular risk factors","pmh":"Hypertension, hyperlipidemia","medications":"Lisinopril, atorvastatin","allergies":"None"}`
5. Click "Execute"
6. Copy the `session_id` from the response

### Using WebSocket (Real-time Updates)

```javascript
// In browser console or Node.js
const ws = new WebSocket('ws://localhost:8000/ws/YOUR_SESSION_ID_HERE');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent Update:', data);
};

ws.onopen = () => {
  console.log('Connected to agent stream');
};
```

### Using Python

```python
import requests
import json

# Start analysis
response = requests.post('http://localhost:8000/analyze',
    data={
        'intake': json.dumps({
            'chief_complaint': 'Chest pain with exertion',
            'hpi': '45 year old male, started 3 days ago',
            'pmh': 'Hypertension, hyperlipidemia',
            'medications': 'Lisinopril, atorvastatin',
            'allergies': 'None'
        })
    }
)

session_id = response.json()['session_id']
print(f"Session ID: {session_id}")

# Check session status
import time
time.sleep(5)  # Wait for agents to run

session = requests.get(f'http://localhost:8000/session/{session_id}')
print(json.dumps(session.json(), indent=2))
```

---

## UI Options

### Option A: Use the API Docs UI
- Built-in Swagger UI at http://localhost:8000/docs
- Interactive, no setup required

### Option B: Standalone React UI
The advanced UI ([advanced_medical_ui.tsx](advanced_medical_ui.tsx)) can be integrated into:
1. **Next.js** (recommended)
2. **Create React App**
3. **Vite**

Quick Next.js setup:
```bash
npx create-next-app@latest medicalcopilot-ui
cd medicalcopilot-ui
# Copy advanced_medical_ui.tsx to src/app/page.tsx
npm install framer-motion lucide-react
npm run dev
```

### Option C: Simple HTML Test Page

Create `test.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>MedicalCopilot AI Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        textarea { width: 100%; height: 100px; margin: 10px 0; }
        button { padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #4338ca; }
        #output { background: #f3f4f6; padding: 20px; border-radius: 5px; margin-top: 20px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>🏥 MedicalCopilot AI Test</h1>

    <h3>Chief Complaint</h3>
    <input type="text" id="complaint" placeholder="e.g., Chest pain with exertion" style="width: 100%; padding: 10px;">

    <h3>History of Present Illness</h3>
    <textarea id="hpi" placeholder="Describe the symptoms..."></textarea>

    <button onclick="runAnalysis()">Run Multi-Agent Analysis</button>

    <div id="output"></div>

    <script>
        async function runAnalysis() {
            const output = document.getElementById('output');
            output.textContent = 'Starting analysis...\n';

            const formData = new FormData();
            formData.append('intake', JSON.stringify({
                chief_complaint: document.getElementById('complaint').value,
                hpi: document.getElementById('hpi').value
            }));

            try {
                // Start analysis
                const response = await fetch('http://localhost:8000/analyze', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                output.textContent += `Session ID: ${data.session_id}\n`;

                // Connect to WebSocket
                const ws = new WebSocket(`ws://localhost:8000/ws/${data.session_id}`);

                ws.onmessage = (event) => {
                    const update = JSON.parse(event.data);

                    if (update.type === 'agent_status') {
                        output.textContent += `\n[${update.phase}] ${update.agent} - ${update.status}`;
                        if (update.confidence) {
                            output.textContent += ` (${(update.confidence * 100).toFixed(0)}% confidence)`;
                        }
                    } else if (update.type === 'analysis_complete') {
                        output.textContent += '\n\n=== ANALYSIS COMPLETE ===\n';
                        output.textContent += JSON.stringify(update.report, null, 2);
                        ws.close();
                    }
                };

                ws.onerror = (error) => {
                    output.textContent += '\nWebSocket error: ' + error;
                };

            } catch (error) {
                output.textContent += '\nError: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

Open `test.html` in your browser while the API is running.

---

## Verify Everything is Working

```bash
# 1. Check API health
curl http://localhost:8000/health

# 2. List agents
curl http://localhost:8000/agents | jq

# 3. Quick analysis test
curl -X POST http://localhost:8000/analyze \
  -F 'intake={"chief_complaint":"Test symptom"}' | jq
```

Expected output:
```json
{
  "session_id": "uuid-here",
  "status": "started",
  "websocket_url": "/ws/uuid-here"
}
```

---

## Troubleshooting

### API won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F

# Try running directly
python api_server.py
```

### Docker issues
```bash
# Clean up and rebuild
docker-compose -f docker-compose.simple.yml down -v
docker-compose -f docker-compose.simple.yml up -d --build

# Check logs
docker-compose -f docker-compose.simple.yml logs -f
```

### Missing dependencies
```bash
# Install all Python dependencies
pip install -r requirements.txt

# Or minimal for testing
pip install fastapi uvicorn python-multipart websockets pydantic
```

---

## Next Steps

1. **Test the API** using http://localhost:8000/docs
2. **Try the WebSocket** connection to see real-time agent updates
3. **Build the frontend** using the advanced UI component
4. **Customize agents** in advanced_team.yaml
5. **Deploy to production** using DEPLOYMENT.md guide

---

## Quick Demo Script

```bash
# 1. Start API
python api_server.py

# 2. In another terminal, test it
curl http://localhost:8000/health

# 3. Run analysis
curl -X POST http://localhost:8000/analyze \
  -F 'intake={"chief_complaint":"Chest pain on exertion","hpi":"45M with HTN, started 3 days ago","pmh":"Hypertension","medications":"Lisinopril","allergies":"NKDA"}' \
  | jq '.session_id'

# 4. Open browser to http://localhost:8000/docs
# 5. Try the interactive API documentation
```

---

**You're now running the most advanced multi-agent medical AI system!** 🎉

For questions, see [README.md](README.md) or [CLAUDE.md](CLAUDE.md).
