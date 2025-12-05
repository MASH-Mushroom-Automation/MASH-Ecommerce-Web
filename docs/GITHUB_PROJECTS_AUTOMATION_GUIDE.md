# GitHub Projects Automation Guide

## Complete Reference for Automated Issue and Project Management

**Version:** 1.0  
**Last Updated:** December 3, 2025  
**Repository:** MASH-Mushroom-Automation  
**Test Repository:** https://github.com/MASH-Mushroom-Automation/testy  
**Project Board:** https://github.com/orgs/MASH-Mushroom-Automation/projects/1/views/1

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Board Structure](#project-board-structure)
4. [Label System](#label-system)
5. [Scoring System](#scoring-system)
6. [GitHub CLI Commands Reference](#github-cli-commands-reference)
7. [Automation Scripts](#automation-scripts)
8. [API Reference](#api-reference)
9. [Best Practices](#best-practices)

---

## Overview

This guide provides comprehensive documentation for automating GitHub Projects management using:

- **GitHub CLI (gh)** - Command-line interface for GitHub operations
- **GitHub REST API** - Direct API calls for advanced operations
- **GitHub GraphQL API** - For Projects V2 (new project boards)
- **Node.js Scripts** - Automated task distribution and management

### Key Capabilities

| Operation | CLI Support | API Support | Script Support |
|-----------|-------------|-------------|----------------|
| Create Issues | Yes | Yes | Yes |
| Edit Issues | Yes | Yes | Yes |
| Delete Issues | Yes | Yes | Yes |
| Add to Project | Limited | Yes | Yes |
| Update Project Fields | No | Yes (GraphQL) | Yes |
| Bulk Operations | Manual | Yes | Yes |
| Label Management | Yes | Yes | Yes |
| Assignee Management | Yes | Yes | Yes |

---

## Prerequisites

### 1. Install GitHub CLI

```bash
# Windows (winget)
winget install --id GitHub.cli

# Windows (Chocolatey)
choco install gh

# macOS
brew install gh

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### 2. Authenticate GitHub CLI

```bash
# Login with browser authentication
gh auth login

# Login with token
gh auth login --with-token < token.txt

# Verify authentication
gh auth status

# Required scopes for Projects V2
gh auth refresh -s project,read:project
```

### 3. Install Node.js Dependencies

```bash
npm install @octokit/rest @octokit/graphql dotenv
```

### 4. Environment Variables

Create `.env` file:

```env
# GitHub Personal Access Token (with repo, project scopes)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Organization and Repository
GITHUB_ORG=MASH-Mushroom-Automation
GITHUB_REPO=testy

# Project Number (from URL: /projects/1)
PROJECT_NUMBER=1
```

---

## Project Board Structure

### Column Configuration

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| Title | Text | Issue title with task ID prefix | `[ECOM-001] Task Name` |
| Score | Number | Task complexity/effort score | 1-13 (Fibonacci) |
| Assignees | People | Team members assigned | GitHub usernames |
| Status | Single Select | Current task status | Backlog, Todo, In Progress, Review, Done |
| Labels | Labels | Categorization tags | See Label System |
| Type | Single Select | Task classification | Epic, Feature, Bug, Enhancement, Documentation |
| Timeline | Date Range | Start and end dates | YYYY-MM-DD format |
| Deadline | Date | Due date | YYYY-MM-DD format |
| Repository | Repository | Source repository | Auto-populated |

### Status Workflow

```
Backlog → Todo → In Progress → Review → Done
   ↓        ↓         ↓          ↓       ↓
 (new)   (ready)  (working)  (testing) (complete)
```

---

## Label System

### Label Categories

#### Priority Labels

| Label | Color | Description |
|-------|-------|-------------|
| `priority-critical` | `#B60205` | Blocking issues, immediate attention |
| `priority-high` | `#D93F0B` | Important, complete within sprint |
| `priority-medium` | `#FBCA04` | Normal priority |
| `priority-low` | `#0E8A16` | Nice to have, backlog |

#### Type Labels

| Label | Color | Description |
|-------|-------|-------------|
| `type-epic` | `#3E4B9E` | Parent task with child issues |
| `type-feature` | `#1D76DB` | New functionality |
| `type-bug` | `#D73A4A` | Bug fix |
| `type-enhancement` | `#A2EEEF` | Improvement to existing feature |
| `type-documentation` | `#0075CA` | Documentation updates |
| `type-refactor` | `#7057FF` | Code refactoring |

#### Area Labels

| Label | Color | Description |
|-------|-------|-------------|
| `area-frontend` | `#C5DEF5` | Frontend/UI changes |
| `area-backend` | `#BFD4F2` | Backend/API changes |
| `area-cms` | `#D4C5F9` | CMS/Sanity changes |
| `area-database` | `#FEF2C0` | Database changes |
| `area-devops` | `#F9D0C4` | DevOps/infrastructure |

#### Status Labels

| Label | Color | Description |
|-------|-------|-------------|
| `status-blocked` | `#000000` | Blocked by dependency |
| `status-needs-review` | `#FBCA04` | Ready for code review |
| `status-approved` | `#0E8A16` | Approved and ready |

#### Project Labels

| Label | Color | Description |
|-------|-------|-------------|
| `project-ecommerce` | `#1E392A` | E-Commerce platform |
| `project-iot` | `#6A994E` | IoT device |
| `project-admin` | `#A7C957` | Admin dashboard |
| `project-mobile` | `#BC6C25` | Mobile app |

### Create Labels Script

```bash
#!/bin/bash
# create-labels.sh

REPO="MASH-Mushroom-Automation/testy"

# Priority Labels
gh label create "priority-critical" --color "B60205" --description "Blocking issues, immediate attention" --repo $REPO
gh label create "priority-high" --color "D93F0B" --description "Important, complete within sprint" --repo $REPO
gh label create "priority-medium" --color "FBCA04" --description "Normal priority" --repo $REPO
gh label create "priority-low" --color "0E8A16" --description "Nice to have, backlog" --repo $REPO

# Type Labels
gh label create "type-epic" --color "3E4B9E" --description "Parent task with child issues" --repo $REPO
gh label create "type-feature" --color "1D76DB" --description "New functionality" --repo $REPO
gh label create "type-bug" --color "D73A4A" --description "Bug fix" --repo $REPO
gh label create "type-enhancement" --color "A2EEEF" --description "Improvement to existing feature" --repo $REPO
gh label create "type-documentation" --color "0075CA" --description "Documentation updates" --repo $REPO
gh label create "type-refactor" --color "7057FF" --description "Code refactoring" --repo $REPO

# Area Labels
gh label create "area-frontend" --color "C5DEF5" --description "Frontend/UI changes" --repo $REPO
gh label create "area-backend" --color "BFD4F2" --description "Backend/API changes" --repo $REPO
gh label create "area-cms" --color "D4C5F9" --description "CMS/Sanity changes" --repo $REPO
gh label create "area-database" --color "FEF2C0" --description "Database changes" --repo $REPO
gh label create "area-devops" --color "F9D0C4" --description "DevOps/infrastructure" --repo $REPO

# Status Labels
gh label create "status-blocked" --color "000000" --description "Blocked by dependency" --repo $REPO
gh label create "status-needs-review" --color "FBCA04" --description "Ready for code review" --repo $REPO
gh label create "status-approved" --color "0E8A16" --description "Approved and ready" --repo $REPO

# Project Labels
gh label create "project-ecommerce" --color "1E392A" --description "E-Commerce platform" --repo $REPO
gh label create "project-iot" --color "6A994E" --description "IoT device" --repo $REPO
gh label create "project-admin" --color "A7C957" --description "Admin dashboard" --repo $REPO
gh label create "project-mobile" --color "BC6C25" --description "Mobile app" --repo $REPO

echo "Labels created successfully!"
```

---

## Scoring System

### Fibonacci Scoring (Story Points)

| Score | Complexity | Time Estimate | Example |
|-------|------------|---------------|---------|
| 1 | Trivial | < 1 hour | Fix typo, update text |
| 2 | Simple | 1-2 hours | Add label, simple UI fix |
| 3 | Easy | 2-4 hours | Add component, simple feature |
| 5 | Medium | 4-8 hours | New page, API integration |
| 8 | Complex | 1-2 days | Complex feature, multi-file changes |
| 13 | Very Complex | 2-3 days | Major feature, architectural changes |
| 21 | Epic-level | 3-5 days | Should be broken into smaller tasks |

### Scoring Guidelines

1. **Consider uncertainty** - Higher score for unknowns
2. **Include testing time** - Account for QA and fixes
3. **Documentation** - Include docs in estimate
4. **Code review** - Factor in review cycles

### Team Velocity Calculation

```
Sprint Velocity = Sum of completed story points per sprint
Team Capacity = Number of developers × Available hours × Productivity factor (0.6-0.8)
Sprint Planning = Fill sprint with tasks totaling ~80% of average velocity
```

---

## GitHub CLI Commands Reference

### Issue Management

#### Create Issue

```bash
# Basic issue creation
gh issue create --repo MASH-Mushroom-Automation/testy \
  --title "[TEST-001] Sample Task" \
  --body "Task description here" \
  --assignee "PP-Namias" \
  --label "type-feature,priority-medium,area-frontend"

# Create with milestone
gh issue create --repo MASH-Mushroom-Automation/testy \
  --title "[TEST-002] Another Task" \
  --body "Description" \
  --milestone "Sprint 1"

# Create from file
gh issue create --repo MASH-Mushroom-Automation/testy \
  --title "[TEST-003] Task from File" \
  --body-file issue-template.md
```

#### Edit Issue

```bash
# Edit title
gh issue edit 1 --repo MASH-Mushroom-Automation/testy \
  --title "[TEST-001] Updated Title"

# Add labels
gh issue edit 1 --repo MASH-Mushroom-Automation/testy \
  --add-label "status-needs-review"

# Remove labels
gh issue edit 1 --repo MASH-Mushroom-Automation/testy \
  --remove-label "priority-low"

# Change assignee
gh issue edit 1 --repo MASH-Mushroom-Automation/testy \
  --add-assignee "PP-Namias"

# Update body
gh issue edit 1 --repo MASH-Mushroom-Automation/testy \
  --body "Updated description"
```

#### Delete Issue

```bash
# Close issue (soft delete)
gh issue close 1 --repo MASH-Mushroom-Automation/testy

# Close with comment
gh issue close 1 --repo MASH-Mushroom-Automation/testy \
  --comment "Closing: duplicate of #2"

# Reopen issue
gh issue reopen 1 --repo MASH-Mushroom-Automation/testy

# Delete issue (requires API - no CLI command)
# Use GraphQL API or web interface
```

#### List Issues

```bash
# List all open issues
gh issue list --repo MASH-Mushroom-Automation/testy

# List with filters
gh issue list --repo MASH-Mushroom-Automation/testy \
  --state all \
  --label "type-feature" \
  --assignee "PP-Namias" \
  --limit 50

# JSON output for scripting
gh issue list --repo MASH-Mushroom-Automation/testy \
  --json number,title,state,labels,assignees
```

#### View Issue

```bash
# View issue details
gh issue view 1 --repo MASH-Mushroom-Automation/testy

# JSON output
gh issue view 1 --repo MASH-Mushroom-Automation/testy --json title,body,labels
```

### Project Management

#### List Projects

```bash
# List organization projects
gh project list --owner MASH-Mushroom-Automation

# Get project details
gh project view 1 --owner MASH-Mushroom-Automation
```

#### Add Issue to Project

```bash
# Add issue to project (requires project item-add)
gh project item-add 1 --owner MASH-Mushroom-Automation \
  --url https://github.com/MASH-Mushroom-Automation/testy/issues/1
```

#### Update Project Item (GraphQL Required)

Project field updates require GraphQL API - see Automation Scripts section.

---

## Automation Scripts

### Directory Structure

```
scripts/
├── github/
│   ├── config.js              # Configuration
│   ├── github-client.js       # API client wrapper
│   ├── create-labels.js       # Label management
│   ├── create-issues.js       # Issue creation
│   ├── update-issues.js       # Issue updates
│   ├── delete-issues.js       # Issue deletion
│   ├── project-manager.js     # Project board management
│   ├── bulk-operations.js     # Batch operations
│   ├── task-distribution.js   # Auto-assign tasks
│   └── reports.js             # Generate reports
├── data/
│   ├── labels.json            # Label definitions
│   ├── tasks.json             # Task definitions
│   └── team.json              # Team member definitions
└── templates/
    ├── epic.md                # Epic template
    ├── feature.md             # Feature template
    ├── bug.md                 # Bug template
    └── task.md                # Generic task template
```

### Configuration File

```javascript
// scripts/github/config.js
require('dotenv').config();

module.exports = {
  // GitHub Configuration
  github: {
    token: process.env.GITHUB_TOKEN,
    org: process.env.GITHUB_ORG || 'MASH-Mushroom-Automation',
    repo: process.env.GITHUB_REPO || 'testy',
    projectNumber: parseInt(process.env.PROJECT_NUMBER) || 1,
  },

  // Team Members
  team: {
    'PP-Namias': {
      name: 'Kenneth',
      role: 'Lead Developer',
      areas: ['frontend', 'cms', 'backend'],
      maxPoints: 21, // per sprint
    },
    // Add more team members
  },

  // Label Definitions
  labels: {
    priority: ['priority-critical', 'priority-high', 'priority-medium', 'priority-low'],
    type: ['type-epic', 'type-feature', 'type-bug', 'type-enhancement', 'type-documentation'],
    area: ['area-frontend', 'area-backend', 'area-cms', 'area-database', 'area-devops'],
    status: ['status-blocked', 'status-needs-review', 'status-approved'],
    project: ['project-ecommerce', 'project-iot', 'project-admin', 'project-mobile'],
  },

  // Scoring
  scoring: {
    fibonacci: [1, 2, 3, 5, 8, 13, 21],
    default: 3,
  },

  // Project Fields (from GraphQL query)
  projectFields: {
    status: null, // Will be populated by getProjectFields()
    score: null,
    timeline: null,
    deadline: null,
    type: null,
  },
};
```

### GitHub Client Wrapper

```javascript
// scripts/github/github-client.js
const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');
const config = require('./config');

class GitHubClient {
  constructor() {
    this.octokit = new Octokit({ auth: config.github.token });
    this.graphqlWithAuth = graphql.defaults({
      headers: { authorization: `token ${config.github.token}` },
    });
    this.org = config.github.org;
    this.repo = config.github.repo;
    this.projectNumber = config.github.projectNumber;
    this.projectId = null;
    this.projectFields = {};
  }

  // Initialize project data
  async init() {
    await this.getProjectId();
    await this.getProjectFields();
    return this;
  }

  // Get Project ID using GraphQL
  async getProjectId() {
    const query = `
      query($org: String!, $number: Int!) {
        organization(login: $org) {
          projectV2(number: $number) {
            id
            title
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query, {
      org: this.org,
      number: this.projectNumber,
    });

    this.projectId = result.organization.projectV2.id;
    console.log(`Project ID: ${this.projectId}`);
    return this.projectId;
  }

  // Get Project Fields
  async getProjectFields() {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
                ... on ProjectV2IterationField {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query, {
      projectId: this.projectId,
    });

    result.node.fields.nodes.forEach((field) => {
      this.projectFields[field.name.toLowerCase()] = field;
    });

    console.log('Project fields loaded:', Object.keys(this.projectFields));
    return this.projectFields;
  }

  // ==================== ISSUE OPERATIONS ====================

  // Create Issue
  async createIssue({ title, body, labels = [], assignees = [], milestone = null }) {
    const { data } = await this.octokit.issues.create({
      owner: this.org,
      repo: this.repo,
      title,
      body,
      labels,
      assignees,
      milestone,
    });

    console.log(`Created issue #${data.number}: ${data.title}`);
    return data;
  }

  // Update Issue
  async updateIssue(issueNumber, updates) {
    const { data } = await this.octokit.issues.update({
      owner: this.org,
      repo: this.repo,
      issue_number: issueNumber,
      ...updates,
    });

    console.log(`Updated issue #${data.number}`);
    return data;
  }

  // Close Issue
  async closeIssue(issueNumber, comment = null) {
    if (comment) {
      await this.addComment(issueNumber, comment);
    }

    const { data } = await this.octokit.issues.update({
      owner: this.org,
      repo: this.repo,
      issue_number: issueNumber,
      state: 'closed',
    });

    console.log(`Closed issue #${data.number}`);
    return data;
  }

  // Delete Issue (GraphQL)
  async deleteIssue(issueNumber) {
    // First get the node ID
    const { data } = await this.octokit.issues.get({
      owner: this.org,
      repo: this.repo,
      issue_number: issueNumber,
    });

    const mutation = `
      mutation($issueId: ID!) {
        deleteIssue(input: { issueId: $issueId }) {
          repository {
            name
          }
        }
      }
    `;

    await this.graphqlWithAuth(mutation, {
      issueId: data.node_id,
    });

    console.log(`Deleted issue #${issueNumber}`);
  }

  // List Issues
  async listIssues(options = {}) {
    const { data } = await this.octokit.issues.listForRepo({
      owner: this.org,
      repo: this.repo,
      state: options.state || 'open',
      labels: options.labels || undefined,
      assignee: options.assignee || undefined,
      per_page: options.limit || 100,
    });

    return data;
  }

  // Add Comment
  async addComment(issueNumber, body) {
    const { data } = await this.octokit.issues.createComment({
      owner: this.org,
      repo: this.repo,
      issue_number: issueNumber,
      body,
    });

    return data;
  }

  // ==================== LABEL OPERATIONS ====================

  // Create Label
  async createLabel({ name, color, description }) {
    try {
      const { data } = await this.octokit.issues.createLabel({
        owner: this.org,
        repo: this.repo,
        name,
        color: color.replace('#', ''),
        description,
      });

      console.log(`Created label: ${data.name}`);
      return data;
    } catch (error) {
      if (error.status === 422) {
        console.log(`Label already exists: ${name}`);
        return null;
      }
      throw error;
    }
  }

  // Update Label
  async updateLabel(name, updates) {
    const { data } = await this.octokit.issues.updateLabel({
      owner: this.org,
      repo: this.repo,
      name,
      ...updates,
    });

    console.log(`Updated label: ${data.name}`);
    return data;
  }

  // Delete Label
  async deleteLabel(name) {
    await this.octokit.issues.deleteLabel({
      owner: this.org,
      repo: this.repo,
      name,
    });

    console.log(`Deleted label: ${name}`);
  }

  // List Labels
  async listLabels() {
    const { data } = await this.octokit.issues.listLabelsForRepo({
      owner: this.org,
      repo: this.repo,
      per_page: 100,
    });

    return data;
  }

  // ==================== PROJECT OPERATIONS ====================

  // Add Issue to Project
  async addToProject(issueNodeId) {
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(mutation, {
      projectId: this.projectId,
      contentId: issueNodeId,
    });

    console.log(`Added to project, item ID: ${result.addProjectV2ItemById.item.id}`);
    return result.addProjectV2ItemById.item.id;
  }

  // Update Project Item Field
  async updateProjectField(itemId, fieldId, value) {
    const mutation = `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: $value
        }) {
          projectV2Item {
            id
          }
        }
      }
    `;

    await this.graphqlWithAuth(mutation, {
      projectId: this.projectId,
      itemId,
      fieldId,
      value,
    });

    console.log(`Updated field ${fieldId} for item ${itemId}`);
  }

  // Set Status
  async setStatus(itemId, statusName) {
    const statusField = this.projectFields['status'];
    if (!statusField) {
      console.error('Status field not found');
      return;
    }

    const option = statusField.options.find(
      (o) => o.name.toLowerCase() === statusName.toLowerCase()
    );

    if (!option) {
      console.error(`Status option not found: ${statusName}`);
      return;
    }

    await this.updateProjectField(itemId, statusField.id, {
      singleSelectOptionId: option.id,
    });
  }

  // Set Score
  async setScore(itemId, score) {
    const scoreField = this.projectFields['score'];
    if (!scoreField) {
      console.error('Score field not found');
      return;
    }

    await this.updateProjectField(itemId, scoreField.id, {
      number: score,
    });
  }

  // Set Deadline
  async setDeadline(itemId, date) {
    const deadlineField = this.projectFields['deadline'];
    if (!deadlineField) {
      console.error('Deadline field not found');
      return;
    }

    await this.updateProjectField(itemId, deadlineField.id, {
      date: date, // Format: YYYY-MM-DD
    });
  }

  // Get Project Items
  async getProjectItems(limit = 100) {
    const query = `
      query($projectId: ID!, $first: Int!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: $first) {
              nodes {
                id
                content {
                  ... on Issue {
                    number
                    title
                    state
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field { ... on ProjectV2Field { name } }
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      number
                      field { ... on ProjectV2Field { name } }
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field { ... on ProjectV2SingleSelectField { name } }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field { ... on ProjectV2Field { name } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query, {
      projectId: this.projectId,
      first: limit,
    });

    return result.node.items.nodes;
  }
}

module.exports = GitHubClient;
```

### Create Issues Script

```javascript
// scripts/github/create-issues.js
const GitHubClient = require('./github-client');

const tasks = [
  {
    id: 'TEST-001',
    title: 'Sample Epic Task',
    type: 'epic',
    priority: 'high',
    area: 'frontend',
    score: 13,
    assignee: 'PP-Namias',
    deadline: '2025-12-15',
    description: `
## Description
This is a sample epic task for testing the automation system.

## Objectives
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Dependencies
- None

## Notes
This is a test task created by automation.
    `.trim(),
  },
  {
    id: 'TEST-002',
    title: 'Sample Feature Task',
    type: 'feature',
    priority: 'medium',
    area: 'backend',
    score: 5,
    assignee: 'PP-Namias',
    deadline: '2025-12-10',
    parent: 'TEST-001',
    description: `
## Description
This is a sample feature task.

## Implementation Details
1. Step 1
2. Step 2
3. Step 3

## Testing Requirements
- Unit tests
- Integration tests

## Related Issues
- Parent: #TEST-001
    `.trim(),
  },
  {
    id: 'TEST-003',
    title: 'Sample Bug Fix',
    type: 'bug',
    priority: 'critical',
    area: 'cms',
    score: 3,
    assignee: 'PP-Namias',
    deadline: '2025-12-05',
    description: `
## Bug Description
Description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: Chrome
- OS: Windows 11
- Version: 1.0.0
    `.trim(),
  },
];

async function createAllTasks() {
  const client = new GitHubClient();
  await client.init();

  const createdIssues = [];

  for (const task of tasks) {
    try {
      // Build labels array
      const labels = [
        `type-${task.type}`,
        `priority-${task.priority}`,
        `area-${task.area}`,
        'project-ecommerce',
      ];

      // Create issue
      const issue = await client.createIssue({
        title: `[${task.id}] ${task.title}`,
        body: task.description,
        labels,
        assignees: [task.assignee],
      });

      // Add to project
      const itemId = await client.addToProject(issue.node_id);

      // Set project fields
      await client.setStatus(itemId, 'Backlog');
      await client.setScore(itemId, task.score);
      
      if (task.deadline) {
        await client.setDeadline(itemId, task.deadline);
      }

      createdIssues.push({
        number: issue.number,
        title: issue.title,
        itemId,
      });

      console.log(`✓ Created and configured: #${issue.number} ${task.id}`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`✗ Failed to create ${task.id}:`, error.message);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Created ${createdIssues.length} of ${tasks.length} issues`);
  
  return createdIssues;
}

// Run if called directly
if (require.main === module) {
  createAllTasks()
    .then(() => console.log('\nDone!'))
    .catch(console.error);
}

module.exports = { createAllTasks, tasks };
```

### Bulk Update Script

```javascript
// scripts/github/bulk-operations.js
const GitHubClient = require('./github-client');

class BulkOperations {
  constructor() {
    this.client = null;
  }

  async init() {
    this.client = new GitHubClient();
    await this.client.init();
    return this;
  }

  // Bulk add labels to issues
  async addLabelsToIssues(issueNumbers, labels) {
    const results = [];

    for (const num of issueNumbers) {
      try {
        const issue = await this.client.updateIssue(num, {
          labels: labels,
        });
        results.push({ number: num, success: true });
        console.log(`✓ Added labels to #${num}`);
      } catch (error) {
        results.push({ number: num, success: false, error: error.message });
        console.error(`✗ Failed #${num}:`, error.message);
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    return results;
  }

  // Bulk assign issues to user
  async assignIssuesToUser(issueNumbers, username) {
    const results = [];

    for (const num of issueNumbers) {
      try {
        await this.client.updateIssue(num, {
          assignees: [username],
        });
        results.push({ number: num, success: true });
        console.log(`✓ Assigned #${num} to ${username}`);
      } catch (error) {
        results.push({ number: num, success: false, error: error.message });
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    return results;
  }

  // Bulk close issues
  async closeIssues(issueNumbers, reason = 'Closed by automation') {
    const results = [];

    for (const num of issueNumbers) {
      try {
        await this.client.closeIssue(num, reason);
        results.push({ number: num, success: true });
        console.log(`✓ Closed #${num}`);
      } catch (error) {
        results.push({ number: num, success: false, error: error.message });
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    return results;
  }

  // Bulk update project status
  async updateProjectStatus(issueNumbers, status) {
    const items = await this.client.getProjectItems();
    const results = [];

    for (const num of issueNumbers) {
      const item = items.find((i) => i.content?.number === num);
      if (!item) {
        results.push({ number: num, success: false, error: 'Not in project' });
        continue;
      }

      try {
        await this.client.setStatus(item.id, status);
        results.push({ number: num, success: true });
        console.log(`✓ Set #${num} status to ${status}`);
      } catch (error) {
        results.push({ number: num, success: false, error: error.message });
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    return results;
  }

  // Bulk update scores
  async updateScores(issueScores) {
    const items = await this.client.getProjectItems();
    const results = [];

    for (const { number, score } of issueScores) {
      const item = items.find((i) => i.content?.number === number);
      if (!item) {
        results.push({ number, success: false, error: 'Not in project' });
        continue;
      }

      try {
        await this.client.setScore(item.id, score);
        results.push({ number, success: true });
        console.log(`✓ Set #${number} score to ${score}`);
      } catch (error) {
        results.push({ number, success: false, error: error.message });
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    return results;
  }
}

// Example usage
async function main() {
  const bulk = new BulkOperations();
  await bulk.init();

  // Example: Assign issues 1-5 to PP-Namias
  // await bulk.assignIssuesToUser([1, 2, 3, 4, 5], 'PP-Namias');

  // Example: Add labels to issues
  // await bulk.addLabelsToIssues([1, 2, 3], ['priority-high', 'type-feature']);

  // Example: Update status
  // await bulk.updateProjectStatus([1, 2, 3], 'In Progress');

  // Example: Update scores
  // await bulk.updateScores([
  //   { number: 1, score: 5 },
  //   { number: 2, score: 8 },
  //   { number: 3, score: 3 },
  // ]);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BulkOperations;
```

### Task Distribution Script

```javascript
// scripts/github/task-distribution.js
const GitHubClient = require('./github-client');
const config = require('./config');

class TaskDistributor {
  constructor() {
    this.client = null;
    this.teamWorkload = {};
  }

  async init() {
    this.client = new GitHubClient();
    await this.client.init();
    
    // Initialize workload tracking
    for (const member of Object.keys(config.team)) {
      this.teamWorkload[member] = {
        assigned: 0,
        points: 0,
        issues: [],
      };
    }

    return this;
  }

  // Calculate current workload
  async calculateWorkload() {
    const issues = await this.client.listIssues({ state: 'open' });
    const items = await this.client.getProjectItems();

    for (const issue of issues) {
      if (!issue.assignees || issue.assignees.length === 0) continue;

      const item = items.find((i) => i.content?.number === issue.number);
      const score = this.getScoreFromItem(item) || config.scoring.default;

      for (const assignee of issue.assignees) {
        if (this.teamWorkload[assignee.login]) {
          this.teamWorkload[assignee.login].assigned++;
          this.teamWorkload[assignee.login].points += score;
          this.teamWorkload[assignee.login].issues.push(issue.number);
        }
      }
    }

    return this.teamWorkload;
  }

  getScoreFromItem(item) {
    if (!item || !item.fieldValues) return null;
    
    const scoreField = item.fieldValues.nodes.find(
      (f) => f.field?.name?.toLowerCase() === 'score'
    );
    
    return scoreField?.number || null;
  }

  // Find best assignee for a task
  findBestAssignee(taskArea, taskScore) {
    let bestMember = null;
    let lowestWorkload = Infinity;

    for (const [member, info] of Object.entries(config.team)) {
      // Check if member handles this area
      if (!info.areas.includes(taskArea)) continue;

      // Check if member has capacity
      const currentPoints = this.teamWorkload[member]?.points || 0;
      const remainingCapacity = info.maxPoints - currentPoints;

      if (remainingCapacity >= taskScore && currentPoints < lowestWorkload) {
        lowestWorkload = currentPoints;
        bestMember = member;
      }
    }

    return bestMember;
  }

  // Auto-assign unassigned issues
  async autoAssignIssues() {
    await this.calculateWorkload();

    const issues = await this.client.listIssues({ state: 'open' });
    const items = await this.client.getProjectItems();
    const results = [];

    for (const issue of issues) {
      // Skip if already assigned
      if (issue.assignees && issue.assignees.length > 0) continue;

      // Determine area from labels
      const areaLabel = issue.labels.find((l) => l.name.startsWith('area-'));
      const area = areaLabel ? areaLabel.name.replace('area-', '') : 'frontend';

      // Get score from project
      const item = items.find((i) => i.content?.number === issue.number);
      const score = this.getScoreFromItem(item) || config.scoring.default;

      // Find best assignee
      const assignee = this.findBestAssignee(area, score);

      if (assignee) {
        await this.client.updateIssue(issue.number, {
          assignees: [assignee],
        });

        // Update workload tracking
        this.teamWorkload[assignee].assigned++;
        this.teamWorkload[assignee].points += score;
        this.teamWorkload[assignee].issues.push(issue.number);

        results.push({
          issue: issue.number,
          assignee,
          area,
          score,
        });

        console.log(`✓ Assigned #${issue.number} to ${assignee} (${area}, ${score} pts)`);
      } else {
        console.log(`✗ No available assignee for #${issue.number}`);
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    return results;
  }

  // Generate workload report
  generateReport() {
    console.log('\n=== Team Workload Report ===\n');

    for (const [member, workload] of Object.entries(this.teamWorkload)) {
      const info = config.team[member];
      const utilization = ((workload.points / info.maxPoints) * 100).toFixed(1);

      console.log(`${member} (${info.role})`);
      console.log(`  Assigned Issues: ${workload.assigned}`);
      console.log(`  Story Points: ${workload.points}/${info.maxPoints} (${utilization}%)`);
      console.log(`  Issues: ${workload.issues.join(', ') || 'None'}`);
      console.log('');
    }
  }
}

async function main() {
  const distributor = new TaskDistributor();
  await distributor.init();
  
  await distributor.calculateWorkload();
  distributor.generateReport();
  
  // Uncomment to auto-assign
  // await distributor.autoAssignIssues();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TaskDistributor;
```

### Reports Generator

```javascript
// scripts/github/reports.js
const GitHubClient = require('./github-client');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.client = null;
  }

  async init() {
    this.client = new GitHubClient();
    await this.client.init();
    return this;
  }

  // Generate Sprint Report
  async generateSprintReport() {
    const issues = await this.client.listIssues({ state: 'all' });
    const items = await this.client.getProjectItems();

    const report = {
      generated: new Date().toISOString(),
      summary: {
        total: issues.length,
        open: issues.filter((i) => i.state === 'open').length,
        closed: issues.filter((i) => i.state === 'closed').length,
        totalPoints: 0,
        completedPoints: 0,
      },
      byStatus: {},
      byAssignee: {},
      byType: {},
      byPriority: {},
      issues: [],
    };

    for (const issue of issues) {
      const item = items.find((i) => i.content?.number === issue.number);
      const score = this.getFieldValue(item, 'score') || 0;
      const status = this.getFieldValue(item, 'status') || 'Unknown';

      report.summary.totalPoints += score;
      if (issue.state === 'closed') {
        report.summary.completedPoints += score;
      }

      // Count by status
      report.byStatus[status] = (report.byStatus[status] || 0) + 1;

      // Count by assignee
      for (const assignee of issue.assignees || []) {
        if (!report.byAssignee[assignee.login]) {
          report.byAssignee[assignee.login] = { count: 0, points: 0 };
        }
        report.byAssignee[assignee.login].count++;
        report.byAssignee[assignee.login].points += score;
      }

      // Count by type
      const typeLabel = issue.labels.find((l) => l.name.startsWith('type-'));
      const type = typeLabel ? typeLabel.name : 'untyped';
      report.byType[type] = (report.byType[type] || 0) + 1;

      // Count by priority
      const priorityLabel = issue.labels.find((l) => l.name.startsWith('priority-'));
      const priority = priorityLabel ? priorityLabel.name : 'unset';
      report.byPriority[priority] = (report.byPriority[priority] || 0) + 1;

      report.issues.push({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        status,
        score,
        assignees: issue.assignees?.map((a) => a.login) || [],
        labels: issue.labels.map((l) => l.name),
      });
    }

    return report;
  }

  getFieldValue(item, fieldName) {
    if (!item || !item.fieldValues) return null;

    const field = item.fieldValues.nodes.find(
      (f) => f.field?.name?.toLowerCase() === fieldName.toLowerCase()
    );

    return field?.number || field?.name || field?.text || field?.date || null;
  }

  // Print report to console
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('SPRINT REPORT');
    console.log('Generated:', report.generated);
    console.log('='.repeat(60));

    console.log('\n--- Summary ---');
    console.log(`Total Issues: ${report.summary.total}`);
    console.log(`Open: ${report.summary.open} | Closed: ${report.summary.closed}`);
    console.log(`Story Points: ${report.summary.completedPoints}/${report.summary.totalPoints} completed`);
    console.log(`Velocity: ${((report.summary.completedPoints / report.summary.totalPoints) * 100).toFixed(1)}%`);

    console.log('\n--- By Status ---');
    for (const [status, count] of Object.entries(report.byStatus)) {
      console.log(`  ${status}: ${count}`);
    }

    console.log('\n--- By Assignee ---');
    for (const [assignee, data] of Object.entries(report.byAssignee)) {
      console.log(`  ${assignee}: ${data.count} issues, ${data.points} points`);
    }

    console.log('\n--- By Type ---');
    for (const [type, count] of Object.entries(report.byType)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('\n--- By Priority ---');
    for (const [priority, count] of Object.entries(report.byPriority)) {
      console.log(`  ${priority}: ${count}`);
    }

    console.log('\n' + '='.repeat(60));
  }

  // Save report to file
  saveReport(report, filename) {
    const outputPath = path.join(__dirname, '..', 'reports', filename);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${outputPath}`);
  }

  // Generate Markdown report
  generateMarkdownReport(report) {
    const md = `
# Sprint Report

**Generated:** ${report.generated}

## Summary

| Metric | Value |
|--------|-------|
| Total Issues | ${report.summary.total} |
| Open | ${report.summary.open} |
| Closed | ${report.summary.closed} |
| Total Points | ${report.summary.totalPoints} |
| Completed Points | ${report.summary.completedPoints} |
| Velocity | ${((report.summary.completedPoints / report.summary.totalPoints) * 100).toFixed(1)}% |

## By Status

| Status | Count |
|--------|-------|
${Object.entries(report.byStatus).map(([s, c]) => `| ${s} | ${c} |`).join('\n')}

## By Assignee

| Assignee | Issues | Points |
|----------|--------|--------|
${Object.entries(report.byAssignee).map(([a, d]) => `| ${a} | ${d.count} | ${d.points} |`).join('\n')}

## By Type

| Type | Count |
|------|-------|
${Object.entries(report.byType).map(([t, c]) => `| ${t} | ${c} |`).join('\n')}

## By Priority

| Priority | Count |
|----------|-------|
${Object.entries(report.byPriority).map(([p, c]) => `| ${p} | ${c} |`).join('\n')}

## All Issues

| # | Title | Status | Score | Assignees |
|---|-------|--------|-------|-----------|
${report.issues.map((i) => `| ${i.number} | ${i.title} | ${i.status} | ${i.score} | ${i.assignees.join(', ')} |`).join('\n')}
    `.trim();

    return md;
  }
}

async function main() {
  const generator = new ReportGenerator();
  await generator.init();

  const report = await generator.generateSprintReport();
  generator.printReport(report);

  // Save JSON report
  const timestamp = new Date().toISOString().split('T')[0];
  generator.saveReport(report, `sprint-report-${timestamp}.json`);

  // Save Markdown report
  const md = generator.generateMarkdownReport(report);
  const mdPath = path.join(__dirname, '..', 'reports', `sprint-report-${timestamp}.md`);
  fs.writeFileSync(mdPath, md);
  console.log(`Markdown report saved to: ${mdPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ReportGenerator;
```

---

## API Reference

### REST API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List Issues | GET | `/repos/{owner}/{repo}/issues` |
| Create Issue | POST | `/repos/{owner}/{repo}/issues` |
| Get Issue | GET | `/repos/{owner}/{repo}/issues/{issue_number}` |
| Update Issue | PATCH | `/repos/{owner}/{repo}/issues/{issue_number}` |
| List Labels | GET | `/repos/{owner}/{repo}/labels` |
| Create Label | POST | `/repos/{owner}/{repo}/labels` |

### GraphQL Queries

#### Get Project ID

```graphql
query($org: String!, $number: Int!) {
  organization(login: $org) {
    projectV2(number: $number) {
      id
      title
    }
  }
}
```

#### Add Item to Project

```graphql
mutation($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: {
    projectId: $projectId
    contentId: $contentId
  }) {
    item { id }
  }
}
```

#### Update Field Value

```graphql
mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId
    itemId: $itemId
    fieldId: $fieldId
    value: $value
  }) {
    projectV2Item { id }
  }
}
```

---

## Best Practices

### 1. Rate Limiting

- Add delays between API calls (300-500ms)
- Use pagination for large datasets
- Implement exponential backoff for retries

### 2. Error Handling

- Always wrap API calls in try-catch
- Log errors with context
- Implement graceful degradation

### 3. Idempotency

- Check for existing resources before creating
- Use unique identifiers (task IDs)
- Implement update-or-create patterns

### 4. Security

- Never commit tokens to repository
- Use environment variables
- Rotate tokens periodically
- Use minimal required scopes

### 5. Automation

- Schedule scripts with cron/Task Scheduler
- Use GitHub Actions for CI/CD integration
- Implement webhooks for real-time updates

---

## Quick Start Commands

```bash
# Navigate to scripts directory
cd scripts/github

# Install dependencies
npm install @octokit/rest @octokit/graphql dotenv

# Create labels
node create-labels.js

# Create test issues
node create-issues.js

# Run bulk operations
node bulk-operations.js

# Auto-assign tasks
node task-distribution.js

# Generate reports
node reports.js
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token and scopes |
| 403 Forbidden | Check rate limits or permissions |
| 404 Not Found | Verify repo/project exists |
| 422 Validation Failed | Check request body format |
| GraphQL errors | Verify project field IDs |

---

## References

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [Projects V2 API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project)
- [Octokit.js](https://github.com/octokit/octokit.js)
