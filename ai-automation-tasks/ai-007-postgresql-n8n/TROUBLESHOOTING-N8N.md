# n8n Troubleshooting Guide - PostgreSQL Appointment Workflow

> **Created:** January 9, 2026  
> **Workflow:** MASH PostgreSQL Appointment System  
> **Common Issues:** Ollama Chat Model errors, credential problems, workflow activation

---

## 🔴 Issue 1: "Cannot Publish Workflow" - Ollama Chat Model Error

### Symptoms:
- Red error indicator on Ollama Chat Model nodes
- "Cannot save workflow" or "Cannot activate workflow" message
- Missing model configuration
- Connection timeout errors

### Root Causes:

#### A. Ollama Service Not Running

**Check if Ollama is running:**
```powershell
# PowerShell - Check if Ollama process is running
Get-Process ollama -ErrorAction SilentlyContinue

# If nothing appears, Ollama is NOT running
```

**Fix:**
```powershell
# Start Ollama service
ollama serve

# Should show: "Ollama is running on http://localhost:11434"
```

**Verify model is downloaded:**
```powershell
# List installed models
ollama list

# If llama3.2 is missing, pull it:
ollama pull llama3.2:latest
```

---

#### B. Incorrect Ollama Base URL in n8n

**Fix in each Ollama Chat Model node:**

1. Click any **Ollama Chat Model** node (there are 5 in the workflow)
2. Scroll down to **Base URL** field
3. Ensure it says: `http://localhost:11434`
4. If empty or different, update to: `http://localhost:11434`
5. Click **Save** (Ctrl+S)

**Expected Configuration:**
```
Model Name: llama3.2:latest
Base URL: http://localhost:11434
Temperature: 0
Max Tokens: 1000
```

---

#### C. Model Name Mismatch

**Problem:** Workflow expects `llama3.2:latest` but you have different model

**Fix:**

1. Check what models you have:
   ```powershell
   ollama list
   ```

2. If you have `llama3.2:3b` or `llama3.2`, update n8n nodes:
   - Open each **Ollama Chat Model** node
   - Change **Model Name** to match your installed model
   - Example: `llama3.2:3b` or `llama3.2`

**Available Models (choose one):**
- `llama3.2:latest` (recommended, 3B parameters)
- `llama3.2:3b` (same as above)
- `llama3.2:1b` (faster, less accurate)

---

#### D. Firewall Blocking Ollama

**Check if port 11434 is accessible:**
```powershell
# PowerShell - Test Ollama connection
Invoke-RestMethod -Uri "http://localhost:11434" -Method GET
```

**Expected Output:**
```
Ollama is running
```

**If it fails:**
1. Check Windows Firewall settings
2. Allow incoming connections on port 11434
3. Restart Ollama service

---

## 🔴 Issue 2: PostgreSQL Credential Error

### Symptoms:
- Red error on PostgreSQL nodes
- "Credentials not configured" warning
- "Connection refused" or "SSL required" errors

### Fix A: SSL Not Enabled (MOST COMMON)

**Steps:**

1. Go to **Settings** (⚙️ bottom left) → **Credentials**
2. Find **"Neon PostgreSQL - MASH"** credential
3. Click **Edit** (pencil icon)
4. Scroll down to **SSL** section
5. ✅ **CHECK THE "SSL" CHECKBOX** ← CRITICAL!
6. Set **SSL Mode** to: `require`
7. Click **Save**
8. Go back to workflow
9. Click **Save** workflow again (Ctrl+S)

**Correct Configuration:**
```
Host: ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech
Database: Namias
User: Namias_owner
Password: SyuJeBKs09iN
Port: 5432
SSL: ✅ CHECKED
SSL Mode: require
```

---

### Fix B: Credential Not Linked to Nodes

**Problem:** Credential exists but nodes aren't using it

**Steps:**

1. Go to workflow canvas
2. Click first **PostgreSQL node**: "Query Growers"
3. In right panel, find **Credential for Postgres** dropdown
4. Select: **Neon PostgreSQL - MASH**
5. Repeat for ALL 10 PostgreSQL nodes:
   - Query Growers
   - Get Seller Available Slots
   - Query Availability Slots
   - Check Slot Available
   - Create Appointment
   - Mark Slot as Booked
   - Get Appointment
   - Cancel Appointment
   - Release Slot
   - Query Appointments

6. Save workflow (Ctrl+S)

---

## 🔴 Issue 3: Workflow Won't Activate

### Symptoms:
- Toggle switch stays OFF (gray)
- "Workflow has errors" message
- Red error indicators on nodes

### Fix Checklist:

**1. Check All Nodes for Errors**
```
☐ All 5 Ollama Chat Model nodes are green (no red !)
☐ All 10 PostgreSQL nodes are green
☐ Webhook node is configured (path: mash-appointments)
☐ All AI Agent nodes connected properly
```

**2. Verify Ollama Service**
```powershell
# Must be running BEFORE activating workflow
ollama serve
```

**3. Test Credential**
- Go to Settings → Credentials → Neon PostgreSQL - MASH
- Click **Test** button
- Should show: "Connection successful ✅"

**4. Save Workflow First**
- Press Ctrl+S to save
- THEN toggle Active switch
- Wait 2-3 seconds for activation

**5. Check n8n Logs**
```powershell
# If using Docker
docker logs n8n-container-name

# Look for error messages about:
# - Ollama connection
# - PostgreSQL connection
# - Missing credentials
```

---

## 🔴 Issue 4: Test Script Fails

### Symptoms:
- `test-neon-workflow.ps1` shows ❌ FAIL
- "Connection refused" errors
- Empty responses

### Fix A: Workflow Not Activated

**Check:**
1. Open n8n at http://localhost:5678
2. Go to **Workflows**
3. Find **"MASH Appointments - PostgreSQL"**
4. Look for **Active** toggle (top right)
5. Should be **green/ON**

**If OFF:**
- Click toggle to turn ON
- Wait for "Workflow activated successfully" message

---

### Fix B: Wrong Webhook URL

**Check webhook URL in test script:**
```powershell
# Open test-neon-workflow.ps1
# Line 8 should say:
$webhookUrl = "http://localhost:5678/webhook/mash-appointments"
```

**Verify in n8n:**
1. Click **Webhook** node in workflow
2. Check **Path** field
3. Should be: `mash-appointments` (no leading /)

---

### Fix C: Ollama Taking Too Long

**Problem:** AI inference timeout (>30 seconds)

**Fix:**

1. **Use smaller model:**
   ```powershell
   ollama pull llama3.2:1b
   ```

2. **Update n8n nodes:**
   - Change Model Name to: `llama3.2:1b`

3. **Increase timeout in test script:**
   ```powershell
   # Edit test-neon-workflow.ps1, line ~40
   $response = Invoke-RestMethod -Uri $webhookUrl -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60
   # Change TimeoutSec from 30 to 60
   ```

---

## 🟢 Quick Health Check Script

Run this to verify everything is ready:

```powershell
# Save as check-system.ps1

Write-Host "🔍 System Health Check" -ForegroundColor Cyan
Write-Host ""

# 1. Check Ollama
Write-Host "1. Checking Ollama..." -ForegroundColor Yellow
try {
    $ollama = Invoke-RestMethod -Uri "http://localhost:11434" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Ollama running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ollama NOT running - Run: ollama serve" -ForegroundColor Red
}

# 2. Check Ollama models
Write-Host "2. Checking Ollama models..." -ForegroundColor Yellow
$models = ollama list 2>$null
if ($models -match "llama3.2") {
    Write-Host "   ✅ llama3.2 model installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ llama3.2 missing - Run: ollama pull llama3.2:latest" -ForegroundColor Red
}

# 3. Check n8n
Write-Host "3. Checking n8n..." -ForegroundColor Yellow
try {
    $n8n = Invoke-RestMethod -Uri "http://localhost:5678" -Method GET -TimeoutSec 5
    Write-Host "   ✅ n8n running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ n8n NOT running - Check Docker" -ForegroundColor Red
}

# 4. Check database connection
Write-Host "4. Checking database..." -ForegroundColor Yellow
# Note: This requires psql installed
$env:PGPASSWORD = "SyuJeBKs09iN"
$dbTest = psql "postgresql://Namias_owner@ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech/Namias?sslmode=require" -c "SELECT 1" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Database accessible" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cannot verify database (psql not installed or connection issue)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Summary: Check all ✅ before running tests" -ForegroundColor Cyan
```

---

## 📋 Pre-Test Checklist

Before running `test-neon-workflow.ps1`:

```
☐ Ollama service running (ollama serve)
☐ llama3.2:latest model downloaded
☐ n8n accessible at http://localhost:5678
☐ Workflow "MASH Appointments - PostgreSQL" activated (green toggle)
☐ PostgreSQL credential tested successfully (green ✅)
☐ All 5 Ollama Chat Model nodes configured with localhost:11434
☐ All 10 PostgreSQL nodes linked to credential
☐ Database has 672 availability slots (verify in Neon Console)
```

---

## 🆘 Still Having Issues?

### Step 1: Check n8n Executions Log

1. Open n8n at http://localhost:5678
2. Click **Executions** in left sidebar
3. Find latest failed execution (red X)
4. Click to see detailed error message
5. Look for:
   - "Connection refused" → Service not running
   - "SSL required" → SSL checkbox not enabled
   - "Model not found" → Wrong model name
   - "Timeout" → Ollama too slow, use smaller model

### Step 2: Test Each Component Separately

**Test Ollama:**
```powershell
ollama run llama3.2:latest "Say hello"
# Should respond with greeting
```

**Test PostgreSQL:**
```powershell
psql "postgresql://Namias_owner:SyuJeBKs09iN@ep-wispy-thunder-a5pqgxiw-pooler.us-east-2.aws.neon.tech/Namias?sslmode=require" -c "SELECT COUNT(*) FROM growers;"
# Should show: 3
```

**Test n8n Webhook:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"test"}' -ContentType "application/json"
# Should return JSON response (even if error about invalid action)
```

### Step 3: Restart Everything

```powershell
# Stop Ollama (Ctrl+C in terminal where it's running)
# Stop n8n (Ctrl+C or docker stop n8n)

# Wait 10 seconds

# Start Ollama
ollama serve

# Start n8n (in new terminal)
docker start n8n

# Wait 30 seconds for services to initialize

# Try tests again
.\test-neon-workflow.ps1
```

---

## 📞 Error Code Reference

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Ollama is not running" | Service stopped | Run `ollama serve` |
| "Model not found: llama3.2" | Model not downloaded | Run `ollama pull llama3.2:latest` |
| "Connection refused (localhost:11434)" | Wrong URL or firewall | Check Base URL, disable firewall |
| "SSL connection required" | SSL not enabled | Enable SSL checkbox in credential |
| "Credential not configured" | Node missing credential | Link credential to all PostgreSQL nodes |
| "Workflow has errors" | Nodes misconfigured | Check all red ! indicators |
| "Cannot activate workflow" | Ollama/DB offline | Start services, test credential |
| "Timeout after 30000ms" | Ollama too slow | Use llama3.2:1b or increase timeout |

---

**Last Updated:** January 9, 2026  
**Status:** Ready for troubleshooting
