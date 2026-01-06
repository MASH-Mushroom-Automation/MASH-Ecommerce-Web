# 🤖 AI Automation Tasks Management

> **Epic:** AI-001 - Free Self-Hosted AI Buyer-to-Seller Appointment System  
> **Timeline:** January 2026 - March 2026 (12 weeks)  
> **Total Story Points:** 240  
> **Cost:** $0.00/month (100% FREE self-hosted)

---

## 📋 Task Overview

This folder contains **21 AI automation tasks** organized into **7 phases** for building a complete self-hosted AI system that connects buyers to sellers through intelligent appointment scheduling.

### Technology Stack
- **n8n** - Workflow automation (self-hosted)
- **Ollama** (Llama 3.2 3B) - FREE local AI
- **ChromaDB** - Vector database
- **Firebase Firestore** - Real-time database
- **Sanity CMS** - Content management
- **Next.js 15** - Frontend framework

---

## 🗂️ Folder Structure

```
ai-automation-tasks/
├── README.md                    ← You are here
├── MASTER-PLAN.md               ← Complete epic overview (to be created)
├── PROGRESS-TRACKER.md          ← Track all 21 tasks (to be created)
├── PR-TEMPLATE.md               ← Pull request template (to be created)
├── ai-001-epic/                 ← Epic documentation ✅
├── ai-002-n8n-setup/            ← Phase 1: Foundation ✅
├── ai-003-ollama-setup/
├── ai-004-appointment-widget/
├── ...                          ← 17 more task folders
└── ai-021-cart-recovery/
```

### Each Task Folder Contains:
```
ai-###-task-name/
├── README.md          ← Task description, dependencies, acceptance criteria
├── PLANNING.md        ← Phase breakdown with actionable steps
├── PROGRESS.md        ← Track implementation progress
├── TESTING.md         ← Test cases and validation
├── NEXT-STEPS.md      ← Guide to the next task
└── PR-GUIDE.md        ← Pull request checklist and guide
```

---

## 🎯 Quick Start

### 1. Navigate to Your Current Task
```bash
cd ai-automation-tasks/ai-002-n8n-setup/
```

### 2. Read Task Documentation
```bash
# Open README.md to understand the task
# Read PLANNING.md for phase breakdown
# Track progress in PROGRESS.md
```

### 3. Follow the Workflow
1. **Plan First** - Review PLANNING.md phases
2. **Implement** - Follow step-by-step guide
3. **Document Progress** - Update PROGRESS.md after each phase
4. **Test** - Run all tests in TESTING.md
5. **Next Steps** - Read NEXT-STEPS.md for dependencies
6. **Create PR** - Use PR-GUIDE.md for pull request

### 4. Submit Pull Request
```bash
git checkout -b feature/ai-002-n8n-setup
git add .
git commit -m "feat(ai-002): Complete n8n self-hosted setup"
git push origin feature/ai-002-n8n-setup
# Create PR using PR-GUIDE.md template
```

---

## 📊 Task Phases & Timeline

### Phase 1: Foundation (Weeks 1-2) - 26 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-002 | n8n Self-Hosted Setup | 🟢 Complete | 8 |
| AI-003 | Ollama + Llama 3.2 Installation | 🔴 Not Started | 10 |
| AI-004 | Seller Appointment Widget UI | 🔴 Not Started | 8 |

### Phase 2: Seller Matching & Booking (Weeks 3-4) - 47 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-005 | Appointment Webhook API | 🔴 Not Started | 8 |
| AI-006 | Firestore Appointment Schema | 🔴 Not Started | 6 |
| AI-007 | Product Recommendation Engine | 🔴 Not Started | 12 |
| AI-008 | Chatbot Product Card UI | 🔴 Not Started | 8 |
| AI-009 | n8n Appointment Booking Workflow | 🔴 Not Started | 13 |

### Phase 3: Availability & Notifications (Weeks 5-6) - 16 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-010 | Seller Availability Management UI | 🔴 Not Started | 10 |
| AI-011 | Appointment Confirmation Emails | 🔴 Not Started | 6 |

### Phase 4: Chatbot Interface (Weeks 7-8) - 20 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-012 | FAQ Knowledge Base Setup | 🔴 Not Started | 8 |
| AI-013 | Chatbot Main UI Widget | 🔴 Not Started | 12 |

### Phase 5: Analytics & Optimization (Weeks 9-10) - 18 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-014 | Conversation Analytics Dashboard | 🔴 Not Started | 10 |
| AI-015 | ChromaDB Seller Profile Vectors | 🔴 Not Started | 8 |

### Phase 6: Advanced Automation (Week 11) - 21 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-016 | Automated Follow-up System | 🔴 Not Started | 7 |
| AI-017 | Appointment Rescheduling | 🔴 Not Started | 6 |
| AI-018 | Seller Performance Insights | 🔴 Not Started | 8 |

### Phase 7: Polish & Enhancements (Week 12) - 28 Story Points
| Task | Name | Status | Points |
|------|------|--------|--------|
| AI-019 | Multi-Language Support (Filipino) | 🔴 Not Started | 10 |
| AI-020 | Voice Input (Optional - Piper TTS) | 🔴 Not Started | 12 |
| AI-021 | Cart Abandonment Recovery | 🔴 Not Started | 6 |

---

## 🔗 Task Dependencies

**Critical Path:**
```
AI-002 (n8n) → AI-003 (Ollama) → AI-006 (Firestore) → AI-009 (Workflow) → AI-013 (Chatbot)
```

**Dependency Graph:**
```
AI-002 (n8n Setup)
  ├── AI-005 (Webhook API)
  ├── AI-009 (Booking Workflow)
  ├── AI-011 (Emails)
  └── AI-016 (Follow-ups)

AI-003 (Ollama)
  ├── AI-007 (Product Recommendations)
  ├── AI-012 (FAQ System)
  └── AI-015 (Seller Vectors)

AI-006 (Firestore Schema)
  ├── AI-009 (Booking Workflow)
  ├── AI-010 (Availability UI)
  └── AI-014 (Analytics)

AI-007 (Product Recommendations)
  └── AI-008 (Product Card UI)
  └── AI-013 (Chatbot UI)

AI-012 (FAQ System)
  └── AI-013 (Chatbot UI)

AI-013 (Chatbot UI)
  └── AI-014 (Analytics)
```

---

## ✅ Progress Tracking

### Completion Status
- **Not Started:** 🔴 20/21 tasks
- **In Progress:** 🟡 0/21 tasks
- **Completed:** 🟢 1/21 tasks (AI-002)

### Overall Progress: 5% (8/176 story points)

**Last Updated:** January 7, 2026

---

## 📝 Documentation Standards

### When Working on a Task:

1. **PLANNING.md** - Break down into phases BEFORE coding
   - Minimum 3-5 phases per task
   - Each phase = 1-3 hours of work
   - Document all files to create/modify

2. **PROGRESS.md** - Update after EACH phase
   - Mark phase as complete ✅
   - Note any blockers or changes
   - Track time spent

3. **TESTING.md** - Write tests BEFORE implementing
   - Unit tests for utilities
   - Integration tests for APIs
   - E2E tests for UI flows

4. **NEXT-STEPS.md** - Updated when task is 100% complete
   - Link to next dependent task
   - Prerequisites for next task
   - Unblocking notes

5. **PR-GUIDE.md** - Use template when ALL phases are done
   - Screenshots/videos required
   - Test results required
   - Reviewer checklist

---

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed
- Node.js 20+ (for Next.js)
- Firebase project configured
- Sanity CMS operational
- 8GB+ RAM PC

### Start with Phase 1
```bash
cd ai-002-n8n-setup
cat README.md
cat PLANNING.md
```

### Follow the Workflow
1. Read task README
2. Review planning phases
3. Implement phase by phase
4. Update progress after each phase
5. Run tests
6. Read next steps
7. Create pull request

---

## 🎯 Success Metrics

### Epic-Level Goals:
- [ ] 100% FREE monthly cost ($0 for AI processing)
- [ ] Ollama running smoothly on 8GB RAM PC
- [ ] n8n self-hosted with <2 second response times
- [ ] 90% appointment booking success rate
- [ ] 70% buyer-seller meeting completion rate
- [ ] Zero double-bookings (Firestore calendar sync)

### Per-Task Goals:
- ✅ All acceptance criteria met
- ✅ Test coverage >80%
- ✅ Documentation complete
- ✅ PR approved and merged
- ✅ Next task unblocked

---

## 🆘 Need Help?

### Common Issues:
- **Ollama slow?** → Check RAM usage, close other apps
- **n8n webhook not responding?** → Check Docker Desktop is running
- **Firestore permission denied?** → Verify security rules
- **Sanity data not loading?** → Check API tokens

### Resources:
- n8n Docs: https://docs.n8n.io
- Ollama Docs: https://ollama.com/docs
- ChromaDB Docs: https://docs.trychroma.com
- Firebase Docs: https://firebase.google.com/docs

### Get Support:
- Check task's PLANNING.md for detailed steps
- Review .github/copilot-instructions.md for codebase patterns
- Ask in team chat/Discord
- Create GitHub Discussion for blocking issues

---

## 📄 License

This AI automation system is part of the MASH E-Commerce project.  
All code and documentation follow the project's MIT License.

---

**Next Step:** Open `ai-002-n8n-setup/README.md` to start Phase 1! 🚀
