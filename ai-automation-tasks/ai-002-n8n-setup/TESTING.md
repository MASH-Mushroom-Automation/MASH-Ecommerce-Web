# AI-002: n8n Setup - Testing Guide

> **Test Coverage Goal:** 100% (all critical paths verified)  
> **Test Environment:** Local development (Docker + n8n)

---

## 🎯 Testing Philosophy

We test n8n setup at **three levels:**
1. **Installation Tests** - Verify Docker & n8n are installed correctly
2. **Integration Tests** - Confirm n8n can connect to Firebase
3. **Functional Tests** - Ensure workflows execute end-to-end

**All tests must pass before marking task as complete.**

---

## ✅ Pre-Test Checklist

Before running tests, ensure:
- [ ] Docker Desktop is running
- [ ] n8n container is active (`docker ps` shows n8n)
- [ ] n8n UI accessible at `http://localhost:5678`
- [ ] Firebase Admin SDK credential saved in n8n
- [ ] Test workflow is ACTIVE in n8n

---

## 🧪 Test Cases

### Test Suite 1: Docker Installation (Level 1)

#### Test 1.1: Docker Version Check
**Goal:** Verify Docker is installed and working

```bash
docker --version
```

**Expected Output:**
```
Docker version 24.x.x, build <hash>
```

**Pass Criteria:**
- ✅ Command runs without errors
- ✅ Version is 20.x or higher

**Fail Actions:**
- Reinstall Docker Desktop
- Restart computer and try again

---

#### Test 1.2: Docker Hello World
**Goal:** Confirm Docker can pull and run containers

```bash
docker run hello-world
```

**Expected Output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

**Pass Criteria:**
- ✅ Image pulls successfully
- ✅ Container runs and exits with code 0
- ✅ No error messages

---

#### Test 1.3: n8n Container Running
**Goal:** Check n8n container is active

```bash
docker ps | grep n8n
```

**Expected Output:**
```
abc123def  n8nio/n8n  "..."  Up 2 minutes  0.0.0.0:5678->5678/tcp  n8n
```

**Pass Criteria:**
- ✅ n8n container appears in list
- ✅ Status shows "Up X minutes" (not "Exited")
- ✅ Port 5678 is mapped correctly

---

### Test Suite 2: n8n UI & Credentials (Level 2)

#### Test 2.1: n8n UI Accessibility
**Goal:** Confirm n8n web interface loads

**Steps:**
1. Open browser to `http://localhost:5678`
2. Login with admin credentials

**Expected Output:**
- Login page loads without errors
- After login, see n8n dashboard
- Top navigation shows: Workflows, Credentials, Executions

**Pass Criteria:**
- ✅ Page loads in <3 seconds
- ✅ No console errors in browser DevTools (F12)
- ✅ Can navigate between tabs

---

#### Test 2.2: Firebase Credential Verification
**Goal:** Ensure Firebase Admin SDK is configured

**Steps:**
1. In n8n UI, go to "Credentials" tab
2. Find "Firebase Admin SDK" credential
3. Click "Edit" (don't save, just view)

**Expected Output:**
- Credential shows masked JSON data
- Name: "Firebase Admin SDK"
- Type: "Google Service Account"

**Pass Criteria:**
- ✅ Credential exists in list
- ✅ No error indicators (red exclamation marks)
- ✅ Masked JSON visible when editing

---

### Test Suite 3: Workflow Execution (Level 3)

#### Test 3.1: Webhook Trigger Test
**Goal:** Verify webhook receives POST requests

**Steps:**
1. Ensure "Test Firebase Connection" workflow is ACTIVE
2. Send POST request:
   ```bash
   curl -X POST http://localhost:5678/webhook/test-firestore
   ```

**Expected Output:**
```json
{
  "success": true,
  "data": { /* Firestore document */ }
}
```

**Pass Criteria:**
- ✅ Response status: 200 OK
- ✅ Response time: <5 seconds
- ✅ Response contains JSON data

**Debugging:**
- If fails, check: `docker logs n8n`
- Verify workflow is ACTIVE (toggle switch ON)
- Check Firestore document ID exists

---

#### Test 3.2: Firestore Read Operation
**Goal:** Confirm n8n can read from Firestore

**Steps:**
1. After Test 3.1, go to n8n "Executions" tab
2. Click the most recent execution (should be green)
3. View data flow between nodes

**Expected Output:**
- All 3 nodes show green checkmarks
- Firestore node output contains document data
- No error messages

**Pass Criteria:**
- ✅ Execution status: Success (green)
- ✅ All nodes executed successfully
- ✅ Firestore data passed to "Respond to Webhook" node

---

#### Test 3.3: Multiple Concurrent Requests
**Goal:** Test n8n handles multiple webhooks simultaneously

**Steps:**
1. Send 5 webhook requests in quick succession:
   ```bash
   for i in {1..5}; do
     curl -X POST http://localhost:5678/webhook/test-firestore &
   done
   wait
   ```

**Expected Output:**
- All 5 requests return 200 OK
- n8n Executions tab shows 5 successful executions
- No timeout errors

**Pass Criteria:**
- ✅ 5/5 requests succeed
- ✅ Average response time <5 seconds
- ✅ No container crashes (`docker ps` still shows n8n)

---

### Test Suite 4: Auto-Start & Persistence (Level 3)

#### Test 4.1: Docker Compose Startup
**Goal:** Verify docker-compose starts n8n correctly

**Steps:**
1. Stop current container: `docker stop n8n && docker rm n8n`
2. Start with compose: `docker-compose up -d`
3. Wait 30 seconds
4. Check status: `docker ps`

**Expected Output:**
```
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
abc123def      n8nio/n8n:latest   Up 30 seconds  0.0.0.0:5678->5678/tcp   n8n
```

**Pass Criteria:**
- ✅ Container starts without errors
- ✅ n8n UI accessible at `http://localhost:5678`
- ✅ Test workflow still exists (saved to volume)

---

#### Test 4.2: PC Reboot Persistence
**Goal:** Confirm n8n auto-starts after reboot

**Steps:**
1. Ensure Docker Desktop is set to start on login (Settings → General)
2. Restart your PC
3. Wait 2 minutes after login
4. Check Docker Desktop is running
5. Verify: `docker ps | grep n8n`
6. Test webhook: `curl -X POST http://localhost:5678/webhook/test-firestore`

**Expected Output:**
- n8n container running after reboot
- Webhook responds successfully
- No manual intervention needed

**Pass Criteria:**
- ✅ Docker Desktop auto-starts
- ✅ n8n container auto-starts
- ✅ Workflows still active
- ✅ Credentials persisted

---

### Test Suite 5: Error Handling (Level 3)

#### Test 5.1: Invalid Webhook Path
**Goal:** Test how n8n handles wrong webhook URLs

**Steps:**
```bash
curl -X POST http://localhost:5678/webhook/nonexistent-path
```

**Expected Output:**
```json
{
  "code": 404,
  "message": "The requested webhook \"nonexistent-path\" is not registered."
}
```

**Pass Criteria:**
- ✅ Response status: 404
- ✅ Error message is clear
- ✅ n8n doesn't crash

---

#### Test 5.2: Firestore Permission Denied
**Goal:** Verify error handling when Firebase access fails

**Steps:**
1. In n8n workflow, temporarily change Firestore collection to one you don't have access to (e.g., `restricted_collection`)
2. Send webhook request
3. Check execution in n8n Executions tab

**Expected Output:**
- Execution shows as "Error" (red)
- Error message: "Permission denied" or similar
- Workflow doesn't hang (fails fast)

**Pass Criteria:**
- ✅ Error caught and logged
- ✅ Execution completes (not stuck)
- ✅ Clear error message for debugging

---

## 📊 Test Results Summary

Run all tests and record results here:

| Test Suite | Total Tests | Passed | Failed | Notes |
|------------|-------------|--------|--------|-------|
| 1. Docker Installation | 3 | __ | __ | |
| 2. n8n UI & Credentials | 2 | __ | __ | |
| 3. Workflow Execution | 3 | __ | __ | |
| 4. Auto-Start & Persistence | 2 | __ | __ | |
| 5. Error Handling | 2 | __ | __ | |
| **TOTAL** | **12** | **__** | **__** | |

**Pass Requirement:** 12/12 tests must pass (100% success rate)

---

## 🐛 Failed Test Debugging

If any test fails, follow this debugging process:

### 1. Check Docker Logs
```bash
docker logs n8n
```
Look for error messages, stack traces, or warnings.

### 2. Check n8n Execution Logs
- Go to n8n UI → "Executions" tab
- Click failed execution
- Review error details in each node

### 3. Verify Firestore Security Rules
- Go to Firebase Console → Firestore → Rules
- Ensure service account has read/write access

### 4. Test Connectivity
```bash
# Ping n8n container
docker exec n8n ping google.com

# Check n8n can reach Firebase
docker exec n8n curl -I https://firestore.googleapis.com
```

### 5. Re-run Single Test
Isolate the failing test and run it multiple times to check for flakiness.

---

## ✅ Test Completion Criteria

**Task testing is complete when:**
- [ ] All 12 tests pass (100% success rate)
- [ ] Test results documented in summary table
- [ ] Any failures investigated and resolved
- [ ] n8n proven to work after PC reboot
- [ ] Webhook response time consistently <5 seconds

**When all tests pass, update PROGRESS.md with:** ✅ Testing Complete

---

## 🔗 Related Documents

- [README.md](./README.md) - Task overview
- [PLANNING.md](./PLANNING.md) - Implementation phases
- [PROGRESS.md](./PROGRESS.md) - Track completion
- [NEXT-STEPS.md](./NEXT-STEPS.md) - Post-testing actions

---

**Last Updated:** January 7, 2026  
**Test Status:** ⬜ Not Started
