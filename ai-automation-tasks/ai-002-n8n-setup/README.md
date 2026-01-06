# AI-002: n8n Self-Hosted Setup

> **Phase:** 1 - Foundation  
> **Priority:** Critical  
> **Story Points:** 8  
> **Estimated Time:** 4-6 hours  
> **Dependencies:** Docker Desktop

---

## 📋 Task Overview

Install and configure **n8n workflow automation** on your local PC using Docker. This will be the central hub for all AI workflows, connecting Ollama, Firestore, and Next.js.

### What is n8n?
n8n is a **FREE, open-source workflow automation tool** (think Zapier but self-hosted). It lets you:
- Create visual workflows with drag-and-drop nodes
- Connect different services (Firebase, Ollama, Gmail, etc.)
- Run automation without writing code
- Host everything locally (NO cloud costs!)

---

## 🎯 Acceptance Criteria

- [ ] Docker Desktop running on PC
- [ ] n8n accessible at `http://localhost:5678`
- [ ] Firebase Admin SDK configured in n8n credentials
- [ ] Test workflow successfully reads/writes to Firestore
- [ ] n8n set to auto-start on PC boot (Docker compose)
- [ ] Webhook URL documented: `http://localhost:5678/webhook/<workflow-name>`

---

## 🔗 Dependencies

### Before You Start:
1. **Docker Desktop installed**
   - Windows: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - Mac: Download DMG installer
   - Linux: `curl -fsSL https://get.docker.com | sh`

2. **Firebase Project Ready**
   - Go to Firebase Console
   - Have project ID handy
   - Service account JSON key ready (we'll download this)

3. **Port 5678 Available**
   - Check if anything is running on port 5678:
     ```bash
     # Windows
     netstat -ano | findstr :5678
     
     # Mac/Linux
     lsof -i :5678
     ```

---

## 📝 Implementation Steps

### Step 1: Install Docker Desktop (15 mins)
1. Download Docker Desktop for your OS
2. Run installer (accept defaults)
3. Restart computer if prompted
4. Verify installation:
   ```bash
   docker --version
   # Should show: Docker version 24.x.x
   ```

### Step 2: Run n8n Container (10 mins)
```bash
# Pull n8n image
docker pull n8nio/n8n

# Run n8n with persistent storage
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --restart unless-stopped \
  n8nio/n8n
```

**Windows PowerShell:**
```powershell
docker run -d `
  --name n8n `
  -p 5678:5678 `
  -v $HOME/.n8n:/home/node/.n8n `
  --restart unless-stopped `
  n8nio/n8n
```

### Step 3: Access n8n UI (5 mins)
1. Open browser: `http://localhost:5678`
2. Create admin account:
   - Email: your-email@example.com
   - Password: (strong password - save in password manager)
3. You should see n8n dashboard!

### Step 4: Configure Firebase Credentials (20 mins)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your MASH project
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate new private key"**
5. Save the downloaded JSON file (e.g., `firebase-admin-key.json`)
6. In n8n:
   - Click **"Credentials"** (top-right)
   - Click **"+ New Credential"**
   - Search for **"Google"** > Select **"Service Account"**
   - Name: `Firebase Admin SDK`
   - Open your `firebase-admin-key.json` in text editor
   - Copy ENTIRE content and paste into n8n credential
   - Click **"Create"**

### Step 5: Create Test Workflow (30 mins)
1. In n8n, click **"New Workflow"**
2. Name it: `Test Firebase Connection`
3. Add nodes:
   
   **Node 1: Webhook Trigger**
   - Search "Webhook" in node panel
   - Drag to canvas
   - HTTP Method: `POST`
   - Path: `test-firestore`
   - Response Mode: `Wait for response`
   - Copy webhook URL (e.g., `http://localhost:5678/webhook/test-firestore`)

   **Node 2: Firestore Read**
   - Search "Firestore"
   - Drag next to Webhook
   - Connect Webhook → Firestore
   - Credential: Select `Firebase Admin SDK`
   - Operation: `Get Document`
   - Collection: `users` (or any existing collection)
   - Document ID: (any existing document ID)

   **Node 3: Respond to Webhook**
   - Search "Respond to Webhook"
   - Drag next to Firestore
   - Connect Firestore → Respond
   - Response Body: `{{ $json }}`
   - Status Code: `200`

4. Click **"Save"** (top-right)
5. Click **"Activate"** toggle (workflow must be active!)

### Step 6: Test Webhook (10 mins)
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:5678/webhook/test-firestore" -Method POST

# Mac/Linux
curl -X POST http://localhost:5678/webhook/test-firestore
```

**Expected Response:**
```json
{
  "success": true,
  "data": { /* Firestore document data */ }
}
```

If you see this, **n8n is working!** 🎉

### Step 7: Set Auto-Start with Docker Compose (20 mins)
1. Create file: `docker-compose.yml` in your project root:
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
         - N8N_BASIC_AUTH_ACTIVE=true
         - N8N_BASIC_AUTH_USER=admin
         - N8N_BASIC_AUTH_PASSWORD=your-secure-password
         - WEBHOOK_URL=http://localhost:5678/
       volumes:
         - ~/.n8n:/home/node/.n8n
   ```

2. Stop current container:
   ```bash
   docker stop n8n
   docker rm n8n
   ```

3. Start with docker-compose:
   ```bash
   docker-compose up -d
   ```

4. Verify it's running:
   ```bash
   docker ps
   # Should show n8n container
   ```

5. **Set Docker to start on boot:**
   - Windows: Docker Desktop → Settings → General → "Start Docker Desktop when you log in" ✅
   - Mac: Same as Windows
   - Linux: `sudo systemctl enable docker`

---

## ✅ Verification Checklist

Run through this checklist to confirm everything works:

- [ ] Docker Desktop shows n8n container running
- [ ] Can access `http://localhost:5678` in browser
- [ ] Firebase credentials saved in n8n
- [ ] Test workflow returns Firestore data
- [ ] Webhook responds within 2 seconds
- [ ] n8n auto-starts after PC reboot (test this!)
- [ ] No error logs in Docker: `docker logs n8n`

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution:**
- Make sure Docker Desktop is running (system tray icon)
- Restart Docker Desktop
- Check Docker settings → Resources → ensure it's not paused

### Issue: "Port 5678 already in use"
**Solution:**
```bash
# Find process using port 5678
netstat -ano | findstr :5678
# Kill the process or change n8n port:
docker run -p 5679:5678 ... # Use port 5679 instead
```

### Issue: "Firestore permission denied"
**Solution:**
- Verify Firebase service account JSON is correct
- Check Firestore security rules allow reads
- Ensure service account has "Firebase Admin" role

### Issue: "n8n not starting after reboot"
**Solution:**
- Check Docker is set to auto-start
- Verify `restart: unless-stopped` in docker-compose.yml
- Manually start: `docker-compose up -d`

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io)
- [Docker Documentation](https://docs.docker.com)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [n8n Community Forum](https://community.n8n.io)

---

## 🎯 What's Next?

Once n8n is fully operational:
1. Mark this task as complete in PROGRESS.md
2. Read NEXT-STEPS.md for guidance
3. Move to **AI-003: Ollama + Llama 3.2 Installation**

**Estimated Setup Time:** 4-6 hours (first time), 2 hours (if experienced with Docker)

---

**Last Updated:** January 7, 2026  
**Status:** 🔴 Not Started
