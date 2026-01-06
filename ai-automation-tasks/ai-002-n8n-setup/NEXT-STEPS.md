# AI-002: n8n Setup - Next Steps Guide

> **Current Task:** AI-002 (Complete) → **Next Task:** AI-003  
> **Status:** Ready to proceed once this task is complete

---

## ✅ Before Moving to Next Task

**Ensure all of these are complete:**
- [ ] All 8 phases in PLANNING.md are done ✅
- [ ] All 12 tests in TESTING.md pass ✅
- [ ] PROGRESS.md shows 🟢 Complete status
- [ ] n8n auto-starts after PC reboot (verified)
- [ ] Webhook URL documented and working
- [ ] Pull request created and merged (see PR-GUIDE.md)

**If ANY of the above are incomplete, DO NOT proceed to AI-003.**

---

## 🎯 What You've Accomplished

Congratulations! You've successfully:
- ✅ Installed Docker Desktop on your PC
- ✅ Set up n8n (FREE workflow automation) running 24/7
- ✅ Connected n8n to Firebase with Admin SDK
- ✅ Created your first working workflow
- ✅ Tested webhook automation end-to-end
- ✅ Configured auto-start for persistent operation

**You now have a powerful automation hub ready for AI workflows!**

---

## 📋 Important Information for Next Tasks

### Save These Details:
1. **n8n Webhook Base URL:**
   ```
   http://localhost:5678/webhook/
   ```
   *(You'll use this in AI-003, AI-005, AI-009, etc.)*

2. **n8n UI Access:**
   ```
   URL: http://localhost:5678
   Email: [your admin email]
   Password: [in password manager]
   ```

3. **Firebase Admin SDK Credential:**
   - Already saved in n8n Credentials tab
   - Named: "Firebase Admin SDK"
   - **DO NOT** delete this credential - all future workflows need it

4. **Docker Compose File:**
   - Location: `docker-compose.yml` (project root)
   - Keep this file - it ensures n8n stays running

---

## 🔗 Task Dependencies Unblocked

By completing AI-002, you've unblocked these tasks:

### ✅ Ready to Start:
- **AI-003: Ollama + Llama 3.2 Installation** (Next task - start immediately)
- **AI-005: Appointment Webhook API** (Can start in parallel with AI-003)

### 🔓 Dependencies Partially Met:
- **AI-009: n8n Appointment Booking Workflow** (Needs AI-002 + AI-003 + AI-006)
- **AI-011: Appointment Confirmation Emails** (Needs AI-002 + AI-009)
- **AI-016: Automated Follow-up System** (Needs AI-002 + AI-009)

---

## 🚀 Immediate Next Task: AI-003

### AI-003: Ollama + Llama 3.2 Installation
**Priority:** Critical  
**Story Points:** 10  
**Estimated Time:** 3-4 hours  
**Dependencies:** 8GB+ RAM, 10GB disk space

**What You'll Build:**
- Install Ollama (FREE local AI)
- Download Llama 3.2 3B model (~2GB)
- Test AI responses
- Connect Ollama to n8n (from AI-002)
- Create seller matching prompt

**Why It's Next:**
- Ollama is the AI "brain" for appointment system
- Works with n8n workflows you just set up
- Required for AI-007 (Product Recommendations) and AI-012 (FAQ System)

**How to Start:**
```bash
cd ../ai-003-ollama-setup
cat README.md
cat PLANNING.md
# Follow the phases step-by-step
```

---

## 📚 Resources to Review

Before starting AI-003, review these:

### 1. Ollama Documentation
- [Ollama Quick Start](https://ollama.com/docs)
- [Llama 3.2 Model Card](https://ollama.com/library/llama3.2)
- [API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)

### 2. n8n + Ollama Integration
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Calling Ollama from n8n](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.ollama/)

### 3. MASH Codebase Context
- Review `.github/copilot-instructions.md` - section on "Advanced Patterns"
- Check `src/lib/api-client.ts` - understand API structure
- Review `src/types/api.ts` - see appointment types

---

## ⚠️ Important Warnings

### DO NOT:
- ❌ Delete n8n container - it needs to run 24/7
- ❌ Change webhook URLs without updating workflows
- ❌ Remove Firebase Admin SDK credential
- ❌ Stop Docker Desktop during development
- ❌ Skip testing AI-003 with n8n integration

### DO:
- ✅ Keep n8n running at all times (it's your automation hub)
- ✅ Document all webhook URLs you create
- ✅ Test Ollama + n8n integration thoroughly in AI-003
- ✅ Update `.env.local` with any new environment variables
- ✅ Follow same planning/testing process for AI-003

---

## 🎓 Lessons for Future Tasks

Apply these learnings to AI-003 and beyond:

### What Worked Well:
1. **Phase-by-phase approach** - Breaking down into 8 phases made it manageable
2. **Testing after each phase** - Caught issues early
3. **Docker Compose** - Auto-start eliminated manual work

### Tips for AI-003:
1. **Install Ollama first, test later** - Don't try to integrate with n8n until Ollama works standalone
2. **Use small model (3B)** - Llama 3.2 3B runs on 8GB RAM; larger models need 16GB+
3. **Test prompts iteratively** - Start simple ("Hello, who are you?"), then add complexity
4. **Document API URLs** - You'll need `http://localhost:11434/api/generate` for n8n

---

## 📊 Epic Progress Update

### AI-001 Epic Status:
- **Phase 1 (Foundation):** 1/4 tasks complete (25%) ← AI-002 ✅
- **Overall Epic:** 1/34 tasks complete (3%)
- **Story Points:** 8/240 complete

### Next Milestones:
- **Week 1 Goal:** Complete AI-002 ✅ + AI-003 + AI-004
- **Week 2 Goal:** AI-005 + AI-006 (Firestore schema)
- **Week 3 Goal:** AI-009 (Core booking workflow)

---

## ✅ Final Checklist

Before closing this task:

- [ ] n8n running and auto-starting ✅
- [ ] Test workflow works perfectly ✅
- [ ] All documentation updated ✅
- [ ] Pull request created (see PR-GUIDE.md)
- [ ] Pull request approved and merged
- [ ] Task marked as 🟢 Complete in GitHub Project
- [ ] README.md in `ai-003-ollama-setup` folder reviewed
- [ ] Ready to start Phase 1 of AI-003

---

## 🎯 Success Definition

**AI-002 is truly complete when:**
1. You can reboot your PC and n8n auto-starts
2. You can send a webhook POST and get Firestore data back
3. You understand how to create workflows in n8n
4. You're confident to integrate Ollama with n8n (next task)

**If all 4 are true, you're ready for AI-003!** 🚀

---

## 🔗 Quick Links

- **Current Task:** [AI-002 README](./README.md)
- **Next Task:** [AI-003 README](../ai-003-ollama-setup/README.md)
- **Epic Overview:** [Master Plan](../MASTER-PLAN.md)
- **All Tasks:** [Progress Tracker](../PROGRESS-TRACKER.md)

---

**Last Updated:** January 7, 2026  
**Next Task Status:** 🔴 Ready to Start (blocked until AI-002 complete)

**Command to start next task:**
```bash
cd ../ai-003-ollama-setup && cat README.md
```
