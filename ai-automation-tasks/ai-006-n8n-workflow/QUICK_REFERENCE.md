# AI-006 Phase-by-Phase Builder Quick Reference

## 🎯 Phase 1: Workflow Setup ✅ READY

**Time:** 15 min | **Difficulty:** Easy

### Your Checklist
```
☐ Create workflow "MASH Appointment Booking"
☐ Add Webhook node (POST /mash-appointments)
☐ Add Switch node (5 routing rules)
☐ Activate workflow (toggle top-right)
☐ SAVE (Ctrl+S)
```

### Next: Confirm Phase 1 Complete
Reply with: "Phase 1 done!" or describe where you are in the setup

---

## 🔍 Phase 2: find_sellers Action 🔄 NEXT

**Time:** 40 min | **Difficulty:** Medium | **Complexity:** 4 nodes

### Node Sequence
1. **Query Growers** (Firebase Firestore)
2. **Query Availability** (Firebase Firestore)
3. **Ollama AI Matching** (HTTP Request)
4. **Format Sellers Response** (Code/Function)

### Quick Config Reference
```
Growers Query:
- Collection: growers
- Filter: role == SELLER
- Return: businessName, specialty, location, rating, capacity

Availability Query:
- Collection: availability_slots
- Filter 1: is_available == true
- Filter 2: available_date >= {{$json.preferredDate}}
- Order: available_date ASC
- Limit: 100

Ollama HTTP:
- URL: http://host.docker.internal:11434/api/generate
- Model: llama3.2:latest
- Prompt: [see WORKFLOW_BUILD_GUIDE.md]

Format Code:
- Merge grower data + availability + AI recommendations
- Return top 3 sellers with 3 slots each
```

### Test After Phase 2
```powershell
# Copy this into PowerShell and run:
$body = @{
    action = "find_sellers"
    productType = "Oyster Mushroom"
    quantity = 10
    buyerLocation = "Manila"
    preferredDate = "2026-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```

**Expected:** 3 sellers with available slots

---

## 📅 Phase 3: get_availability Action 🔜 AFTER PHASE 2

**Time:** 20 min | **Difficulty:** Easy | **Nodes:** 2

Quick nodes:
1. Firebase Query (seller_uid filter)
2. Code Function (group by date)

---

## ✅ Phase 4: set_appointment Action 🔜 AFTER PHASE 3

**Time:** 50 min | **Difficulty:** Hard | **Nodes:** 7

Complex nodes:
1. Check Slot (Firebase query)
2. Verify Available (IF condition)
3. Create Appointment (Firebase write)
4. Update Slot (Firebase update)
5. Email Buyer (Gmail)
6. Email Seller (Gmail)
7. Format Response (Code)

---

## ❌ Phase 5: cancel_appointment Action 🔜 AFTER PHASE 4

**Time:** 30 min | **Difficulty:** Medium | **Nodes:** 6

Simpler version of Phase 4:
1. Get Appointment (Firebase query)
2. Verify Authorization (IF)
3. Update Appointment (Firebase)
4. Free Slot (Firebase)
5. Send Emails (Gmail × 2)
6. Format Response (Code)

---

## 📋 Phase 6: get_appointments Action 🔜 AFTER PHASE 5

**Time:** 15 min | **Difficulty:** Easy | **Nodes:** 2

Simple nodes:
1. Firebase Query (buyer_uid filter)
2. Code Function (format response)

---

## 🛡️ Phase 7: Error Handling 🔜 AFTER PHASE 6

**Time:** 20 min | **Difficulty:** Medium | **Nodes:** 2

Final touches:
1. Error Trigger
2. Error Handler (Code function)

---

## 🧪 Phase 8: Testing & Docs 🔜 AFTER PHASE 7

**Time:** 30 min | **Difficulty:** Easy

Final steps:
1. Run all test cases in TESTING.md
2. Document results
3. Export workflow as JSON
4. Commit to GitHub

---

## ⚡ Quick Commands

### Start n8n (if not running)
```powershell
cd ai-automation-tasks/ai-002-n8n-setup
docker-compose up -d
```

### Check n8n is running
```powershell
Invoke-RestMethod -Uri "http://localhost:5678/api/health"
# Should return 200 OK
```

### Check Ollama is running
```powershell
Invoke-RestMethod -Uri "http://localhost:11434/api/tags"
# Should list available models (llama3.2:latest)
```

### Export workflow (after Phase 8)
```
n8n UI → Menu (3 dots) → Download
Save as: mash-appointment-workflow.json
Commit to: ai-automation-tasks/ai-006-n8n-workflow/
```

---

## 📊 Progress Tracking

Fill this in as you complete phases:

```
Phase 1: ☐ 0% | Phase 2: ☐ 0% | Phase 3: ☐ 0%
Phase 4: ☐ 0% | Phase 5: ☐ 0% | Phase 6: ☐ 0%
Phase 7: ☐ 0% | Phase 8: ☐ 0%

Total: ☐ 0% Complete
```

---

## 🆘 Need Help?

1. Check WORKFLOW_BUILD_GUIDE.md for detailed node configs
2. Check TESTING.md for expected responses
3. Run test commands to verify progress
4. Check n8n Executions tab for error details
5. Check Firebase Console for data writes

---

## Next Action

**→ Tell me when Phase 1 is complete, and I'll guide you through Phase 2 step-by-step with live testing!**
