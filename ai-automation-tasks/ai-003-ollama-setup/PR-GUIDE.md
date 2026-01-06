# AI-003: Ollama Setup - Pull Request Guide

> **PR Title:** `feat(ai-003): Complete Ollama + Llama 3.2 3B installation with n8n integration`  
> **Branch:** `feature/ai-003-ollama-setup`  
> **Reviewer:** @PP-Namias (or team lead)

---

## 📋 Pre-PR Checklist

**DO NOT create PR until ALL of these are complete:**

- [ ] All 8 phases in PLANNING.md completed ✅
- [ ] All 13 tests in TESTING.md pass ✅
- [ ] PROGRESS.md shows 🟢 Complete status
- [ ] Screenshots added to PROGRESS.md
- [ ] Ollama verified working after PC reboot
- [ ] n8n integration workflow tested and documented
- [ ] Performance benchmarks recorded
- [ ] Prompts documented in `prompts/` folder or README
- [ ] All acceptance criteria met (see README.md)
- [ ] Code follows project conventions (.github/copilot-instructions.md)
- [ ] No sensitive data in commits (API keys, local file paths)

---

## 🚀 Creating the Pull Request

### Step 1: Prepare Your Branch
```bash
# Ensure you're on the correct branch
git checkout feature/ai-003-ollama-setup

# Stage all changes
git add ai-automation-tasks/ai-003-ollama-setup/

# If you created prompt templates
git add prompts/ # (if created)

# Commit with descriptive message
git commit -m "feat(ai-003): Complete Ollama + Llama 3.2 installation

- Install Ollama and download Llama 3.2 3B model (2GB)
- Verify AI responds to seller matching and product queries
- Integrate Ollama with n8n using HTTP Request node
- Configure auto-start for persistent AI availability
- Benchmark performance: <5sec avg response time
- Document successful prompts for reuse
- All 13 tests passing

Closes #[ISSUE_NUMBER] (AI-001 Epic - Phase 1 Foundation)
"

# Push to remote
git push origin feature/ai-003-ollama-setup
```

### Step 2: Create PR on GitHub
1. Go to [MASH-Ecommerce-Web Repository](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web)
2. Click "Pull Requests" tab
3. Click "New Pull Request"
4. Base: `main` ← Compare: `feature/ai-003-ollama-setup`
5. Click "Create Pull Request"
6. Fill in template below

---

## 📝 PR Description Template

```markdown
## 🎯 Summary

Installed **Ollama** with **Llama 3.2 3B model** to provide FREE local AI for the MASH appointment system. This replaces expensive OpenAI API calls with a fully self-hosted solution running on 8GB RAM PC.

## 🔗 Related Issues

Closes #[ISSUE_NUMBER] (AI-001 Epic)
Part of AI Automation System - Phase 1: Foundation

## 📦 Changes Made

### Installation:
- ✅ Ollama installed and verified (`ollama --version`)
- ✅ Llama 3.2 3B model downloaded (2.0 GB)
- ✅ Auto-start configured for persistent operation

### Testing:
- ✅ Chat interface tested with mushroom queries
- ✅ API endpoint verified via curl
- ✅ n8n integration tested and working

### Documentation:
- ✅ Complete implementation guide (PLANNING.md)
- ✅ 13 comprehensive tests (TESTING.md)
- ✅ Performance benchmarks recorded
- ✅ Successful prompts documented

### Performance Metrics:
- Average response time: ____ seconds
- RAM usage: ____ GB
- Model size: 2.0 GB
- Test success rate: 13/13 (100%)

## 🧪 Testing

All tests in `ai-automation-tasks/ai-003-ollama-setup/TESTING.md` pass:

### Test Results:
- ✅ Installation Tests (3/3)
- ✅ Model Functionality Tests (4/4)
- ✅ API Integration Tests (3/3)
- ✅ Performance Tests (3/3)

**Total:** 13/13 tests passing (100%)

### Key Tests:
1. **Ollama Version Check** - `ollama --version` works
2. **Model Downloaded** - `ollama list` shows llama3.2:3b
3. **Seller Matching** - AI correctly ranks sellers by proximity/specialty
4. **n8n Integration** - Workflow successfully calls Ollama API
5. **Auto-Start** - Verified Ollama starts after PC reboot

## 📸 Screenshots

### Ollama Installed
![Ollama Version](<screenshot-url>)

### Model Downloaded
![Ollama List](<screenshot-url>)

### n8n Integration Working
![n8n Workflow](<screenshot-url>)

### Performance Benchmark
![Response Times](<screenshot-url>)

## 🔄 Dependencies

**Requires:**
- AI-002 (n8n Setup) - COMPLETE ✅

**Unblocks:**
- AI-006 (Firestore Schema) - Can start now
- AI-007 (Product Recommendations) - Can start now
- AI-009 (Booking Workflow) - Waiting on AI-006
- AI-012 (FAQ Knowledge Base) - Can start now

## ⚠️ Breaking Changes

None - This is a new feature addition.

## 📋 Deployment Notes

### For Team Members:
To use Ollama on your local machine:
1. Download installer: https://ollama.com/download
2. Install Ollama
3. Run: `ollama pull llama3.2:3b`
4. Verify: `ollama list`
5. Test n8n integration: See TESTING.md

### System Requirements:
- 8GB+ RAM
- 10GB free disk space
- Windows 10/11, macOS 11+, or Linux

### n8n Integration:
When calling Ollama from n8n Docker container:
- Use: `http://host.docker.internal:11434/api/generate`
- NOT: `http://localhost:11434` (won't work from Docker)

## ✅ Checklist

- [ ] Code follows project style guide
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on local development environment
- [ ] Screenshots/recordings added
- [ ] PR description is clear and complete

## 🎯 Reviewer Focus Areas

Please review:
1. **Documentation completeness** - Is PLANNING.md clear enough for new team members?
2. **Test coverage** - Are all critical paths tested?
3. **n8n integration** - Does the workflow pattern make sense?
4. **Performance benchmarks** - Are response times acceptable?
5. **Prompt templates** - Are prompts reusable and well-structured?

## 📚 Additional Context

- Ollama runs locally (no cloud API costs)
- Llama 3.2 3B optimized for 8GB RAM PCs
- All AI processing happens on-device (privacy-friendly)
- n8n workflows can now use AI for seller matching

## 🚀 Next Steps

After merge:
1. Start AI-006 (Firestore Appointment Schema)
2. Start AI-004 (Appointment Widget UI) - can work in parallel
3. Prepare for AI-009 (n8n Booking Workflow)
```

---

## 👀 Reviewer Checklist

For PR reviewer (team lead or peer):

### Code Quality:
- [ ] Documentation is clear and comprehensive
- [ ] All acceptance criteria from README.md are met
- [ ] Tests are thorough and passing
- [ ] No hardcoded local paths or secrets
- [ ] Follows MASH project conventions

### Functionality:
- [ ] Ollama installation steps are accurate
- [ ] n8n integration pattern is sound
- [ ] Performance benchmarks are documented
- [ ] Auto-start configuration is correct
- [ ] Prompts are well-structured and reusable

### Testing:
- [ ] All 13 tests in TESTING.md are comprehensive
- [ ] Test cases cover critical scenarios
- [ ] Performance tests include benchmarks
- [ ] Integration tests verify n8n connectivity

### Documentation:
- [ ] README.md provides clear overview
- [ ] PLANNING.md breaks down into phases
- [ ] PROGRESS.md template is useful
- [ ] TESTING.md covers all test scenarios
- [ ] NEXT-STEPS.md explains what's unblocked
- [ ] PR-GUIDE.md is complete (this file)

### Security:
- [ ] No API keys or secrets in commits
- [ ] No personal file paths exposed
- [ ] Firewall/security considerations documented

---

## 📝 Commit Message Format

Follow this pattern for all commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples:
```
feat(ai-003): Add Ollama installation guide

Created comprehensive step-by-step guide for installing Ollama
and downloading Llama 3.2 3B model. Includes OS-specific
instructions for Windows, macOS, and Linux.

Refs AI-001
```

```
test(ai-003): Add Ollama API integration tests

Implemented 13 test cases covering installation verification,
model functionality, API integration, and performance benchmarks.

Refs AI-001
```

```
docs(ai-003): Document n8n integration pattern

Added detailed guide for calling Ollama from n8n Docker container
using host.docker.internal endpoint.

Refs AI-001
```

---

## 🐛 If PR Gets Blocked

### Common Issues:

**1. Tests Not Passing**
- Re-run all tests locally
- Document any failing tests in PR comments
- Check if failure is environment-specific
- Update TESTING.md if test needs modification

**2. Documentation Incomplete**
- Review README.md acceptance criteria
- Ensure all phases in PLANNING.md are documented
- Add missing screenshots to PROGRESS.md
- Verify all prompts are documented

**3. Performance Issues**
- Re-run benchmarks on different hardware
- Document hardware specs in PROGRESS.md
- Consider adding performance optimization tips
- Test with smaller model if needed (llama3.2:1b)

**4. Integration Issues**
- Verify n8n can reach Ollama
- Test with fresh n8n workflow
- Check Docker network configuration
- Add troubleshooting section to README

---

## ✅ Post-Merge Actions

After PR is approved and merged:

1. **Update Main Branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Update Epic Progress:**
   - Mark AI-003 as ✅ Complete in `ai-automation-tasks/README.md`
   - Update story points progress

3. **Notify Team:**
   - Post in Slack/Discord: "AI-003 complete! Ollama ready for use"
   - Share performance benchmarks
   - Link to documentation

4. **Start Next Task:**
   ```bash
   git checkout -b feature/ai-006-firestore-schema
   cd ai-automation-tasks/ai-006-firestore-schema
   ```

5. **Archive Branch (optional):**
   ```bash
   git branch -d feature/ai-003-ollama-setup
   git push origin --delete feature/ai-003-ollama-setup
   ```

---

## 📚 Additional Resources

- [GitHub Pull Request Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [MASH Project Conventions](.github/copilot-instructions.md)

---

**Ready to create PR?** ✅  
**All checks complete?** ✅  
**Let's ship it!** 🚀
