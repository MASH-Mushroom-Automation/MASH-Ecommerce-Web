# AI-003: Ollama Setup - Next Steps Guide

> **Current Task:** AI-003 (Complete) → **Next Tasks:** AI-004, AI-006, AI-007  
> **Status:** Ready to proceed once this task is complete

---

## ✅ Before Moving to Next Task

**Ensure all of these are complete:**
- [ ] All 8 phases in PLANNING.md are done ✅
- [ ] All 13 tests in TESTING.md pass ✅
- [ ] PROGRESS.md shows 🟢 Complete status
- [ ] Ollama auto-starts after PC reboot (verified)
- [ ] n8n can call Ollama via `http://host.docker.internal:11434`
- [ ] Performance benchmarks documented (<5sec avg response)
- [ ] Prompts saved for reuse (seller matching, product intent)
- [ ] Pull request created and merged (see PR-GUIDE.md)

**If ANY of the above are incomplete, DO NOT proceed to next tasks.**

---

## 🎯 What You've Accomplished

Congratulations! You've successfully:
- ✅ Installed Ollama (FREE local AI platform)
- ✅ Downloaded Llama 3.2 3B model (2GB, optimized for 8GB RAM)
- ✅ Verified AI can perform seller matching and product intent extraction
- ✅ Integrated Ollama with n8n for workflow automation
- ✅ Configured auto-start for always-on AI availability
- ✅ Benchmarked performance on your hardware

**You now have a FREE, self-hosted AI engine ready for MASH automation!**

---

## 📋 Important Information for Next Tasks

### Save These Details:

**1. Ollama API Endpoint:**
```
http://localhost:11434/api/generate
```
*(Use `http://host.docker.internal:11434` from inside Docker containers like n8n)*

**2. Installed Model:**
```
llama3.2:3b (2.0 GB)
```

**3. Average Response Time:**
```
[Document your benchmark results here]
Simple queries: ____ seconds
Seller matching: ____ seconds
JSON responses: ____ seconds
```

**4. Successful Prompt Templates:**
Save in `prompts/` folder for reuse:
- `seller-matching-prompt.md`
- `product-intent-extraction.md`
- `faq-response-generation.md`

**5. n8n Integration Pattern:**
```javascript
// HTTP Request node configuration
{
  "method": "POST",
  "url": "http://host.docker.internal:11434/api/generate",
  "body": {
    "model": "llama3.2:3b",
    "prompt": "{{ $json.userQuery }}",
    "stream": false
  }
}
```

---

## 🚀 Immediate Next Tasks

### Critical Path (Required for appointments):
```
AI-003 (Ollama) ✅ COMPLETE
   ↓
AI-006 (Firestore Schema) ← START NEXT
   ↓
AI-009 (n8n Booking Workflow)
```

### Parallel Development (Can start simultaneously):
- **AI-004:** Appointment Widget UI (frontend)
- **AI-007:** Product Recommendation Engine (uses Ollama)
- **AI-012:** FAQ Knowledge Base (uses Ollama)

---

## 📋 Recommended Task Order

### Week 1 Priority:
1. **AI-006: Firestore Appointment Schema** (6 points)
   - Create database structure for appointments
   - Setup security rules
   - Seed test data
   - **Why next?** Required before AI-009 can work

2. **AI-004: Seller Appointment Widget UI** (10 points)
   - Frontend component buyers will see
   - Can develop UI while backend is being built
   - **Can work in parallel with AI-006**

### Week 2 Priority:
3. **AI-007: Product Recommendation Engine** (12 points)
   - Uses Ollama (already setup! ✅)
   - AI-powered product matching
   - Integrates with chatbot

4. **AI-009: n8n Appointment Booking Workflow** (15 points)
   - Depends on: AI-003 ✅, AI-006
   - Core booking automation

---

## 🎯 Task Dependencies Unblocked

By completing AI-003, you've unblocked:

✅ **AI-007: Product Recommendations**
- Needs: Ollama ✅
- Can start: Immediately
- Benefit: Product intent extraction works locally now

✅ **AI-012: FAQ Knowledge Base**
- Needs: Ollama ✅
- Can start: After AI-007
- Benefit: Free semantic search (no OpenAI costs)

✅ **AI-009: n8n Appointment Workflow**
- Needs: Ollama ✅ + n8n ✅ + AI-006
- Can start: After AI-006 complete
- Benefit: AI seller matching works end-to-end

✅ **AI-019: Multi-Language Support**
- Needs: Ollama ✅
- Can start: Later (optional feature)
- Benefit: Filipino language support

---

## 📚 Resources to Review

Before starting AI-006 or AI-007, review these:

1. **Firestore Documentation:**
   - [Structuring Data](https://firebase.google.com/docs/firestore/manage-data/structure-data)
   - [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

2. **Ollama Best Practices:**
   - [Prompt Engineering Tips](https://github.com/ollama/ollama/blob/main/docs/prompts.md)
   - [Model Library](https://ollama.com/library)

3. **MASH Project Files:**
   - `.github/FIRESTORE_SECURITY_RULES.md`
   - `.github/CART_AND_CHECKOUT_COMPLETE_PLAN.md` (Firestore patterns)

---

## ⚠️ Common Pitfalls to Avoid

### When Starting AI-006:
- ❌ Don't skip security rules (buyers shouldn't see all appointments)
- ❌ Don't forget indexes (queries will be slow)
- ✅ DO use timestamps for all date fields (easier sorting)
- ✅ DO structure appointment data for easy querying

### When Starting AI-007:
- ❌ Don't over-complicate prompts (Llama 3.2 works best with clear instructions)
- ❌ Don't forget to cache Sanity product data (reduce API calls)
- ✅ DO test with real product data from Sanity
- ✅ DO implement fallback if Ollama is slow/unavailable

### When Integrating with n8n:
- ❌ Don't forget `host.docker.internal` for Ollama URL (not `localhost`)
- ❌ Don't skip error handling in workflows
- ✅ DO set reasonable timeouts (30-60 seconds)
- ✅ DO log all AI responses for debugging

---

## 💡 Pro Tips from AI-003

Apply these learnings to future tasks:

1. **Test incrementally** - Don't wait until the end to test
2. **Document successful prompts** - Saves time debugging later
3. **Benchmark early** - Know your baseline performance
4. **Plan for failures** - What if Ollama is down? Have fallbacks
5. **Monitor resources** - AI tasks use RAM; plan accordingly

### Tips for AI-006:
- Use the same Firestore setup as existing collections (users, orders)
- Test security rules with Firebase Emulator first
- Create seed data script (don't manually add in console)

### Tips for AI-007:
- Start with simple product matching (just product type)
- Then add: quantity, price range, location
- Use Ollama's JSON mode for structured responses
- Cache frequent queries (avoid hitting Ollama repeatedly)

---

## 📈 Progress Tracking

### AI-001 Epic Progress (Phase 1):
- ✅ AI-002: n8n Setup (8 points) - COMPLETE
- ✅ AI-003: Ollama Setup (10 points) - COMPLETE
- ⬜ AI-004: Appointment Widget (10 points) - Next
- ⬜ AI-006: Firestore Schema (6 points) - Critical

**Phase 1 Progress:** 18/34 points (53%)

### Overall Epic Progress:
- **Completed:** 2/21 tasks (10%)
- **Story Points:** 18/240 (7.5%)
- **Estimated Time:** ~12 hours spent / ~120 hours total

---

## 🎯 Week 1 Goal

- **Target:** Complete AI-002 ✅ + AI-003 ✅ + AI-004 + AI-006
- **Story Points:** 34 (Foundation complete)
- **Benefit:** Booking widget visible on frontend + database ready

**Next Step:**
```bash
cd ../ai-006-firestore-schema
cat README.md
```

---

## 🚦 Green Light Status

You are **CLEAR TO PROCEED** to next tasks if:
- ✅ Ollama responds to `ollama list` (shows llama3.2:3b)
- ✅ API test works: `curl http://localhost:11434/api/generate ...`
- ✅ n8n workflow calls Ollama successfully
- ✅ All 13 tests in TESTING.md pass
- ✅ Auto-start verified (tested after reboot)

**Current Status:** [Update after completing all checks]
- 🔴 Not Ready (tests incomplete)
- 🟡 Almost Ready (minor issues)
- 🟢 READY TO PROCEED

---

## 📝 Handoff Notes

For developers picking up AI-004 or AI-006:

**What's Working:**
- Ollama installed and tested
- Llama 3.2 3B model available
- n8n integration proven
- Response time: ____ seconds avg

**Potential Issues:**
- [Document any quirks or performance issues]

**Recommended Approach:**
- Start with AI-006 (backend/database)
- Then AI-004 (frontend widget)
- Test integration early

**Contact:**
- Ollama setup by: [Your name]
- Questions: [Slack/Email]
