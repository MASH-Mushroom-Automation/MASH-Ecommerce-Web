# AI-003: Ollama + Llama 3.2 Installation

> **Phase:** 1 - Foundation  
> **Priority:** Critical  
> **Story Points:** 10  
> **Estimated Time:** 5-7 hours  
> **Dependencies:** AI-002 (n8n Setup), 8GB+ RAM PC

---

## 📋 Task Overview

Install **Ollama** and download the **Llama 3.2 3B model** to provide FREE local AI for seller matching, appointment parsing, and analytics. This replaces expensive OpenAI API calls with a fully self-hosted solution.

### What is Ollama?
Ollama is a **FREE, open-source tool** that lets you run large language models (LLMs) locally on your PC. Key benefits:
- Run AI models without internet (after initial download)
- NO API costs (unlike OpenAI/ChatGPT)
- Privacy-focused (data never leaves your PC)
- Compatible with n8n for workflow automation

### What is Llama 3.2 3B?
Llama 3.2 3B is Meta's **FREE, lightweight AI model**:
- Only **2GB download size**
- Runs smoothly on 8GB RAM PCs
- Perfect for text classification, matching, and conversation
- Optimized for commercial use (no restrictions!)

---

## 🎯 Acceptance Criteria

- [ ] Ollama installed and running
- [ ] Llama 3.2 3B model downloaded successfully (2GB)
- [ ] Test query returns valid seller match response
- [ ] n8n HTTP node successfully calls Ollama API
- [ ] Response time <5 seconds on average PC
- [ ] Documented prompts for: seller matching, product intent, FAQ responses
- [ ] Ollama service auto-starts on PC boot

---

## 🔗 Dependencies

### Before You Start:
1. **8GB+ RAM** (minimum for Llama 3.2 3B)
   - Check RAM: Windows (Task Manager → Performance), Mac (About This Mac)
2. **10GB free disk space** for model storage
3. **AI-002 Complete** (n8n must be running for integration test)
4. **Port 11434 available** (Ollama default port)

### Technical Requirements:
- Windows 10/11 (64-bit) OR macOS 11+ OR Linux
- Internet connection for initial model download
- Terminal access (Command Prompt, PowerShell, or Terminal)

---

## 📝 Implementation Steps

### Step 1: Download Ollama (10 mins)
1. Visit [https://ollama.com/download](https://ollama.com/download)
2. Select your operating system:
   - **Windows:** Download `ollama-windows-amd64.exe`
   - **macOS:** Download `Ollama.dmg`
   - **Linux:** Use install script (see Step 2)
3. Save to Downloads folder

### Step 2: Install Ollama (10 mins)

#### Windows:
```powershell
# Run downloaded installer
# Double-click ollama-windows-amd64.exe
# Accept UAC prompt
# Ollama installs to C:\Users\<YourName>\AppData\Local\Programs\Ollama
```

#### macOS:
```bash
# Open downloaded DMG file
# Drag Ollama to Applications folder
# Open Applications → Double-click Ollama
# Allow in Security & Privacy if prompted
```

#### Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 3: Verify Installation (5 mins)
```bash
# Open terminal/command prompt
ollama --version

# Expected output:
# ollama version 0.1.x
```

If command not found:
- **Windows:** Restart terminal or add to PATH: `C:\Users\<YourName>\AppData\Local\Programs\Ollama`
- **Mac/Linux:** Restart terminal

### Step 4: Download Llama 3.2 3B Model (15-20 mins)
```bash
# Pull the model (this downloads ~2GB)
ollama pull llama3.2:3b

# Progress bar will show:
# pulling manifest
# pulling 6a0746a1ec1a... 100% ▕████████████▏ 2.0 GB
# verifying sha256 digest
# success
```

**Note:** Download time depends on internet speed (2GB file)

### Step 5: Test Ollama Chat Interface (10 mins)
```bash
# Start interactive chat
ollama run llama3.2:3b

# Try these test queries:
>>> Hello, I need 10kg of oyster mushrooms in Manila

>>> Match this buyer to best seller: Need shiitake mushrooms, 5kg, Quezon City

>>> Extract product intent from: "Where can I buy growing kits?"

# Exit with: /bye
```

### Step 6: Test Ollama API (15 mins)
```bash
# Test API endpoint (for n8n integration)
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Classify this product query: I want to grow oyster mushrooms at home",
  "stream": false
}'

# Expected response (JSON):
# {
#   "model": "llama3.2:3b",
#   "created_at": "2026-01-07T12:00:00Z",
#   "response": "Product intent: Growing Kit, Product type: Oyster Mushrooms, Use case: Home cultivation",
#   "done": true
# }
```

### Step 7: Create Seller Matching Prompt (30 mins)
Create a reusable prompt template for seller matching:

```bash
ollama run llama3.2:3b
```

Test this prompt structure:
```
You are an AI seller matcher for MASH mushroom marketplace.

Buyer Request:
- Product: Oyster Mushrooms
- Quantity: 10kg
- Location: Manila

Available Sellers:
1. Juan's Farm - Oyster specialist. Location: Quezon City (15km from Manila). Capacity: 50kg/week. Rating: 4.8/5
2. Maria's Mushrooms - All types. Location: Pasig (20km). Capacity: 30kg/week. Rating: 4.5/5
3. Pedro's Organic - Shiitake focus. Location: Makati (10km). Capacity: 20kg/week. Rating: 4.9/5

Task: Rank top 3 sellers by: 1) Product specialty match, 2) Proximity, 3) Capacity availability

Return ONLY this JSON format:
{
  "topSeller": {"name": "...", "reason": "...", "distance": "..."},
  "alternatives": [
    {"name": "...", "reason": "...", "distance": "..."},
    {"name": "...", "reason": "...", "distance": "..."}
  ]
}
```

Document successful prompt in `PLANNING.md` → Phase 7

### Step 8: Integrate with n8n (45 mins)
1. Open n8n: `http://localhost:5678`
2. Create new workflow: "Test Ollama Integration"
3. Add **Webhook** node:
   - Path: `/webhook/test-ollama`
   - Method: POST
4. Add **HTTP Request** node:
   - Method: POST
   - URL: `http://host.docker.internal:11434/api/generate`
     *(Note: Use `host.docker.internal` because n8n runs in Docker)*
   - Body (JSON):
     ```json
     {
       "model": "llama3.2:3b",
       "prompt": "{{ $json.query }}",
       "stream": false
     }
     ```
5. Connect nodes: Webhook → HTTP Request
6. **Activate workflow**
7. Test with curl:
   ```bash
   curl -X POST http://localhost:5678/webhook/test-ollama \
     -H "Content-Type: application/json" \
     -d '{"query": "I need oyster mushrooms for a restaurant"}'
   ```
8. Verify n8n Executions shows success

### Step 9: Configure Auto-Start (15 mins)

#### Windows:
```powershell
# Create startup shortcut
# 1. Press Win+R, type: shell:startup
# 2. Create shortcut to: C:\Users\<YourName>\AppData\Local\Programs\Ollama\ollama.exe
# 3. Name: "Ollama AI"
```

#### macOS:
```bash
# System Settings → General → Login Items → Add Ollama app
```

#### Linux (systemd):
```bash
sudo systemctl enable ollama
```

Verify: Restart PC → Check `ollama list` shows models

### Step 10: Benchmark Performance (20 mins)
Run performance tests to document response times:

```bash
# Test 1: Simple query
time curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello",
  "stream": false
}'

# Test 2: Seller matching (complex)
time curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Match buyer to seller: 10kg oyster, Manila. Sellers: Juan (Quezon City), Maria (Pasig), Pedro (Makati). Rank by distance and specialty.",
  "stream": false
}'

# Test 3: Product intent extraction
time curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Extract product type and quantity from: I want to buy 5 kilograms of shiitake mushrooms",
  "stream": false
}'
```

Document results in `PROGRESS.md` (target: <5 seconds per query)

---

## 🔧 Troubleshooting

### Issue: "ollama: command not found"
**Solution:**
- Restart terminal
- Check PATH includes Ollama directory
- Reinstall Ollama

### Issue: Model download fails
**Solution:**
- Check internet connection
- Retry: `ollama pull llama3.2:3b`
- Clear cache: `ollama rm llama3.2:3b` then re-pull

### Issue: n8n can't reach Ollama API
**Solution:**
- Use `http://host.docker.internal:11434` (NOT `http://localhost:11434`)
- Verify Ollama running: `curl http://localhost:11434/api/tags`
- Check Docker network: `docker network ls`

### Issue: Response time >10 seconds
**Solution:**
- Check RAM usage (Task Manager/Activity Monitor)
- Close heavy apps (Chrome, Photoshop)
- Consider using smaller model: `ollama pull llama3.2:1b`

---

## 📚 Additional Resources

- [Ollama Official Docs](https://github.com/ollama/ollama/tree/main/docs)
- [Llama 3.2 Model Card](https://ollama.com/library/llama3.2)
- [n8n HTTP Request Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## 🎓 Learning Outcomes

After completing this task, you will:
- ✅ Understand how local LLMs work
- ✅ Run AI models without cloud dependencies
- ✅ Integrate Ollama with n8n workflows
- ✅ Write effective prompts for seller matching
- ✅ Benchmark AI performance on your hardware

---

## ✅ Definition of Done

- [ ] All acceptance criteria met
- [ ] All 8 tests in TESTING.md pass
- [ ] PROGRESS.md shows 🟢 Complete
- [ ] Screenshots added to PROGRESS.md
- [ ] Performance benchmarks documented
- [ ] n8n integration tested and working
- [ ] PR created (see PR-GUIDE.md)
