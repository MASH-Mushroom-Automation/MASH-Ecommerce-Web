# AI-003: Ollama Setup - Testing Guide

> **Test Coverage Goal:** 100% (all critical paths verified)  
> **Test Environment:** Local development (Ollama + n8n)

---

## 🎯 Testing Philosophy

We test Ollama installation at **three levels:**
1. **Installation Tests** - Verify Ollama is installed correctly
2. **Model Tests** - Confirm Llama 3.2 3B works properly
3. **Integration Tests** - Ensure n8n can communicate with Ollama

**All tests must pass before marking task as complete.**

---

## ✅ Pre-Test Checklist

Before running tests, ensure:
- [ ] Ollama installed (`ollama --version` works)
- [ ] Llama 3.2 3B model downloaded (`ollama list` shows it)
- [ ] Ollama service running (check Task Manager/Activity Monitor)
- [ ] n8n container active (`docker ps` shows n8n)
- [ ] Terminal open with admin/sudo privileges

---

## 🧪 Test Cases

### Test Suite 1: Installation Verification

#### Test 1.1: Ollama Version Check
**Goal:** Verify Ollama is installed and accessible

```bash
ollama --version
```

**Expected Output:**
```
ollama version 0.1.x (or higher)
```

**Pass Criteria:**
- ✅ Command runs without errors
- ✅ Version number displayed
- ✅ No "command not found" error

**Fail Actions:**
- Reinstall Ollama
- Add Ollama to system PATH
- Restart terminal

---

#### Test 1.2: Ollama Service Status
**Goal:** Confirm Ollama background service is running

```bash
# Check if Ollama API is accessible
curl http://localhost:11434/api/tags
```

**Expected Output:**
```json
{
  "models": [
    {
      "name": "llama3.2:3b",
      "modified_at": "2026-01-07T12:00:00Z",
      "size": 2014000000
    }
  ]
}
```

**Pass Criteria:**
- ✅ HTTP 200 response
- ✅ JSON contains "models" array
- ✅ Llama 3.2 model listed

**Fail Actions:**
- Start Ollama service: `ollama serve`
- Check firewall settings
- Verify port 11434 not blocked

---

#### Test 1.3: Model List Verification
**Goal:** Ensure Llama 3.2 3B model is downloaded

```bash
ollama list
```

**Expected Output:**
```
NAME              ID              SIZE    MODIFIED
llama3.2:3b       6a0746a1ec1a    2.0 GB  5 minutes ago
```

**Pass Criteria:**
- ✅ Llama3.2:3b appears in list
- ✅ Size is ~2.0 GB
- ✅ No corruption errors

**Fail Actions:**
- Re-pull model: `ollama pull llama3.2:3b`
- Check disk space
- Clear cache: `ollama rm llama3.2:3b` then re-pull

---

### Test Suite 2: Model Functionality

#### Test 2.1: Simple Inference Test
**Goal:** Verify model responds to basic prompts

```bash
ollama run llama3.2:3b "Hello, how are you?"
```

**Expected Output:**
```
Hello! I'm doing well, thank you for asking. How can I assist you today?
```

**Pass Criteria:**
- ✅ Response appears within 10 seconds
- ✅ Response is coherent and relevant
- ✅ No error messages or crashes
- ✅ Can exit with `/bye`

**Fail Actions:**
- Check RAM usage (close heavy apps)
- Restart Ollama service
- Re-pull model if responses are gibberish

---

#### Test 2.2: Product Intent Extraction
**Goal:** Test AI can understand mushroom product queries

```bash
ollama run llama3.2:3b "Extract product type and quantity from: I want 10kg of oyster mushrooms"
```

**Expected Output:**
```
Product type: Oyster Mushrooms
Quantity: 10kg (10 kilograms)
Intent: Purchase inquiry
```

**Pass Criteria:**
- ✅ Correctly identifies product (oyster)
- ✅ Correctly extracts quantity (10kg)
- ✅ Response time <8 seconds

**Fail Actions:**
- Refine prompt with more specific instructions
- Test with simpler queries first
- Check model hasn't been corrupted

---

#### Test 2.3: Seller Matching Logic
**Goal:** Verify AI can rank sellers by criteria

```bash
ollama run llama3.2:3b "Match buyer to best seller: Buyer needs 10kg oyster mushrooms in Manila. Sellers: 1) Juan's Farm (Quezon City, 15km, oyster specialist, 50kg capacity), 2) Maria's Mushrooms (Pasig, 20km, all types, 30kg capacity). Rank top seller."
```

**Expected Output:**
```
Top Seller: Juan's Farm

Reasoning:
1. Proximity: 15km from Manila (closest)
2. Specialty: Oyster mushroom expert (perfect match)
3. Capacity: 50kg/week (can fulfill 10kg order easily)

Alternative: Maria's Mushrooms (backup option, slightly farther but good capacity)
```

**Pass Criteria:**
- ✅ Correctly ranks Juan as #1
- ✅ Provides logical reasoning
- ✅ Considers distance, specialty, capacity
- ✅ Response time <10 seconds

**Fail Actions:**
- Simplify prompt (fewer seller options)
- Add explicit ranking criteria in prompt
- Test with different seller combinations

---

#### Test 2.4: JSON Response Formatting
**Goal:** Ensure AI can return structured JSON

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Extract product info from: Need 5kg shiitake. Return JSON: {\"product\": \"...\", \"quantity_kg\": <number>}",
  "stream": false,
  "format": "json"
}'
```

**Expected Output:**
```json
{
  "model": "llama3.2:3b",
  "response": "{\"product\": \"shiitake\", \"quantity_kg\": 5}",
  "done": true
}
```

**Pass Criteria:**
- ✅ Response is valid JSON
- ✅ Contains expected fields (product, quantity_kg)
- ✅ Correctly extracted values

**Fail Actions:**
- Add explicit JSON format instruction in prompt
- Parse response manually if JSON parsing fails
- Use `"format": "json"` parameter

---

### Test Suite 3: API Integration

#### Test 3.1: HTTP API Basic Call
**Goal:** Test Ollama API responds via HTTP

```bash
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Say hello",
  "stream": false
}'
```

**Expected Output:**
```json
{
  "model": "llama3.2:3b",
  "response": "Hello! How can I help you today?",
  "done": true,
  "total_duration": 5234891237,
  "load_duration": 234891,
  "prompt_eval_count": 10,
  "eval_count": 25
}
```

**Pass Criteria:**
- ✅ HTTP 200 status code
- ✅ Valid JSON response
- ✅ `done: true` field present
- ✅ `response` field contains text

**Fail Actions:**
- Check Ollama is running: `ollama serve`
- Verify port 11434 accessible
- Test with simpler prompt

---

#### Test 3.2: Ollama from n8n (Docker Network)
**Goal:** Verify n8n container can reach Ollama

**Pre-requisite:** n8n running (`docker ps` shows n8n)

1. Open n8n: `http://localhost:5678`
2. Create test workflow with HTTP Request node
3. Configure node:
   - URL: `http://host.docker.internal:11434/api/generate`
   - Method: POST
   - Body:
     ```json
     {
       "model": "llama3.2:3b",
       "prompt": "Test from n8n",
       "stream": false
     }
     ```
4. Execute node manually

**Expected Output:**
- n8n node shows "Success" (green)
- Output contains `response` field with text
- No connection errors

**Pass Criteria:**
- ✅ Node executes without errors
- ✅ Response received from Ollama
- ✅ Total execution time <15 seconds

**Fail Actions:**
- Use `http://172.17.0.1:11434` (Linux alternative)
- Check Docker network: `docker network inspect bridge`
- Test from n8n terminal: `docker exec -it n8n curl http://host.docker.internal:11434/api/tags`

---

#### Test 3.3: n8n Webhook → Ollama Workflow
**Goal:** End-to-end test of buyer request workflow

**Setup:**
1. Create n8n workflow:
   - Webhook node → HTTP Request (Ollama) → Response node
2. Activate workflow
3. Note webhook URL: `http://localhost:5678/webhook/test-ollama`

**Test Command:**
```bash
curl -X POST http://localhost:5678/webhook/test-ollama \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need 10kg oyster mushrooms in Manila"
  }'
```

**Expected Output:**
```json
{
  "query": "I need 10kg oyster mushrooms in Manila",
  "aiResponse": "Based on your query, I recommend...",
  "timestamp": "2026-01-07T12:34:56Z"
}
```

**Pass Criteria:**
- ✅ Webhook receives request
- ✅ Ollama processes query
- ✅ n8n returns AI response
- ✅ Total time <15 seconds
- ✅ n8n Executions shows "Success"

**Fail Actions:**
- Check workflow is activated (toggle switch)
- Verify Ollama is running
- Check n8n execution logs for errors
- Test each node individually

---

### Test Suite 4: Performance & Stress Tests

#### Test 4.1: Response Time Benchmark
**Goal:** Measure average inference speed

**Test Script:**
```bash
# Test 10 queries and calculate average
for i in {1..10}; do
  echo "Query $i:"
  time curl -X POST http://localhost:11434/api/generate -d '{
    "model": "llama3.2:3b",
    "prompt": "Hello",
    "stream": false
  }' -s > /dev/null
done
```

**Expected Results:**
- Average time: <5 seconds per query
- No timeouts or errors
- Consistent performance (variance <2 seconds)

**Pass Criteria:**
- ✅ 10/10 queries succeed
- ✅ Average <5 seconds
- ✅ No crashes or hangs

**Fail Actions:**
- Close resource-heavy applications
- Check RAM usage (should have 2GB+ free)
- Restart Ollama service
- Consider using lighter model: `llama3.2:1b`

---

#### Test 4.2: Concurrent Request Handling
**Goal:** Test Ollama handles multiple simultaneous requests

**Test (requires GNU parallel or similar):**
```bash
# 3 concurrent requests
parallel -j3 curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Test {}",
  "stream": false
}' ::: 1 2 3
```

**Expected Results:**
- All 3 requests complete successfully
- No errors or timeouts
- Total time <20 seconds

**Pass Criteria:**
- ✅ 3/3 requests succeed
- ✅ No "too many requests" errors
- ✅ System remains responsive

**Fail Actions:**
- Test with 1 request at a time (find limit)
- Check system resources (RAM, CPU)
- Adjust n8n concurrent execution limit

---

#### Test 4.3: Auto-Start Verification
**Goal:** Verify Ollama starts on PC boot

**Test Steps:**
1. Ensure Ollama auto-start is configured
2. Restart computer
3. Wait 2 minutes after login
4. **DO NOT** manually start Ollama
5. Run: `ollama list`

**Expected Output:**
```
NAME              ID              SIZE    MODIFIED
llama3.2:3b       6a0746a1ec1a    2.0 GB  ...
```

**Pass Criteria:**
- ✅ `ollama list` works without manual start
- ✅ No "connection refused" errors
- ✅ Ollama appears in startup processes

**Fail Actions:**
- Reconfigure auto-start (see PLANNING.md Phase 8)
- Check startup logs for errors
- Verify Ollama path in startup config

---

## 📊 Test Results Summary

| Test Suite | Tests Passed | Tests Failed | Pass Rate |
|------------|-------------|--------------|-----------|
| 1. Installation | __/3 | __ | __% |
| 2. Model Functionality | __/4 | __ | __% |
| 3. API Integration | __/3 | __ | __% |
| 4. Performance | __/3 | __ | __% |
| **Total** | **__/13** | **__** | **___%** |

**Required Pass Rate:** 100% (13/13 tests)

---

## 🐛 Known Issues & Workarounds

### Issue: Slow first query after boot
**Workaround:** Ollama loads model into RAM on first use. Subsequent queries are faster. Create a "warmup" n8n workflow that runs a simple query on startup.

### Issue: n8n timeout on large prompts
**Workaround:** Increase n8n HTTP Request timeout to 60 seconds in node settings.

### Issue: Ollama RAM usage high
**Workaround:** Llama 3.2 3B needs ~3-4GB RAM. Close browsers/apps before AI tasks. Consider `llama3.2:1b` (1GB smaller model).

---

## ✅ Final Validation Checklist

Before marking AI-003 as complete:

- [ ] All 13 tests pass
- [ ] Performance benchmarks documented
- [ ] n8n integration working
- [ ] Auto-start tested and verified
- [ ] Prompts documented for reuse
- [ ] Test results logged in PROGRESS.md
- [ ] Screenshots added to PROGRESS.md

**Task Status:** 🔴 Not Ready | 🟡 Testing | 🟢 All Tests Pass
