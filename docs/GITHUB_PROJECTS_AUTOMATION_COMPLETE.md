# GitHub Projects Automation - Complete Research Document

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub CLI Commands Reference](#github-cli-commands-reference)
4. [Project Board Columns & Fields](#project-board-columns--fields)
5. [Label System](#label-system)
6. [Scoring System](#scoring-system)
7. [Automation Scripts](#automation-scripts)
8. [Sample Issues with Descriptions](#sample-issues-with-descriptions)
9. [Batch Operations](#batch-operations)
10. [Best Practices](#best-practices)

---

## Overview

This document provides a complete guide for automating GitHub Projects management for the MASH Mushroom Automation organization. It covers creating, editing, and deleting issues, as well as managing project board fields and labels.

### Project Information

| Field | Value |
|-------|-------|
| Organization | MASH-Mushroom-Automation |
| Main Repository | MASH-Ecommerce-Web |
| Test Repository | testy |
| Project Board | https://github.com/orgs/MASH-Mushroom-Automation/projects/1 |
| Project Number | 1 |

### Project Board Columns

| Column | Type | Description |
|--------|------|-------------|
| Title | Text | Issue title |
| Score | Number | Priority/complexity score (1-21) |
| Assignees | People | Team member assigned |
| Status | Single Select | Todo, In Progress, In Review, Done |
| Labels | Labels | Issue classification |
| Type | Single Select | Epic, Feature, Task, Bug, Chore |
| Timeline | Date Range | Start and end dates |
| Deadline | Date | Due date |
| Repository | Repository | Source repository |

---

## Prerequisites

### 1. Install GitHub CLI

```bash
# Windows (winget)
winget install --id GitHub.cli

# Windows (Chocolatey)
choco install gh

# Verify installation
gh --version
```

### 2. Authenticate with GitHub

```bash
# Login with browser
gh auth login

# Verify authentication
gh auth status

# Refresh token if needed
gh auth refresh
```

### 3. Required Permissions

- Repository: `repo` (Full control)
- Project: `read:project`, `write:project`
- Organization: `read:org`

---

## GitHub CLI Commands Reference

### Issue Management

#### Create Issues

```bash
# Basic issue creation
gh issue create --repo OWNER/REPO --title "TITLE" --body "BODY"

# With labels
gh issue create --repo OWNER/REPO --title "TITLE" --body "BODY" --label "bug,priority:high"

# With assignee
gh issue create --repo OWNER/REPO --title "TITLE" --body "BODY" --assignee "username"

# With milestone
gh issue create --repo OWNER/REPO --title "TITLE" --body "BODY" --milestone "v1.0"

# Complete example
gh issue create ^
  --repo MASH-Mushroom-Automation/testy ^
  --title "[TEST-001] Sample Feature Implementation" ^
  --body "## Description\n\nThis is a sample issue.\n\n### Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2" ^
  --label "feature,priority:high" ^
  --assignee "PP-Namias"
```

#### Edit Issues

```bash
# Edit title
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --title "NEW TITLE"

# Edit body
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --body "NEW BODY"

# Edit using body file (for long descriptions)
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --body-file "path/to/body.md"

# Add labels
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --add-label "new-label"

# Remove labels
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --remove-label "old-label"

# Add assignee
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --add-assignee "username"

# Remove assignee
gh issue edit ISSUE_NUMBER --repo OWNER/REPO --remove-assignee "username"
```

#### Delete Issues (Close)

```bash
# Close issue (GitHub doesn't allow permanent deletion via CLI)
gh issue close ISSUE_NUMBER --repo OWNER/REPO

# Close with reason
gh issue close ISSUE_NUMBER --repo OWNER/REPO --reason "completed"
gh issue close ISSUE_NUMBER --repo OWNER/REPO --reason "not_planned"

# Reopen issue
gh issue reopen ISSUE_NUMBER --repo OWNER/REPO

# Delete issue (requires GitHub API or web UI)
# Use GraphQL mutation or delete from web interface
```

#### List Issues

```bash
# List all open issues
gh issue list --repo OWNER/REPO

# List with filters
gh issue list --repo OWNER/REPO --state open --label "bug"

# List with limit
gh issue list --repo OWNER/REPO --limit 100

# List with JSON output
gh issue list --repo OWNER/REPO --json number,title,labels

# List all including closed
gh issue list --repo OWNER/REPO --state all
```

#### View Issue

```bash
# View issue details
gh issue view ISSUE_NUMBER --repo OWNER/REPO

# View as JSON
gh issue view ISSUE_NUMBER --repo OWNER/REPO --json body,title,labels
```

### Label Management

```bash
# List all labels
gh label list --repo OWNER/REPO

# Create label
gh label create "label-name" --repo OWNER/REPO --color "hexcode" --description "description"

# Delete label
gh label delete "label-name" --repo OWNER/REPO --yes

# Edit label
gh label edit "old-name" --repo OWNER/REPO --name "new-name" --color "newcolor"
```

### Project Management (GraphQL)

```bash
# Get project ID
gh api graphql -f query='
  query {
    organization(login: "MASH-Mushroom-Automation") {
      projectV2(number: 1) {
        id
        title
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
  }
'

# Add issue to project
gh api graphql -f query='
  mutation {
    addProjectV2ItemById(input: {
      projectId: "PROJECT_ID"
      contentId: "ISSUE_NODE_ID"
    }) {
      item {
        id
      }
    }
  }
'

# Update project item field
gh api graphql -f query='
  mutation {
    updateProjectV2ItemFieldValue(input: {
      projectId: "PROJECT_ID"
      itemId: "ITEM_ID"
      fieldId: "FIELD_ID"
      value: { number: 5 }
    }) {
      projectV2Item {
        id
      }
    }
  }
'
```

---

## Project Board Columns & Fields

### Column Definitions

#### Status (Single Select)
| Option | Color | Description |
|--------|-------|-------------|
| 📋 Todo | Gray | Not started |
| 🔄 In Progress | Yellow | Currently working |
| 👀 In Review | Purple | Awaiting review |
| ✅ Done | Green | Completed |
| ❌ Cancelled | Red | Not proceeding |

#### Type (Single Select)
| Option | Color | Description |
|--------|-------|-------------|
| 🎯 Epic | Purple | Large feature container |
| ✨ Feature | Blue | New functionality |
| 📝 Task | Green | Work item |
| 🐛 Bug | Red | Defect fix |
| 🔧 Chore | Gray | Maintenance |

#### Priority (via Labels)
| Label | Color | Score Modifier |
|-------|-------|----------------|
| priority:critical | #b60205 | +8 |
| priority:high | #d73a4a | +5 |
| priority:medium | #fbca04 | +3 |
| priority:low | #0e8a16 | +1 |

### Score Calculation

The Score field uses Fibonacci sequence (1, 2, 3, 5, 8, 13, 21) for story points:

```javascript
function calculateScore(task) {
  let score = 0;
  
  // Base complexity
  const complexity = {
    'trivial': 1,
    'simple': 2,
    'moderate': 3,
    'complex': 5,
    'very-complex': 8,
    'epic': 13
  };
  
  score += complexity[task.complexity] || 3;
  
  // Priority modifier
  const priority = {
    'critical': 8,
    'high': 5,
    'medium': 3,
    'low': 1
  };
  
  score += priority[task.priority] || 3;
  
  // Cap at 21
  return Math.min(score, 21);
}
```

---

## Label System

### Complete Label Set

```bash
# Create all labels for the project
# Priority Labels
gh label create "priority:critical" --color "b60205" --description "Critical priority - needs immediate attention" --repo OWNER/REPO
gh label create "priority:high" --color "d73a4a" --description "High priority" --repo OWNER/REPO
gh label create "priority:medium" --color "fbca04" --description "Medium priority" --repo OWNER/REPO
gh label create "priority:low" --color "0e8a16" --description "Low priority" --repo OWNER/REPO

# Type Labels
gh label create "type:epic" --color "7057ff" --description "Epic - large feature" --repo OWNER/REPO
gh label create "type:feature" --color "0366d6" --description "New feature" --repo OWNER/REPO
gh label create "type:task" --color "28a745" --description "Task" --repo OWNER/REPO
gh label create "type:bug" --color "d73a4a" --description "Bug fix" --repo OWNER/REPO
gh label create "type:chore" --color "6a737d" --description "Maintenance" --repo OWNER/REPO

# Category Labels
gh label create "frontend" --color "fbca04" --description "Frontend changes" --repo OWNER/REPO
gh label create "backend" --color "0366d6" --description "Backend changes" --repo OWNER/REPO
gh label create "cms" --color "28a745" --description "CMS related" --repo OWNER/REPO
gh label create "api" --color "f66a0a" --description "API related" --repo OWNER/REPO
gh label create "database" --color "5319e7" --description "Database changes" --repo OWNER/REPO
gh label create "ui" --color "e99695" --description "UI/UX changes" --repo OWNER/REPO
gh label create "testing" --color "bfd4f2" --description "Testing related" --repo OWNER/REPO
gh label create "documentation" --color "c5def5" --description "Documentation" --repo OWNER/REPO
gh label create "infrastructure" --color "6a737d" --description "Infrastructure/DevOps" --repo OWNER/REPO

# Status Labels
gh label create "status:blocked" --color "b60205" --description "Blocked by dependency" --repo OWNER/REPO
gh label create "status:needs-review" --color "7057ff" --description "Needs code review" --repo OWNER/REPO
gh label create "status:in-progress" --color "fbca04" --description "Work in progress" --repo OWNER/REPO

# Effort Labels (Story Points)
gh label create "effort:1" --color "c5def5" --description "1 story point - trivial" --repo OWNER/REPO
gh label create "effort:2" --color "bfd4f2" --description "2 story points - simple" --repo OWNER/REPO
gh label create "effort:3" --color "d4c5f9" --description "3 story points - moderate" --repo OWNER/REPO
gh label create "effort:5" --color "f9d0c4" --description "5 story points - complex" --repo OWNER/REPO
gh label create "effort:8" --color "fef2c0" --description "8 story points - very complex" --repo OWNER/REPO
gh label create "effort:13" --color "e99695" --description "13 story points - epic" --repo OWNER/REPO
```

---

## Scoring System

### Fibonacci Story Points

| Points | Complexity | Time Estimate | Example |
|--------|------------|---------------|---------|
| 1 | Trivial | < 1 hour | Fix typo, update config |
| 2 | Simple | 1-2 hours | Add label, simple fix |
| 3 | Moderate | 2-4 hours | New component, API endpoint |
| 5 | Complex | 4-8 hours | Feature with multiple parts |
| 8 | Very Complex | 1-2 days | Major feature, integration |
| 13 | Epic | 3-5 days | Full system, architecture |
| 21 | Huge Epic | 1-2 weeks | Platform-wide change |

### Priority Levels

| Priority | Response Time | Description |
|----------|---------------|-------------|
| Critical | Immediate | Production down, security issue |
| High | Same day | Important feature, bug affecting users |
| Medium | This sprint | Normal priority work |
| Low | Backlog | Nice to have, future improvements |

### Combined Score Formula

```
Total Score = Base Complexity Points + Priority Modifier

Example:
- Moderate task (3 points) + High priority (+5) = 8 total
- Simple task (2 points) + Low priority (+1) = 3 total
- Epic (13 points) + Critical (+8) = 21 total (capped)
```

---

## Automation Scripts

### 1. Create Labels Script (create-labels.bat)

```batch
@echo off
REM ============================================
REM Create Labels for Repository
REM ============================================

set REPO=MASH-Mushroom-Automation/testy

echo Creating priority labels...
gh label create "priority:critical" --color "b60205" --description "Critical priority" --repo %REPO%
gh label create "priority:high" --color "d73a4a" --description "High priority" --repo %REPO%
gh label create "priority:medium" --color "fbca04" --description "Medium priority" --repo %REPO%
gh label create "priority:low" --color "0e8a16" --description "Low priority" --repo %REPO%

echo Creating type labels...
gh label create "type:epic" --color "7057ff" --description "Epic" --repo %REPO%
gh label create "type:feature" --color "0366d6" --description "Feature" --repo %REPO%
gh label create "type:task" --color "28a745" --description "Task" --repo %REPO%
gh label create "type:bug" --color "d73a4a" --description "Bug" --repo %REPO%
gh label create "type:chore" --color "6a737d" --description "Chore" --repo %REPO%

echo Creating category labels...
gh label create "frontend" --color "fbca04" --description "Frontend" --repo %REPO%
gh label create "backend" --color "0366d6" --description "Backend" --repo %REPO%
gh label create "cms" --color "28a745" --description "CMS" --repo %REPO%
gh label create "testing" --color "bfd4f2" --description "Testing" --repo %REPO%

echo Creating effort labels...
gh label create "effort:1" --color "c5def5" --description "1 point" --repo %REPO%
gh label create "effort:2" --color "bfd4f2" --description "2 points" --repo %REPO%
gh label create "effort:3" --color "d4c5f9" --description "3 points" --repo %REPO%
gh label create "effort:5" --color "f9d0c4" --description "5 points" --repo %REPO%
gh label create "effort:8" --color "fef2c0" --description "8 points" --repo %REPO%
gh label create "effort:13" --color "e99695" --description "13 points" --repo %REPO%

echo Done!
pause
```

### 2. Create Test Issues Script (create-test-issues.bat)

```batch
@echo off
REM ============================================
REM Create Test Issues for testy Repository
REM ============================================

set REPO=MASH-Mushroom-Automation/testy
set ASSIGNEE=PP-Namias

echo Creating test issues...

REM Issue 1: Epic
gh issue create --repo %REPO% ^
  --title "[TEST-001] E-Commerce Platform MVP" ^
  --body "## Epic Overview\n\n**Build the complete e-commerce MVP**\n\n### Objectives\n- Product catalog\n- Shopping cart\n- Checkout flow\n- Order management\n\n### Timeline\n- Start: December 4, 2025\n- End: December 18, 2025\n\n### Success Criteria\n- [ ] 15 products listed\n- [ ] Cart functionality working\n- [ ] Payment integration complete" ^
  --label "type:epic,priority:high,effort:13" ^
  --assignee %ASSIGNEE%

REM Issue 2: Feature
gh issue create --repo %REPO% ^
  --title "[TEST-002] Product Catalog Page" ^
  --body "## Feature Description\n\n**Create the main product catalog page**\n\n### Requirements\n- Grid layout for products\n- Category filtering\n- Search functionality\n- Pagination\n\n### Acceptance Criteria\n- [ ] Products display in grid\n- [ ] Filter by category works\n- [ ] Search returns results\n- [ ] Pagination handles 50+ products" ^
  --label "type:feature,priority:high,frontend,effort:5" ^
  --assignee %ASSIGNEE%

REM Issue 3: Task
gh issue create --repo %REPO% ^
  --title "[TEST-003] Setup Sanity CMS Schema" ^
  --body "## Task Description\n\n**Configure Sanity CMS with product schema**\n\n### Deliverables\n- [x] Product schema\n- [x] Category schema\n- [x] Image handling\n- [ ] Initial data import\n\n### Technical Notes\n- Project ID: gerattrr\n- Dataset: production" ^
  --label "type:task,priority:medium,cms,effort:3" ^
  --assignee %ASSIGNEE%

REM Issue 4: Bug
gh issue create --repo %REPO% ^
  --title "[TEST-004] Fix Product Image Not Loading" ^
  --body "## Bug Description\n\n**Product images show placeholder instead of actual images**\n\n### Steps to Reproduce\n1. Go to /shop\n2. View any product card\n3. Image shows placeholder\n\n### Expected Behavior\nActual product image should display\n\n### Actual Behavior\nPlaceholder image shown\n\n### Environment\n- Browser: Chrome 120\n- OS: Windows 11" ^
  --label "type:bug,priority:critical,frontend,effort:2" ^
  --assignee %ASSIGNEE%

REM Issue 5: Chore
gh issue create --repo %REPO% ^
  --title "[TEST-005] Update Dependencies" ^
  --body "## Chore Description\n\n**Update all npm dependencies to latest versions**\n\n### Packages to Update\n- [ ] next: 15.0.0 -> 15.0.3\n- [ ] react: 18.2.0 -> 19.0.0\n- [ ] tailwindcss: 3.4.0 -> 3.4.16\n- [ ] @sanity/client: 6.0.0 -> 6.22.1\n\n### Testing Required\n- [ ] Build passes\n- [ ] All pages load\n- [ ] No console errors" ^
  --label "type:chore,priority:low,infrastructure,effort:2" ^
  --assignee %ASSIGNEE%

echo Done! Created 5 test issues.
pause
```

### 3. Bulk Operations Script (bulk-operations.bat)

```batch
@echo off
REM ============================================
REM Bulk Operations for GitHub Issues
REM ============================================

set REPO=MASH-Mushroom-Automation/testy

:menu
cls
echo ==========================================
echo   GitHub Issues Bulk Operations
echo   Repository: %REPO%
echo ==========================================
echo.
echo   1. List all open issues
echo   2. List issues by label
echo   3. Close all issues with label
echo   4. Add label to all open issues
echo   5. Remove label from all issues
echo   6. Assign all open issues
echo   7. Export issues to JSON
echo   8. Delete/Close all issues
echo   9. Exit
echo.
set /p choice="Select option (1-9): "

if "%choice%"=="1" goto list_all
if "%choice%"=="2" goto list_by_label
if "%choice%"=="3" goto close_by_label
if "%choice%"=="4" goto add_label
if "%choice%"=="5" goto remove_label
if "%choice%"=="6" goto assign_all
if "%choice%"=="7" goto export_json
if "%choice%"=="8" goto delete_all
if "%choice%"=="9" exit
goto menu

:list_all
echo.
echo Listing all open issues...
gh issue list --repo %REPO% --state open
pause
goto menu

:list_by_label
set /p label="Enter label name: "
gh issue list --repo %REPO% --label "%label%"
pause
goto menu

:close_by_label
set /p label="Enter label to close issues for: "
echo Closing all issues with label: %label%
for /f "tokens=1" %%i in ('gh issue list --repo %REPO% --label "%label%" --json number --jq ".[].number"') do (
    echo Closing issue #%%i
    gh issue close %%i --repo %REPO%
)
echo Done!
pause
goto menu

:add_label
set /p label="Enter label to add: "
echo Adding label %label% to all open issues...
for /f "tokens=1" %%i in ('gh issue list --repo %REPO% --state open --json number --jq ".[].number"') do (
    echo Adding label to issue #%%i
    gh issue edit %%i --repo %REPO% --add-label "%label%"
)
echo Done!
pause
goto menu

:remove_label
set /p label="Enter label to remove: "
echo Removing label %label% from all issues...
for /f "tokens=1" %%i in ('gh issue list --repo %REPO% --label "%label%" --json number --jq ".[].number"') do (
    echo Removing label from issue #%%i
    gh issue edit %%i --repo %REPO% --remove-label "%label%"
)
echo Done!
pause
goto menu

:assign_all
set /p assignee="Enter assignee username: "
echo Assigning all open issues to %assignee%...
for /f "tokens=1" %%i in ('gh issue list --repo %REPO% --state open --json number --jq ".[].number"') do (
    echo Assigning issue #%%i
    gh issue edit %%i --repo %REPO% --add-assignee "%assignee%"
)
echo Done!
pause
goto menu

:export_json
echo Exporting issues to issues-export.json...
gh issue list --repo %REPO% --state all --json number,title,body,labels,assignees,state,createdAt,updatedAt > issues-export.json
echo Done! Saved to issues-export.json
pause
goto menu

:delete_all
echo WARNING: This will close ALL issues in %REPO%
set /p confirm="Type YES to confirm: "
if /i "%confirm%"=="YES" (
    for /f "tokens=1" %%i in ('gh issue list --repo %REPO% --state open --json number --jq ".[].number"') do (
        echo Closing issue #%%i
        gh issue close %%i --repo %REPO% --reason "not_planned"
    )
    echo Done! All issues closed.
) else (
    echo Cancelled.
)
pause
goto menu
```

### 4. Node.js Automation Script (run-automation.js)

```javascript
#!/usr/bin/env node

/**
 * GitHub Projects Automation Script
 * 
 * Comprehensive automation for managing GitHub issues and projects.
 * 
 * Usage:
 * node run-automation.js create-labels
 * node run-automation.js create-issues
 * node run-automation.js update-descriptions
 * node run-automation.js add-to-project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  owner: 'MASH-Mushroom-Automation',
  repo: 'testy',
  mainRepo: 'MASH-Ecommerce-Web',
  projectNumber: 1,
  assignee: 'PP-Namias'
};

// Labels definition
const LABELS = [
  // Priority
  { name: 'priority:critical', color: 'b60205', description: 'Critical priority - needs immediate attention' },
  { name: 'priority:high', color: 'd73a4a', description: 'High priority' },
  { name: 'priority:medium', color: 'fbca04', description: 'Medium priority' },
  { name: 'priority:low', color: '0e8a16', description: 'Low priority' },
  
  // Type
  { name: 'type:epic', color: '7057ff', description: 'Epic - large feature' },
  { name: 'type:feature', color: '0366d6', description: 'New feature' },
  { name: 'type:task', color: '28a745', description: 'Task' },
  { name: 'type:bug', color: 'd73a4a', description: 'Bug fix' },
  { name: 'type:chore', color: '6a737d', description: 'Maintenance' },
  
  // Category
  { name: 'frontend', color: 'fbca04', description: 'Frontend changes' },
  { name: 'backend', color: '0366d6', description: 'Backend changes' },
  { name: 'cms', color: '28a745', description: 'CMS related' },
  { name: 'api', color: 'f66a0a', description: 'API related' },
  { name: 'testing', color: 'bfd4f2', description: 'Testing related' },
  { name: 'documentation', color: 'c5def5', description: 'Documentation' },
  
  // Effort
  { name: 'effort:1', color: 'c5def5', description: '1 story point - trivial' },
  { name: 'effort:2', color: 'bfd4f2', description: '2 story points - simple' },
  { name: 'effort:3', color: 'd4c5f9', description: '3 story points - moderate' },
  { name: 'effort:5', color: 'f9d0c4', description: '5 story points - complex' },
  { name: 'effort:8', color: 'fef2c0', description: '8 story points - very complex' },
  { name: 'effort:13', color: 'e99695', description: '13 story points - epic' }
];

// Sample issues for testy repository
const SAMPLE_ISSUES = [
  {
    id: 'TEST-001',
    title: '[TEST-001] E-Commerce Platform MVP',
    type: 'Epic',
    priority: 'high',
    effort: 13,
    labels: ['type:epic', 'priority:high', 'effort:13'],
    description: `## Epic Overview

**Build the complete e-commerce MVP for MASH Mushroom Store**

### Business Objective
Create a fully functional e-commerce platform for selling fresh mushrooms, dried mushrooms, and growing kits to customers in Metro Manila with same-day delivery capability.

### Timeline
- **Start Date:** December 4, 2025
- **End Date:** December 18, 2025
- **Duration:** 2 weeks
- **Sprint:** Sprint 1

### Scope

#### In Scope
- Product catalog with 15 products
- Shopping cart functionality
- Checkout with multiple payment options
- Same-day delivery via Lalamove
- Order management system
- Customer account management

#### Out of Scope
- Multi-vendor marketplace
- Subscription system
- Mobile app

### Success Criteria
- [ ] 15 products available for purchase
- [ ] Cart functionality with quantity updates
- [ ] Checkout with COD and GCash payment
- [ ] Lalamove integration for delivery quotes
- [ ] Order confirmation emails working
- [ ] Admin can view and manage orders

### Child Issues
- TEST-002: Product Catalog Page
- TEST-003: Shopping Cart
- TEST-004: Checkout Flow
- TEST-005: Order Management

### Dependencies
- Sanity CMS setup
- Lalamove API credentials
- GCash integration
- Email service (SendGrid)

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lalamove API issues | Medium | High | Have manual order fallback |
| Payment integration delays | Low | High | Start with COD only |
| Data migration problems | Medium | Medium | Test with sample data first |

### Resources
- Lead Developer: @PP-Namias
- Design: Figma mockups available
- API Documentation: See /docs folder`
  },
  {
    id: 'TEST-002',
    title: '[TEST-002] Product Catalog Page',
    type: 'Feature',
    priority: 'high',
    effort: 5,
    labels: ['type:feature', 'priority:high', 'frontend', 'effort:5'],
    description: `## Feature Description

**Create the main product catalog page with filtering and search**

### User Story
As a customer, I want to browse all available products so that I can find mushrooms I want to buy.

### Requirements

#### Functional Requirements
1. Display products in a responsive grid layout
2. Filter products by category (Fresh, Dried, Kits)
3. Search products by name or description
4. Sort by price, name, or popularity
5. Show stock status (In Stock, Low Stock, Out of Stock)
6. Pagination for 12 products per page

#### Non-Functional Requirements
- Page load time < 2 seconds
- Mobile responsive (breakpoints: 640px, 768px, 1024px)
- SEO optimized with meta tags

### Acceptance Criteria
- [ ] Products display in 3-column grid on desktop
- [ ] Products display in 2-column grid on tablet
- [ ] Products display in 1-column grid on mobile
- [ ] Category filter shows correct products
- [ ] Search returns relevant results in < 500ms
- [ ] Sort options work correctly
- [ ] Pagination handles 50+ products
- [ ] Product cards show: image, name, price, stock badge
- [ ] Click on product navigates to detail page

### Technical Implementation

#### GROQ Query
\`\`\`javascript
*[_type == "product" && !(_id in path("drafts.**"))] 
| order(name asc) [0...12] {
  _id,
  name,
  slug,
  price,
  "image": coalesce(image.asset->url, mainImage.asset->url),
  category->{name, slug},
  stockStatus,
  isFeatured
}
\`\`\`

#### Components
- ProductGrid.tsx
- ProductCard.tsx
- CategoryFilter.tsx
- SearchBar.tsx
- SortDropdown.tsx
- Pagination.tsx

### Design Reference
- Figma: [Link to design]
- Screenshot attached

### Parent Issue
TEST-001: E-Commerce Platform MVP`
  },
  {
    id: 'TEST-003',
    title: '[TEST-003] Shopping Cart Implementation',
    type: 'Feature',
    priority: 'high',
    effort: 5,
    labels: ['type:feature', 'priority:high', 'frontend', 'effort:5'],
    description: `## Feature Description

**Implement shopping cart with localStorage persistence**

### User Story
As a customer, I want to add products to my cart so that I can purchase multiple items at once.

### Requirements

#### Core Features
1. Add to cart button on product cards and detail page
2. Cart icon in header with item count badge
3. Cart drawer/sidebar with product list
4. Quantity adjustment (+/- buttons)
5. Remove item button
6. Cart total calculation
7. Proceed to checkout button

#### Persistence
- Cart saved to localStorage
- Cart survives page refresh
- Cart synced across tabs

### Acceptance Criteria
- [ ] Add to cart updates item count instantly
- [ ] Cart drawer shows all items
- [ ] Quantity can be increased/decreased
- [ ] Remove button removes item
- [ ] Total updates when quantity changes
- [ ] Cart persists after page refresh
- [ ] Empty cart shows "Cart is empty" message
- [ ] Checkout button navigates to /checkout

### Technical Implementation

#### State Management
\`\`\`typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    id: string;
    name: string;
    price: number;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
\`\`\`

### Parent Issue
TEST-001: E-Commerce Platform MVP`
  },
  {
    id: 'TEST-004',
    title: '[TEST-004] Fix Cart Total Not Updating',
    type: 'Bug',
    priority: 'critical',
    effort: 2,
    labels: ['type:bug', 'priority:critical', 'frontend', 'effort:2'],
    description: `## Bug Description

**Cart total doesn't update when quantity is changed**

### Environment
- Browser: Chrome 120.0.6099.130
- OS: Windows 11
- Node: 20.10.0
- Next.js: 15.0.3

### Steps to Reproduce
1. Go to /shop
2. Add any product to cart
3. Open cart drawer
4. Click + to increase quantity
5. Observe total amount

### Expected Behavior
Total should increase by the product price for each quantity increment.

### Actual Behavior
Total remains unchanged when quantity is updated. Only updates after page refresh.

### Screenshots
[Attach screenshot showing the bug]

### Console Errors
\`\`\`
Warning: Cannot update a component while rendering a different component
\`\`\`

### Root Cause Analysis
The \`updateQuantity\` function is not triggering a re-calculation of the total. The \`useMemo\` dependency array is missing the \`items\` reference.

### Proposed Fix
\`\`\`typescript
// Before
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, []); // Missing dependency

// After
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]); // Added items dependency
\`\`\`

### Testing Required
- [ ] Verify total updates on quantity increase
- [ ] Verify total updates on quantity decrease
- [ ] Verify total updates on item removal
- [ ] Verify total persists after refresh
- [ ] Run unit tests for cart calculations

### Priority Justification
This is critical because it directly affects customer trust and order accuracy. Customers may abandon cart if totals appear incorrect.`
  },
  {
    id: 'TEST-005',
    title: '[TEST-005] Update Node Dependencies',
    type: 'Chore',
    priority: 'low',
    effort: 2,
    labels: ['type:chore', 'priority:low', 'infrastructure', 'effort:2'],
    description: `## Chore Description

**Update all npm dependencies to latest stable versions**

### Current vs Target Versions

| Package | Current | Target | Breaking Changes |
|---------|---------|--------|------------------|
| next | 15.0.0 | 15.0.3 | None |
| react | 18.2.0 | 19.0.0 | Yes - see notes |
| react-dom | 18.2.0 | 19.0.0 | Yes - see notes |
| typescript | 5.3.0 | 5.7.2 | Minor |
| tailwindcss | 3.4.0 | 3.4.16 | None |
| @sanity/client | 6.15.0 | 6.22.1 | None |
| framer-motion | 10.16.0 | 11.12.0 | Yes - see notes |

### React 19 Migration Notes
- useFormState renamed to useActionState
- ref as a prop instead of forwardRef
- New use() hook for promises
- Preload support for resources

### Steps to Complete
1. [ ] Create backup branch
2. [ ] Update package.json versions
3. [ ] Run npm install
4. [ ] Fix any TypeScript errors
5. [ ] Test all pages manually
6. [ ] Run test suite
7. [ ] Update any deprecated APIs
8. [ ] Document breaking changes

### Testing Checklist
- [ ] Homepage loads
- [ ] Product catalog works
- [ ] Cart functionality works
- [ ] Checkout flow works
- [ ] Admin dashboard works
- [ ] No console errors
- [ ] Build succeeds
- [ ] Deploy preview works

### Rollback Plan
If issues are found:
\`\`\`bash
git checkout main
git branch -D dependency-update
npm ci
\`\`\``
  }
];

// Helper to run commands
function runCommand(cmd, silent = false) {
  try {
    const result = execSync(cmd, { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
    if (!silent) console.log(result);
    return { success: true, output: result.trim() };
  } catch (error) {
    if (!silent) console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Create labels
function createLabels() {
  console.log('\n📌 Creating labels...\n');
  
  LABELS.forEach(label => {
    console.log(`Creating label: ${label.name}`);
    const cmd = `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --repo ${CONFIG.owner}/${CONFIG.repo} --force`;
    runCommand(cmd, true);
  });
  
  console.log('\n✅ Labels created!\n');
}

// Create issues
function createIssues() {
  console.log('\n📝 Creating sample issues...\n');
  
  SAMPLE_ISSUES.forEach(issue => {
    console.log(`Creating issue: ${issue.title}`);
    
    // Write body to temp file
    const tempFile = path.join(__dirname, `temp-${issue.id}.md`);
    fs.writeFileSync(tempFile, issue.description);
    
    const labels = issue.labels.join(',');
    const cmd = `gh issue create --repo ${CONFIG.owner}/${CONFIG.repo} --title "${issue.title}" --body-file "${tempFile}" --label "${labels}" --assignee "${CONFIG.assignee}"`;
    
    const result = runCommand(cmd, true);
    if (result.success) {
      console.log(`  ✅ Created: ${issue.title}`);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
    
    // Clean up
    try { fs.unlinkSync(tempFile); } catch (e) {}
  });
  
  console.log('\n✅ Issues created!\n');
}

// Delete all issues
function deleteAllIssues() {
  console.log('\n🗑️ Closing all issues...\n');
  
  // Get all open issues
  const listCmd = `gh issue list --repo ${CONFIG.owner}/${CONFIG.repo} --state open --json number --jq ".[].number"`;
  const result = runCommand(listCmd, true);
  
  if (result.success && result.output) {
    const issueNumbers = result.output.split('\n').filter(n => n);
    
    issueNumbers.forEach(num => {
      console.log(`Closing issue #${num}`);
      runCommand(`gh issue close ${num} --repo ${CONFIG.owner}/${CONFIG.repo} --reason "not_planned"`, true);
    });
    
    console.log(`\n✅ Closed ${issueNumbers.length} issues!\n`);
  } else {
    console.log('No issues to close.\n');
  }
}

// List issues
function listIssues() {
  console.log('\n📋 Listing all issues...\n');
  runCommand(`gh issue list --repo ${CONFIG.owner}/${CONFIG.repo} --state all --limit 50`);
}

// Main
const command = process.argv[2];

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  GitHub Projects Automation                               ║');
console.log(`║  Repository: ${CONFIG.owner}/${CONFIG.repo}               `);
console.log('╚══════════════════════════════════════════════════════════╝');

switch (command) {
  case 'create-labels':
    createLabels();
    break;
  case 'create-issues':
    createIssues();
    break;
  case 'delete-all':
    deleteAllIssues();
    break;
  case 'list':
    listIssues();
    break;
  case 'full-setup':
    createLabels();
    createIssues();
    break;
  default:
    console.log(`
Usage:
  node run-automation.js <command>

Commands:
  create-labels   Create all labels in repository
  create-issues   Create sample issues
  delete-all      Close all open issues
  list            List all issues
  full-setup      Create labels and issues
`);
}
```

---

## Sample Issues with Descriptions

See the `SAMPLE_ISSUES` array in the Node.js script above for complete examples of:

1. **Epic** - Large feature container with timeline, scope, success criteria
2. **Feature** - User story with acceptance criteria and technical details
3. **Bug** - Reproduction steps, expected vs actual, root cause analysis
4. **Task** - Specific deliverable with checklist
5. **Chore** - Maintenance work with testing checklist

---

## Batch Operations

### Update All Issues with Descriptions

```bash
# Run the update script for main repo
node scripts/github/update-issue-descriptions.js

# With range
node scripts/github/update-issue-descriptions.js --start=36 --end=50
```

### Add All Issues to Project

```bash
# Get project ID first
gh api graphql -f query='
  query {
    organization(login: "MASH-Mushroom-Automation") {
      projectV2(number: 1) {
        id
      }
    }
  }
'

# Then add each issue
for /f "tokens=1" %%i in ('gh issue list --repo MASH-Mushroom-Automation/testy --json number,id --jq ".[] | .id"') do (
    gh api graphql -f query="mutation { addProjectV2ItemById(input: {projectId: \"PROJECT_ID\" contentId: \"%%i\"}) { item { id } } }"
)
```

### Update Project Field Values

```bash
# Update Score field for all items
# First get the field ID and item IDs, then update each
```

---

## Best Practices

### 1. Issue Naming Convention

```
[PREFIX-NUMBER] Brief Title

Examples:
[ECOM-001] Sanity CMS Implementation
[TEST-001] E-Commerce Platform MVP
[BUG-042] Fix Cart Total Calculation
```

### 2. Description Template

```markdown
## Description
Brief overview of what this issue addresses.

## Requirements/Steps to Reproduce
- Requirement 1 or Step 1
- Requirement 2 or Step 2

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
Implementation details, code snippets, etc.

## Related Issues
- Depends on: #123
- Blocks: #456
```

### 3. Label Usage

- Always include ONE type label (epic, feature, task, bug, chore)
- Always include ONE priority label
- Add category labels as needed
- Add effort label for story points

### 4. Project Board Workflow

1. **Todo**: Issue created, not started
2. **In Progress**: Developer actively working
3. **In Review**: PR submitted, awaiting review
4. **Done**: Merged and deployed

### 5. Sprint Planning

- Assign issues to milestones for sprints
- Set deadlines based on sprint end date
- Calculate capacity using story points
- Aim for 20-30 points per developer per sprint

---

## Quick Reference Commands

```bash
# Create issue with all fields
gh issue create --repo OWNER/REPO --title "TITLE" --body "BODY" --label "labels" --assignee "user" --milestone "sprint"

# Edit issue
gh issue edit NUMBER --repo OWNER/REPO --title "NEW" --body "NEW" --add-label "label"

# Close issue
gh issue close NUMBER --repo OWNER/REPO --reason "completed"

# List issues
gh issue list --repo OWNER/REPO --state open --label "bug" --limit 50

# View issue
gh issue view NUMBER --repo OWNER/REPO --json body,title,labels

# Create label
gh label create "name" --color "hexcode" --description "desc" --repo OWNER/REPO

# Export all issues
gh issue list --repo OWNER/REPO --state all --json number,title,body,labels > issues.json
```

---

**Last Updated:** December 4, 2025
**Author:** MASH Automation Team
