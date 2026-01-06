# AI-002: n8n Setup - Implementation Plan

> **Task:** n8n Self-Hosted Setup  
> **Story Points:** 8  
> **Estimated Time:** 4-6 hours

---

## 🎯 Planning Philosophy

This document breaks down the task into **manageable phases** to ensure:
1. **Incremental progress** - Complete one phase at a time
2. **Easy testing** - Verify each phase works before moving on
3. **Clear documentation** - Track what was done and why
4. **Rollback safety** - Can undo if something breaks

**After completing each phase, update PROGRESS.md with checkmark ✅**

---

## 📋 Phase Breakdown

### Phase 1: Docker Desktop Installation & Verification (45 mins)
**Goal:** Get Docker running on your PC

#### Tasks:
- [ ] Download Docker Desktop for your OS
- [ ] Install Docker Desktop (accept all defaults)
- [ ] Restart PC if installer prompts
- [ ] Open Docker Desktop app
- [ ] Verify installation: `docker --version`
- [ ] Test Docker works: `docker run hello-world`

#### Expected Output:
```bash
$ docker --version
Docker version 24.0.7, build afdd53b

$ docker run hello-world
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

#### Verification:
- Docker Desktop icon visible in system tray
- Can run `docker ps` without errors
- `hello-world` container ran successfully

#### Blockers/Issues:
- **Virtualization not enabled?** → Enable in BIOS (Intel VT-x / AMD-V)
- **WSL2 error (Windows)?** → Install/update WSL2
- **Permission denied?** → Run terminal as Administrator

---

### Phase 2: Pull & Run n8n Container (30 mins)
**Goal:** Get n8n running in Docker

#### Tasks:
- [ ] Pull n8n image: `docker pull n8nio/n8n`
- [ ] Create persistent volume directory: `mkdir ~/.n8n`
- [ ] Run n8n container with correct flags:
  ```bash
  docker run -d \
    --name n8n \
    -p 5678:5678 \
    -v ~/.n8n:/home/node/.n8n \
    --restart unless-stopped \
    n8nio/n8n
  ```
- [ ] Check container is running: `docker ps`
- [ ] View logs: `docker logs n8n` (should show "Editor is now accessible via: http://localhost:5678/")

#### Expected Output:
```bash
$ docker ps
CONTAINER ID   IMAGE        STATUS         PORTS                    NAMES
abc123def456   n8nio/n8n    Up 30 seconds  0.0.0.0:5678->5678/tcp   n8n
```

#### Verification:
- Container status: "Up X seconds"
- Port 5678 is mapped
- No error messages in `docker logs n8n`

#### Blockers/Issues:
- **Port 5678 in use?** → Change port: `-p 5679:5678`
- **Container exits immediately?** → Check logs: `docker logs n8n`
- **Volume mount errors?** → Use absolute path: `-v C:/Users/YourName/.n8n:/home/node/.n8n`

---

### Phase 3: n8n UI Setup & Admin Account (15 mins)
**Goal:** Access n8n web interface and create admin account

#### Tasks:
- [ ] Open browser to `http://localhost:5678`
- [ ] Should see n8n setup page
- [ ] Create admin account:
  - Email: your-email@example.com
  - Password: (generate strong password - 16+ chars)
- [ ] Save credentials in password manager (Bitwarden, 1Password, etc.)
- [ ] Log in successfully
- [ ] See n8n dashboard with "Create Workflow" button

#### Expected Output:
- n8n login page loads without errors
- After login, see empty workflow canvas
- Top bar shows "Workflows", "Credentials", "Executions"

#### Verification:
- Can navigate between tabs (Workflows, Credentials, etc.)
- No console errors in browser DevTools (F12)
- Profile settings show your admin email

#### Blockers/Issues:
- **Page won't load?** → Check Docker container is running: `docker ps`
- **"Cannot connect to server"?** → Wait 30 seconds for n8n to fully start
- **Setup page keeps redirecting?** → Clear browser cache/cookies

---

### Phase 4: Firebase Admin SDK Configuration (20 mins)
**Goal:** Connect n8n to your Firebase project

#### Tasks:
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Select MASH project
- [ ] Navigate: Project Settings → Service Accounts
- [ ] Click "Generate new private key"
- [ ] Save JSON file (e.g., `firebase-admin-key.json`)
- [ ] In n8n UI:
  - [ ] Click "Credentials" tab
  - [ ] Click "+ New Credential"
  - [ ] Search "Google" → Select "Service Account"
  - [ ] Name: `Firebase Admin SDK`
  - [ ] Open JSON file in text editor
  - [ ] Copy ENTIRE JSON content
  - [ ] Paste into n8n credential form
  - [ ] Click "Create"

#### Expected Output:
- Credential saved with green checkmark
- Shows in credentials list as "Firebase Admin SDK"

#### Verification:
- Credential appears in list without errors
- Can edit credential to view masked JSON (should be there)

#### Blockers/Issues:
- **"Invalid JSON"?** → Make sure you copied the ENTIRE file (starts with `{`, ends with `}`)
- **"Permission denied"?** → Ensure service account has "Firebase Admin" role
- **Can't find service accounts?** → Must be owner/editor of Firebase project

---

### Phase 5: Create Test Workflow (45 mins)
**Goal:** Build a simple workflow to test Firebase connection

#### Tasks:
- [ ] In n8n, click "New Workflow"
- [ ] Name: `Test Firebase Connection`
- [ ] Add **Webhook** node:
  - [ ] HTTP Method: POST
  - [ ] Path: `test-firestore`
  - [ ] Response Mode: "Wait for response"
  - [ ] Copy webhook URL (should be `http://localhost:5678/webhook/test-firestore`)
- [ ] Add **Firestore** node:
  - [ ] Click "+ Add node" → Search "Firestore"
  - [ ] Connect to Webhook node (drag arrow)
  - [ ] Credential: Select "Firebase Admin SDK"
  - [ ] Operation: "Get Document"
  - [ ] Collection: `users` (or any collection with data)
  - [ ] Document ID: (enter an existing document ID)
- [ ] Add **Respond to Webhook** node:
  - [ ] Search "Respond to Webhook"
  - [ ] Connect to Firestore node
  - [ ] Response Body: `{{ $json }}`
  - [ ] Status Code: 200
- [ ] Click "Save" (top-right)
- [ ] Toggle "Active" switch (workflow must be ON)

#### Expected Output:
Workflow should look like this:
```
[Webhook] → [Firestore: Get Document] → [Respond to Webhook]
```

#### Verification:
- All three nodes connected with arrows
- No red error indicators on nodes
- Workflow shows "ACTIVE" badge

#### Blockers/Issues:
- **"Missing parameter"?** → Check all required fields are filled
- **"Credential not found"?** → Reselect Firebase credential
- **Can't activate workflow?** → Save first, then activate

---

### Phase 6: Test Webhook Execution (15 mins)
**Goal:** Verify the workflow actually works

#### Tasks:
- [ ] Open terminal/PowerShell
- [ ] Send POST request to webhook:
  ```bash
  # Windows PowerShell
  Invoke-WebRequest -Uri "http://localhost:5678/webhook/test-firestore" -Method POST
  
  # Mac/Linux
  curl -X POST http://localhost:5678/webhook/test-firestore
  ```
- [ ] Check response (should show Firestore document data)
- [ ] In n8n UI, go to "Executions" tab
- [ ] Should see successful execution (green checkmark)
- [ ] Click execution to view data flow between nodes

#### Expected Output:
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    ...
  }
}
```

#### Verification:
- Response status: 200 OK
- Response body contains Firestore data
- Execution shows in n8n Executions tab (green)
- All three nodes show green checkmarks

#### Blockers/Issues:
- **"Webhook not found"?** → Ensure workflow is ACTIVE
- **"Permission denied"?** → Check Firestore security rules
- **Empty response?** → Verify document ID exists in Firestore
- **Timeout?** → Check Firebase service account credential is correct

---

### Phase 7: Docker Compose Setup for Auto-Start (30 mins)
**Goal:** Ensure n8n starts automatically when PC boots

#### Tasks:
- [ ] Stop current n8n container:
  ```bash
  docker stop n8n
  docker rm n8n
  ```
- [ ] Create `docker-compose.yml` in project root:
  ```yaml
  version: '3.8'
  
  services:
    n8n:
      image: n8nio/n8n:latest
      container_name: n8n
      restart: unless-stopped
      ports:
        - "5678:5678"
      environment:
        - N8N_BASIC_AUTH_ACTIVE=false
        - WEBHOOK_URL=http://localhost:5678/
      volumes:
        - ~/.n8n:/home/node/.n8n
  ```
- [ ] Start with docker-compose:
  ```bash
  docker-compose up -d
  ```
- [ ] Verify container is running: `docker ps`
- [ ] Test workflow still works (send webhook request again)
- [ ] Enable Docker auto-start:
  - [ ] Windows/Mac: Docker Desktop → Settings → General → "Start Docker Desktop when you log in" ✅
  - [ ] Linux: `sudo systemctl enable docker`

#### Expected Output:
```bash
$ docker-compose up -d
Creating network "mash_default" with the default driver
Creating n8n ... done

$ docker ps
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
abc123def456   n8nio/n8n:latest   Up 5 seconds   0.0.0.0:5678->5678/tcp   n8n
```

#### Verification:
- n8n accessible at `http://localhost:5678`
- Test workflow still works
- After PC reboot, n8n container auto-starts (test this!)

#### Blockers/Issues:
- **"docker-compose not found"?** → It's included in Docker Desktop (no separate install needed)
- **Port conflict?** → Change port in docker-compose.yml: `"5679:5678"`
- **Volume not mounting?** → Use absolute path: `$HOME/.n8n:/home/node/.n8n`

---

### Phase 8: Documentation & Cleanup (20 mins)
**Goal:** Document setup and verify everything

#### Tasks:
- [ ] Update PROGRESS.md:
  - [ ] Mark all phases as complete ✅
  - [ ] Note any deviations from plan
  - [ ] Document actual time spent
- [ ] Create `.env.local` entry (if needed):
  ```env
  N8N_WEBHOOK_URL=http://localhost:5678/webhook
  ```
- [ ] Add to `.gitignore`:
  ```
  # n8n
  docker-compose.yml
  firebase-admin-key.json
  ~/.n8n/
  ```
- [ ] Take screenshots:
  - [ ] n8n dashboard
  - [ ] Test workflow diagram
  - [ ] Successful execution in Executions tab
- [ ] Run final verification checklist (see README.md)
- [ ] Document webhook URL for future tasks

#### Expected Output:
- All phases marked complete in PROGRESS.md
- Screenshots saved in `ai-002-n8n-setup/screenshots/`
- Webhook URL documented

#### Verification:
- Can access n8n after PC reboot (auto-start works)
- Test workflow runs without errors
- All sensitive files added to .gitignore

---

## 🎯 Phase Completion Criteria

**Each phase is complete when:**
- ✅ All tasks in phase are checked off
- ✅ Verification steps pass
- ✅ No blockers remain unresolved
- ✅ PROGRESS.md updated with phase completion

**Task is 100% complete when:**
- ✅ All 8 phases complete
- ✅ Acceptance criteria met (see README.md)
- ✅ Test workflow working perfectly
- ✅ n8n auto-starts on PC boot
- ✅ Documentation finalized
- ✅ Ready to move to AI-003

---

## 📊 Time Tracking

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| 1. Docker Installation | 45 min | ___ min | |
| 2. n8n Container | 30 min | ___ min | |
| 3. UI Setup | 15 min | ___ min | |
| 4. Firebase Config | 20 min | ___ min | |
| 5. Test Workflow | 45 min | ___ min | |
| 6. Webhook Test | 15 min | ___ min | |
| 7. Docker Compose | 30 min | ___ min | |
| 8. Documentation | 20 min | ___ min | |
| **Total** | **4-6 hours** | **___ hours** | |

---

## 🚨 Critical Notes

1. **Do NOT skip Phase 4** - Firebase credentials are essential for all future workflows
2. **Test after each phase** - Don't move forward if a phase fails
3. **Save webhook URL** - You'll need it for AI-003 and beyond
4. **Auto-start is crucial** - Your PC must run n8n 24/7 for webhooks to work
5. **Keep docker-compose.yml** - This is how n8n stays running after reboots

---

**Last Updated:** January 7, 2026  
**Planning Status:** ✅ Complete
