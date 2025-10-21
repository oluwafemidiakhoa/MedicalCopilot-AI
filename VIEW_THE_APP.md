# 🎉 How to View Your MedicalCopilot AI App

## ✅ The API is Now Running!

Your advanced multi-agent medical AI system is live at:
- **API Base URL**: http://localhost:8001
- **Port**: 8001 (to avoid conflict with Lemonade Server on 8000)

---

## 🌐 Three Ways to View the App

### Option 1: Test UI (Quick & Easy) ⭐ RECOMMENDED

**Open the test interface:**
1. Navigate to your project folder: `C:\Users\adminidiakhoa\cagent\`
2. **Double-click** on `test-ui.html`
3. It will open in your default browser

**Or paste this in your browser:**
```
file:///C:/Users/adminidiakhoa/cagent/test-ui.html
```

This gives you:
- ✅ Beautiful UI to input clinical data
- ✅ Real-time visualization of all 16 agents working
- ✅ Live WebSocket updates as agents execute
- ✅ Final clinical report with JSON output
- ✅ Quick links to API documentation

### Option 2: API Documentation UI (Interactive)

**Open in your browser:**
```
http://localhost:8001/docs
```

This is the **Swagger UI** - fully interactive API documentation where you can:
- See all 16 API endpoints
- Try them out directly in the browser
- View request/response schemas
- Test the `/analyze` endpoint with sample data

### Option 3: Direct API Calls (For Developers)

**Test the API using curl or Postman:**

```bash
# Check health
curl http://localhost:8001/

# List all 16 agents
curl http://localhost:8001/agents

# Run an analysis
curl -X POST http://localhost:8001/analyze \
  -F 'intake={"chief_complaint":"Chest pain with exertion","hpi":"45 year old with cardiovascular risk factors","pmh":"Hypertension, hyperlipidemia","medications":"Lisinopril, atorvastatin","allergies":"NKDA"}'
```

---

## 🎯 Quick Demo Steps

### Using the Test UI (test-ui.html)

1. **Open** `test-ui.html` in your browser
2. **Fill in the form:**
   - Chief Complaint: `Chest pain with exertion for 3 days`
   - HPI: `45 year old male, symptoms worsen with activity, relieved by rest`
   - PMH: `Hypertension, hyperlipidemia`
   - Medications: `Lisinopril 10mg daily, Atorvastatin 40mg daily`
   - Allergies: `NKDA (No Known Drug Allergies)`

3. **Click** "🚀 Run Multi-Agent Analysis"

4. **Watch in real-time** as 16 specialized medical AI agents execute:
   - clinical_coordinator (orchestrating)
   - intake_specialist (structuring data)
   - symptom_analyzer (analyzing patterns)
   - differential_diagnosis_agent (generating diagnoses)
   - medical_literature_agent (searching evidence)
   - drug_interaction_checker (checking safety)
   - clinical_guidelines_agent (applying guidelines)
   - evidence_synthesizer (integrating findings)
   - clinical_reasoning_agent (reasoning)
   - risk_stratification_agent (assessing risk)
   - medical_fact_checker (validating)
   - safety_guardian (ensuring safety)
   - ethics_reviewer (checking ethics)
   - medical_writer (generating report)

5. **View the final report** with:
   - Urgency level
   - Differential diagnoses (with ICD-11 codes)
   - Risk scores
   - Evidence-based recommendations
   - Red flag warnings
   - Patient education

---

## 📊 What You're Seeing

### The Magic of Multi-Agent AI

When you run an analysis, you'll see **16 specialized medical AI agents** working together:

1. **Real-time execution**: Watch each agent's status change from "running" to "completed"
2. **Confidence scores**: See how confident each agent is (85-99%)
3. **Phase tracking**: Understand what stage the analysis is in
4. **Live updates**: WebSocket connection streams updates as they happen

### The Clinical Report

The final output includes:
- **Urgency Classification**: emergent/urgent/semi-urgent/non-urgent
- **Differential Diagnosis**: Ranked list with probabilities
- **Risk Stratification**: Clinical risk scores (HEART, CURB-65, etc.)
- **Recommendations**:
  - Diagnostic workup
  - Treatment considerations
  - Monitoring parameters
  - Specialist referrals
- **Evidence Base**: Citations from medical literature
- **Patient Education**: Plain-language guidance

---

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| **Test UI** | `file:///C:/Users/adminidiakhoa/cagent/test-ui.html` |
| **API Docs** | http://localhost:8001/docs |
| **API Base** | http://localhost:8001 |
| **Health Check** | http://localhost:8001/ |
| **List Agents** | http://localhost:8001/agents |

---

## 🛠️ API Server Control

### Check if Running
```bash
curl http://localhost:8001/
```

### Stop the Server
Press `Ctrl+C` in the terminal where it's running

Or kill the process:
```bash
# Find the process
netstat -ano | findstr :8001

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

### Restart the Server
```bash
cd C:\Users\adminidiakhoa\cagent
python api_server.py
```

---

## 🎨 UI Features

### Test UI (test-ui.html)
- ✅ Beautiful gradient design
- ✅ Responsive layout
- ✅ Real-time agent timeline
- ✅ WebSocket integration
- ✅ JSON result display
- ✅ Quick links section
- ✅ No dependencies needed!

### API Documentation (/docs)
- ✅ Interactive Swagger UI
- ✅ Try endpoints in browser
- ✅ Auto-generated from code
- ✅ Request/response examples
- ✅ Schema validation

---

## 🚀 Next Steps

1. **Try the demo** using test-ui.html
2. **Explore the API** at /docs
3. **Read the architecture** in CLAUDE.md
4. **Deploy to production** using DEPLOYMENT.md
5. **Customize agents** in advanced_team.yaml
6. **Build your own UI** using advanced_medical_ui.tsx

---

## 💡 Pro Tips

1. **Keep the terminal open** where the API is running to see logs
2. **Use the API docs** for detailed schema information
3. **Check the WebSocket** connection in browser DevTools
4. **View agent execution** in real-time in test-ui.html
5. **Copy the session ID** to check results later via `/session/{id}`

---

## ❓ Troubleshooting

### Can't access the UI?
- Make sure you opened `test-ui.html` in a browser (double-click it)
- Check the file path is correct

### WebSocket not connecting?
- Verify the API is running: `curl http://localhost:8001/`
- Check browser console for errors (F12)

### Port 8001 already in use?
- Change the port in `api_server.py` (line 579)
- Update the URL in `test-ui.html` (line 267)

---

## 🎊 You're All Set!

**Your advanced multi-agent medical AI system is live!**

Open `test-ui.html` and watch 16 AI agents analyze clinical cases in real-time. This is the most sophisticated multi-agent medical system you'll see! 🔥

For questions, see:
- [README.md](README.md) - Complete documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [CLAUDE.md](CLAUDE.md) - Technical reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

---

**Built with ❤️ using:**
- FastAPI (backend)
- WebSockets (real-time)
- 16 Specialized AI Agents
- Claude Sonnet 4 & GPT-4o
- Evidence-based medicine
