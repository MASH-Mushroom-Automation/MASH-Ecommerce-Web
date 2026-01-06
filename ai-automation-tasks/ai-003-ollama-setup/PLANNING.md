# AI-003: Ollama Setup - Implementation Plan

> **Task:** Ollama + Llama 3.2 3B Installation  
> **Story Points:** 10  
> **Estimated Time:** 5-7 hours

---

## 🎯 Planning Philosophy

This document breaks down Ollama installation into **8 manageable phases** to ensure:
1. **Incremental progress** - One phase at a time
2. **Easy testing** - Verify each component works
3. **Clear documentation** - Track decisions and results
4. **Rollback safety** - Can uninstall if issues arise

**After completing each phase, update PROGRESS.md with checkmark ✅**

---

## 📋 Phase Breakdown

### Phase 1: Pre-Installation Checks (20 mins)
**Goal:** Verify system meets requirements

#### Tasks:
- [ ] Check RAM: 8GB+ available
- [ ] Check disk space: 10GB+ free
- [ ] Verify internet connection speed
- [ ] Check port 11434 is not in use
- [ ] Confirm AI-002 (n8n) is complete

#### Verification Commands:
```bash
# Windows - Check RAM
systeminfo | findstr "Total Physical Memory"

# Windows - Check disk space
wmic logicaldisk get size,freespace,caption

# Check port availability
netstat -ano | findstr :11434
```

#### Expected Output:
- RAM: 8192MB or higher
- Free space: 10GB+
- Port 11434: Empty (no process using it)

#### Blockers/Issues:
- **Not enough RAM?** → Close heavy applications or upgrade
- **Port 11434 in use?** → Kill process or configure Ollama to use different port
- **Slow internet?** → Plan model download during off-peak hours

---

### Phase 2: Download Ollama Installer (15 mins)
**Goal:** Get correct Ollama installer for your OS

#### Tasks:
- [ ] Visit [ollama.com/download](https://ollama.com/download)
- [ ] Identify your OS (Windows/Mac/Linux)
- [ ] Download appropriate installer
- [ ] Verify download integrity (check file size)
- [ ] Save to known location (Desktop or Downloads)

#### Expected File Sizes:
- Windows: ~100-150MB (ollama-windows-amd64.exe)
- macOS: ~80-120MB (Ollama.dmg)
- Linux: Script-based (no pre-download)

#### Verification:
```bash
# Windows - Check downloaded file
dir Downloads\ollama-windows-amd64.exe

# macOS
ls -lh ~/Downloads/Ollama.dmg
```

#### Blockers/Issues:
- **Download fails?** → Use different browser or check firewall
- **Slow download?** → Use download manager (Free Download Manager, IDM)

---

### Phase 3: Install Ollama (20 mins)
**Goal:** Install Ollama binary and verify it runs

#### Tasks:
- [ ] Run installer (double-click or execute script)
- [ ] Accept default installation path
- [ ] Allow firewall/security prompts
- [ ] Wait for installation to complete
- [ ] Restart terminal/command prompt
- [ ] Verify `ollama --version` command works

#### Installation Commands:

**Windows:**
```powershell
# Double-click installer, then:
ollama --version
```

**macOS:**
```bash
# Drag to Applications, then:
ollama --version
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama --version
```

#### Expected Output:
```
ollama version 0.1.x (or higher)
```

#### Verification:
- Ollama appears in installed programs list
- `ollama` command recognized in fresh terminal
- No error messages

#### Blockers/Issues:
- **"ollama not recognized"?** → Add to PATH manually or restart PC
- **Installation hangs?** → Run as Administrator (Windows) or use `sudo` (Linux)
- **Antivirus blocks?** → Temporarily disable or add exception

---

### Phase 4: Download Llama 3.2 3B Model (25 mins)
**Goal:** Pull AI model for local inference

#### Tasks:
- [ ] Open terminal
- [ ] Run: `ollama pull llama3.2:3b`
- [ ] Monitor download progress (2GB download)
- [ ] Wait for "success" message
- [ ] Verify model installed: `ollama list`

#### Download Command:
```bash
ollama pull llama3.2:3b
```

#### Expected Output:
```
pulling manifest
pulling 6a0746a1ec1a... 100% ▕████████████▏ 2.0 GB
verifying sha256 digest
writing manifest
success
```

#### Verification:
```bash
ollama list

# Should show:
# NAME              ID              SIZE    MODIFIED
# llama3.2:3b       abc123...       2.0 GB  5 minutes ago
```

#### Time Estimate by Internet Speed:
- 100 Mbps: ~3 minutes
- 50 Mbps: ~5 minutes
- 25 Mbps: ~10 minutes
- 10 Mbps: ~20-25 minutes

#### Blockers/Issues:
- **Download interrupted?** → Re-run `ollama pull` (resumes automatically)
- **"Failed to pull"?** → Check firewall, try VPN if blocked
- **Slow download?** → Use off-peak hours, pause other downloads

---

### Phase 5: Test Ollama Chat Interface (30 mins)
**Goal:** Verify model responds correctly to prompts

#### Tasks:
- [ ] Start interactive session: `ollama run llama3.2:3b`
- [ ] Test simple query: "Hello, how are you?"
- [ ] Test product query: "I need oyster mushrooms"
- [ ] Test seller matching prompt (see below)
- [ ] Test JSON response formatting
- [ ] Document response quality
- [ ] Exit with `/bye`

#### Test Queries:
```bash
ollama run llama3.2:3b

>>> Hello, how are you?
# Expect: Friendly greeting response

>>> I need 10kg of oyster mushrooms in Manila
# Expect: Relevant mushroom-related response

>>> Match this buyer to best seller: Product: Oyster, Quantity: 10kg, Location: Manila. Sellers: Juan (Quezon City, 15km), Maria (Pasig, 20km). Rank by distance.
# Expect: Ranked list with reasoning

>>> Extract product intent from: "Where can I buy growing kits?"
# Expect: JSON-like structured response

>>> /bye
```

#### Expected Behavior:
- Model loads in <10 seconds
- Responses appear within 3-5 seconds
- Responses are coherent and relevant
- No error messages or crashes

#### Verification Checklist:
- [ ] Model responds to general queries
- [ ] Understands mushroom domain context
- [ ] Can perform matching/ranking tasks
- [ ] Produces structured output (JSON-like)

#### Blockers/Issues:
- **Model too slow (>10s)?** → Check RAM usage, close other apps
- **Gibberish responses?** → Model may be corrupted, re-pull
- **Crash during query?** → Check system logs, may need more RAM

---

### Phase 6: Test Ollama API Endpoint (45 mins)
**Goal:** Verify HTTP API works for n8n integration

#### Tasks:
- [ ] Test API with curl (simple query)
- [ ] Test with JSON prompt
- [ ] Test `stream: false` mode
- [ ] Verify response JSON structure
- [ ] Document API endpoint: `http://localhost:11434/api/generate`
- [ ] Create sample request template

#### API Test Commands:
```bash
# Test 1: Simple Hello World
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello, world!",
  "stream": false
}'

# Expected: JSON response with "response" field

# Test 2: Seller Matching
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Match buyer to seller: Need 10kg oyster mushrooms in Manila. Sellers: Juan (Quezon City, oyster specialist, 50kg capacity), Maria (Pasig, all types, 30kg capacity). Rank top seller.",
  "stream": false
}'

# Test 3: JSON Response
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Extract product type from: I want shiitake mushrooms. Return JSON: {\"product\": \"...\", \"quantity\": null}",
  "stream": false,
  "format": "json"
}'
```

#### Response Structure:
```json
{
  "model": "llama3.2:3b",
  "created_at": "2026-01-07T12:00:00Z",
  "response": "Based on proximity and specialty, Juan is the best match...",
  "done": true,
  "context": [/* token context */],
  "total_duration": 5234891237,
  "load_duration": 234891,
  "prompt_eval_count": 42,
  "eval_count": 87
}
```

#### Verification:
- [ ] All test queries return HTTP 200
- [ ] JSON responses parse correctly
- [ ] `response` field contains text
- [ ] `done: true` indicates completion
- [ ] Response time <10 seconds

#### Blockers/Issues:
- **"Connection refused"?** → Ollama service not running: `ollama serve`
- **Empty response?** → Check `stream` parameter is `false`
- **Timeout errors?** → Increase timeout, check system resources

---

### Phase 7: n8n Integration Test (60 mins)
**Goal:** Connect Ollama to n8n workflows

#### Tasks:
- [ ] Open n8n: `http://localhost:5678`
- [ ] Create workflow: "Ollama Integration Test"
- [ ] Add Webhook node (trigger)
- [ ] Add HTTP Request node (call Ollama)
- [ ] Add Function node (parse response)
- [ ] Connect all nodes
- [ ] Activate workflow
- [ ] Test with curl
- [ ] Verify execution logs

#### n8n Workflow Setup:

**Node 1: Webhook**
- Name: "Buyer Request"
- Path: `/webhook/test-ollama`
- Method: POST
- Response Mode: "When Last Node Finishes"

**Node 2: HTTP Request**
- Name: "Call Ollama"
- Method: POST
- URL: `http://host.docker.internal:11434/api/generate`
- Body Type: JSON
- Body:
  ```json
  {
    "model": "llama3.2:3b",
    "prompt": "{{ $json.query }}",
    "stream": false
  }
  ```

**Node 3: Function**
- Name: "Parse AI Response"
- JavaScript:
  ```javascript
  const aiResponse = $input.item.json.response;
  return {
    json: {
      originalQuery: $('Buyer Request').item.json.query,
      aiResponse: aiResponse,
      timestamp: new Date().toISOString()
    }
  };
  ```

#### Test Command:
```bash
curl -X POST http://localhost:5678/webhook/test-ollama \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Match buyer needing 10kg oyster mushrooms in Manila to best seller from: Juan (Quezon), Maria (Pasig)"
  }'
```

#### Expected Workflow Result:
```json
{
  "originalQuery": "Match buyer...",
  "aiResponse": "Juan from Quezon is the best match because...",
  "timestamp": "2026-01-07T12:34:56Z"
}
```

#### Verification:
- [ ] Workflow executes without errors
- [ ] n8n Executions shows "Success"
- [ ] Ollama response appears in n8n output
- [ ] Response time <15 seconds total

#### Blockers/Issues:
- **"Cannot reach host.docker.internal"?** → 
  - Windows/Mac: Update Docker Desktop
  - Linux: Use `http://172.17.0.1:11434` instead
- **Workflow times out?** → Increase n8n timeout in Settings
- **Response empty?** → Check Ollama logs: `docker logs n8n`

---

### Phase 8: Configure Auto-Start & Documentation (45 mins)
**Goal:** Ensure Ollama persists across reboots

#### Tasks:
- [ ] Configure Ollama auto-start (OS-specific)
- [ ] Test restart: Reboot PC → Check `ollama list`
- [ ] Document successful prompts in `prompts/` folder
- [ ] Create troubleshooting guide
- [ ] Update PROGRESS.md with completion
- [ ] Take screenshots for PR

#### Auto-Start Configuration:

**Windows:**
```powershell
# Option 1: Startup Folder
Win+R → shell:startup → Create shortcut to ollama.exe

# Option 2: Task Scheduler
# Create task: Run "ollama serve" at startup
```

**macOS:**
```bash
# System Settings → General → Login Items → Add Ollama
```

**Linux (systemd):**
```bash
sudo systemctl enable ollama
sudo systemctl start ollama
```

#### Verification Steps:
1. Restart computer
2. Open terminal (do NOT start Ollama manually)
3. Run: `ollama list`
4. Should show Llama 3.2 model without errors

#### Documentation Checklist:
- [ ] Create `prompts/seller-matching-prompt.md`
- [ ] Document API endpoints in README
- [ ] Add troubleshooting section with common errors
- [ ] Screenshot n8n integration workflow
- [ ] Add performance benchmark results

#### Final Checks:
- [ ] All 8 phases completed
- [ ] TESTING.md tests pass (run all 12 tests)
- [ ] PROGRESS.md updated to 🟢 Complete
- [ ] Ready to move to AI-004

---

## 📊 Time Estimates Summary

| Phase | Estimated Time | Cumulative |
|-------|---------------|------------|
| 1. Pre-checks | 20 min | 0:20 |
| 2. Download | 15 min | 0:35 |
| 3. Install | 20 min | 0:55 |
| 4. Pull Model | 25 min | 1:20 |
| 5. Chat Test | 30 min | 1:50 |
| 6. API Test | 45 min | 2:35 |
| 7. n8n Integration | 60 min | 3:35 |
| 8. Auto-Start | 45 min | 4:20 |

**Total Estimated Time:** 4-5 hours (may vary by internet speed and PC specs)

---

## 🎯 Success Criteria

At the end of Phase 8, you should have:
- ✅ Ollama running and auto-starting
- ✅ Llama 3.2 3B model operational
- ✅ n8n workflow calling Ollama successfully
- ✅ Response time <10 seconds
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Ready to move to AI-004 (Appointment Widget)

---

## 💡 Pro Tips

1. **Test early, test often** - Don't wait until Phase 8 to test
2. **Document errors immediately** - Screenshots help debugging
3. **Use consistent prompts** - Makes testing reproducible
4. **Monitor resource usage** - Task Manager/Activity Monitor
5. **Save successful prompts** - Build prompt library for reuse
