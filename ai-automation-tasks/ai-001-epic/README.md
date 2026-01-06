# AI-001: Free Self-Hosted AI Buyer-to-Seller Appointment System (EPIC)

> **Type:** Epic (Parent Task)  
> **Priority:** Critical  
> **Story Points:** 240 (sum of all sub-tasks)  
> **Timeline:** 12 weeks (January - March 2026)  
> **Cost:** $0.00/month (100% FREE self-hosted)

---

## 📋 Epic Overview

Build a complete **free self-hosted AI-powered appointment system** that connects buyers with sellers through intelligent matching and automated scheduling using:
- **n8n** (workflow automation)
- **Ollama + Llama 3.2 3B** (local AI)
- **ChromaDB** (vector database)
- **Firebase Firestore** (real-time database)

### Business Value
- **For Buyers:** Find the perfect seller in <3 clicks, book appointments instantly
- **For Sellers:** Auto-matched with qualified leads, manage availability easily
- **For Business:** 100% free (no monthly AI API costs), fully customizable

---

## 🎯 Epic Goals

### Primary Objectives:
1. **AI Seller Matching** - Match buyers to sellers based on:
   - Product preferences
   - Location proximity
   - Seller expertise/ratings
   - Real-time availability

2. **Automated Appointment Scheduling** - Zero-friction booking:
   - Smart availability checking (no double-bookings)
   - Conflict detection and resolution
   - Automated email/SMS confirmations
   - Rescheduling with minimal clicks

3. **Conversational Chatbot** - Natural language interface:
   - Answer product FAQs
   - Recommend products
   - Guide appointment booking
   - Multi-language support (English + Filipino)

4. **Admin Analytics** - System health monitoring:
   - Appointment conversion rates
   - AI matching accuracy
   - Seller performance metrics
   - Conversation analytics

---

## 🗂️ Task Breakdown (21 Tasks)

### Phase 1: Foundation (Weeks 1-2) - 26 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-002](../ai-002-n8n-setup/README.md) | n8n Self-Hosted Setup | 8 | 🔴 Not Started |
| [AI-003](../ai-003-ollama-setup/README.md) | Ollama + Llama 3.2 Installation | 10 | 🔴 Not Started |
| [AI-004](../ai-004-appointment-widget/README.md) | Seller Appointment Widget UI | 8 | 🔴 Not Started |

### Phase 2: Seller Matching & Booking (Weeks 3-4) - 47 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-005](../ai-005-webhook-api/README.md) | Appointment Webhook API | 8 | 🔴 Not Started |
| [AI-006](../ai-006-firestore-schema/README.md) | Firestore Appointment Schema | 6 | 🔴 Not Started |
| [AI-007](../ai-007-product-recommendations/README.md) | Product Recommendation Engine | 12 | 🔴 Not Started |
| [AI-008](../ai-008-product-card-ui/README.md) | Chatbot Product Card UI | 8 | 🔴 Not Started |
| [AI-009](../ai-009-booking-workflow/README.md) | n8n Appointment Booking Workflow | 13 | 🔴 Not Started |

### Phase 3: Availability & Notifications (Weeks 5-6) - 16 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-010](../ai-010-availability-ui/README.md) | Seller Availability Management UI | 10 | 🔴 Not Started |
| [AI-011](../ai-011-confirmation-emails/README.md) | Appointment Confirmation Emails | 6 | 🔴 Not Started |

### Phase 4: Chatbot Interface (Weeks 7-8) - 20 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-012](../ai-012-faq-knowledge-base/README.md) | FAQ Knowledge Base Setup | 8 | 🔴 Not Started |
| [AI-013](../ai-013-chatbot-ui/README.md) | Chatbot Main UI Widget | 12 | 🔴 Not Started |

### Phase 5: Analytics & Optimization (Weeks 9-10) - 18 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-014](../ai-014-analytics-dashboard/README.md) | Conversation Analytics Dashboard | 10 | 🔴 Not Started |
| [AI-015](../ai-015-seller-vectors/README.md) | ChromaDB Seller Profile Vectors | 8 | 🔴 Not Started |

### Phase 6: Advanced Automation (Week 11) - 21 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-016](../ai-016-follow-up-system/README.md) | Automated Follow-up System | 7 | 🔴 Not Started |
| [AI-017](../ai-017-rescheduling/README.md) | Appointment Rescheduling | 6 | 🔴 Not Started |
| [AI-018](../ai-018-seller-insights/README.md) | Seller Performance Insights | 8 | 🔴 Not Started |

### Phase 7: Polish & Enhancements (Week 12) - 28 Story Points
| Task | Name | Points | Status |
|------|------|--------|--------|
| [AI-019](../ai-019-multi-language/README.md) | Multi-Language Support (Filipino) | 10 | 🔴 Not Started |
| [AI-020](../ai-020-voice-input/README.md) | Voice Input (Optional - Piper TTS) | 12 | 🔴 Not Started |
| [AI-021](../ai-021-cart-recovery/README.md) | Cart Abandonment Recovery | 6 | 🔴 Not Started |

---

## ✅ Epic Acceptance Criteria

### Core Functionality
- [ ] Complete appointment lifecycle from booking to completion
- [ ] AI matching algorithm achieves >80% satisfaction rate
- [ ] Real-time availability checking with zero double-bookings
- [ ] Email/SMS notifications for all appointment events

### User Experience
- [ ] Seller dashboard shows upcoming appointments with filters
- [ ] Buyers can book appointments in <3 clicks
- [ ] Mobile-responsive UI for all interfaces
- [ ] Chatbot responds in <2 seconds

### Performance & Reliability
- [ ] System handles 100+ concurrent appointment requests
- [ ] 99.9% uptime for appointment booking
- [ ] All AI processing happens locally (no cloud API calls)
- [ ] Full audit trail of all appointment actions

### Admin & Monitoring
- [ ] Admin can monitor system health and appointment metrics
- [ ] Analytics dashboard shows conversion funnels
- [ ] Seller performance tracked and displayed
- [ ] Comprehensive testing suite with >80% coverage

---

## 🔗 Critical Dependencies

**External Dependencies:**
- Docker Desktop (for n8n, Ollama, ChromaDB containers)
- Firebase project (Firestore + Auth)
- 8GB+ RAM (for Llama 3.2 3B model)
- 20GB+ disk space (for all containers + models)

**Task Dependencies (Critical Path):**
```
AI-002 (n8n) → AI-003 (Ollama) → AI-006 (Firestore) → AI-009 (Workflow) → AI-013 (Chatbot)
```

**Parallel Work Possible:**
- AI-004 (Widget UI) + AI-005 (Webhook API) after AI-002
- AI-007 (Recommendations) + AI-012 (FAQ) after AI-003
- AI-010 (Availability UI) + AI-011 (Emails) after AI-009

---

## 📊 Progress Tracking

**Overall Progress:** 0% (0/21 tasks complete)  
**Story Points:** 0/240 complete  
**Estimated Completion:** March 31, 2026

### Velocity Tracking
- **Target Velocity:** 20 story points/week
- **Current Velocity:** N/A (no sprints completed)
- **On Track?** Not started yet

### Phase Completion
- **Phase 1 (Foundation):** 0% (0/3 tasks)
- **Phase 2 (Matching & Booking):** 0% (0/5 tasks)
- **Phase 3 (Availability):** 0% (0/2 tasks)
- **Phase 4 (Chatbot):** 0% (0/2 tasks)
- **Phase 5 (Analytics):** 0% (0/2 tasks)
- **Phase 6 (Automation):** 0% (0/3 tasks)
- **Phase 7 (Polish):** 0% (0/3 tasks)

---

## 📝 Deliverables

### Code Components
- [ ] `AppointmentSystem` core module
- [ ] AI matching algorithm implementation
- [ ] Seller appointment dashboard
- [ ] Buyer booking interface
- [ ] Admin monitoring panel
- [ ] Notification service integration

### Documentation
- [ ] Complete API documentation
- [ ] n8n workflow exports (.json files)
- [ ] Deployment guide (Docker setup)
- [ ] User guides (Buyer, Seller, Admin)
- [ ] Testing suite with >80% coverage

### Infrastructure
- [ ] n8n workflows configured
- [ ] Ollama model fine-tuned for seller matching
- [ ] ChromaDB with seller profile vectors
- [ ] Firestore schema with indexes

---

## 🎓 Implementation Strategy

### Week-by-Week Plan

**Weeks 1-2: Foundation**
- Set up n8n, Ollama, basic UI components
- Establish development workflow
- Create initial webhook APIs

**Weeks 3-4: Core Appointment System**
- Build AI matching engine
- Implement appointment booking workflow
- Create product recommendation system

**Weeks 5-6: Seller Tools**
- Build availability management interface
- Implement email notification system
- Test end-to-end booking flow

**Weeks 7-8: Chatbot Development**
- Create FAQ knowledge base
- Build conversational UI
- Integrate with existing appointment system

**Weeks 9-10: Analytics & Optimization**
- Build analytics dashboard
- Implement ChromaDB for better matching
- Optimize AI prompts for accuracy

**Weeks 11-12: Advanced Features**
- Add follow-up automation
- Implement rescheduling
- Add multi-language support
- Final testing and polish

---

## ⚠️ Risks & Mitigation

### Risk 1: Ollama Performance on Low-End PCs
**Impact:** High (affects all AI features)  
**Mitigation:** Use Llama 3.2 3B (smallest viable model), test on 8GB RAM, provide fallback to cloud API

### Risk 2: n8n Workflow Complexity
**Impact:** Medium (maintenance burden)  
**Mitigation:** Document all workflows, use modular design, export backups regularly

### Risk 3: Double-Booking Race Conditions
**Impact:** High (breaks core promise)  
**Mitigation:** Use Firestore transactions, implement pessimistic locking, add integration tests

### Risk 4: AI Matching Accuracy
**Impact:** Medium (affects user satisfaction)  
**Mitigation:** Start with rule-based fallback, collect user feedback, iterate on prompts

### Risk 5: Scope Creep
**Impact:** High (deadline risk)  
**Mitigation:** Mark AI-020 (Voice) as optional, prioritize P0 features, use time-boxing

---

## 🔗 Related Documents

- [Main Tasks README](../README.md) - Overview of all AI automation tasks
- [Master Plan](../MASTER-PLAN.md) - Detailed epic roadmap
- [Progress Tracker](../PROGRESS-TRACKER.md) - Real-time task completion status
- [GitHub Issue #174](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/174) - Original epic issue

---

## 🎯 Success Metrics

**User Adoption:**
- 500+ appointments booked in first month
- <5% cancellation rate
- >4.5/5 average seller rating

**Performance:**
- <2s AI response time (p95)
- <3s appointment booking time (p95)
- 99.9% uptime

**Business Impact:**
- 30% increase in buyer-seller connections
- 50% reduction in appointment no-shows (vs manual scheduling)
- $0/month operational cost (vs $500+/month for cloud AI services)

---

**Last Updated:** January 7, 2026  
**Epic Status:** 🔴 Not Started  
**Branch:** `174-ai-001-free-self-hosted-ai-buyer-to-seller-appointment-system`  
**GitHub Issue:** [#174](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/174)
