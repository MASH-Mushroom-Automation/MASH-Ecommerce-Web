#!/usr/bin/env node
/**
 * AI Chatbot Auto-Progress Script
 * 
 * Automated testing and phase progression system:
 * 1. Reads current phase from master plan
 * 2. Runs unit tests for that phase
 * 3. If 100% pass → Update doc → Commit → Next phase
 * 4. If fail → Stop and report errors
 * 5. Loop until all phases complete
 * 
 * Usage:
 *   node scripts/chatbot-auto-progress.js
 *   npm run chatbot:auto-progress
 * 
 * Environment:
 *   AUTO_COMMIT=true   # Enable auto-commits (default: false)
 *   DRY_RUN=true       # Show what would happen without executing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MASTER_PLAN_PATH = path.join(__dirname, '../.github/AI_CHATBOT_MASTER_PLAN.md');
const AUTO_COMMIT = process.env.AUTO_COMMIT === 'true';
const DRY_RUN = process.env.DRY_RUN === 'true';
const BRANCH_NAME = 'feature/ai-chatbot';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Phase definitions
const PHASES = [
  { id: 1, name: 'Foundation', testPattern: 'phase-1', expectedTests: 6 },
  { id: 2, name: 'Gemini Integration', testPattern: 'phase-2', expectedTests: 12 },
  { id: 3, name: 'RAG System', testPattern: 'phase-3', expectedTests: 15 },
  { id: 4, name: 'UI Components', testPattern: 'phase-4', expectedTests: 20 },
  { id: 5, name: 'Advanced Features', testPattern: 'phase-5', expectedTests: 12 },
  { id: 6, name: 'Production Polish', testPattern: 'phase-6', expectedTests: 15 },
];

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  if (DRY_RUN) {
    log(`[DRY RUN] Would execute: ${command}`, 'yellow');
    return '';
  }
  try {
    return execSync(command, { encoding: 'utf-8', ...options });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function readMasterPlan() {
  if (!fs.existsSync(MASTER_PLAN_PATH)) {
    throw new Error(`Master plan not found: ${MASTER_PLAN_PATH}`);
  }
  return fs.readFileSync(MASTER_PLAN_PATH, 'utf-8');
}

function writeMasterPlan(content) {
  if (DRY_RUN) {
    log('[DRY RUN] Would update master plan', 'yellow');
    return;
  }
  fs.writeFileSync(MASTER_PLAN_PATH, content, 'utf-8');
}

function getCurrentPhase(planContent) {
  const progressTable = planContent.match(/\| Phase \d+.*?\|\s*🟡 In Progress/);
  if (!progressTable) {
    // Check if all phases are complete
    const allComplete = planContent.match(/\| Phase 6.*?\|\s*✅ Complete/);
    if (allComplete) {
      return null; // All phases done
    }
    return 1; // Default to phase 1
  }
  
  const phaseMatch = progressTable[0].match(/Phase (\d+)/);
  return phaseMatch ? parseInt(phaseMatch[1]) : 1;
}

function runPhaseTests(phase) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Running tests for Phase ${phase.id}: ${phase.name}`, 'bright');
  log('='.repeat(60), 'cyan');
  
  try {
    const result = exec(
      `npm run test:chatbot -- --testNamePattern="${phase.testPattern}" --passWithNoTests`,
      { stdio: 'inherit' }
    );
    
    // Parse test results
    const passMatch = result.match(/(\d+) passed/);
    const failMatch = result.match(/(\d+) failed/);
    const totalPassed = passMatch ? parseInt(passMatch[1]) : 0;
    const totalFailed = failMatch ? parseInt(failMatch[1]) : 0;
    
    return {
      passed: totalPassed,
      failed: totalFailed,
      total: totalPassed + totalFailed,
      success: totalFailed === 0 && totalPassed === phase.expectedTests,
    };
  } catch (error) {
    return {
      passed: 0,
      failed: phase.expectedTests,
      total: phase.expectedTests,
      success: false,
      error: error.message,
    };
  }
}

function updateProgressTable(planContent, phaseId, status, testsPassed = 0) {
  const emoji = status === 'complete' ? '✅ Complete' : 
                status === 'in-progress' ? '🟡 In Progress' : 
                '⚪ Not Started';
  
  const passRate = testsPassed > 0 ? '100%' : '0%';
  const date = status === 'complete' ? new Date().toISOString().split('T')[0] : '-';
  
  // Update current phase row
  const phaseRegex = new RegExp(
    `(\\| Phase ${phaseId}:[^|]+\\|)\\s*[^|]+\\|\\s*[^|]+\\|\\s*[^|]+\\|`
  );
  
  planContent = planContent.replace(
    phaseRegex,
    `$1 ${emoji} | ${passRate} | ${date} |`
  );
  
  // If completing this phase, mark next phase as in-progress
  if (status === 'complete' && phaseId < 6) {
    const nextPhaseRegex = new RegExp(
      `(\\| Phase ${phaseId + 1}:[^|]+\\|)\\s*⚪ Not Started`
    );
    planContent = planContent.replace(nextPhaseRegex, '$1 🟡 In Progress');
  }
  
  return planContent;
}

function gitCommit(message) {
  if (!AUTO_COMMIT) {
    log('\n⚠️  Auto-commit disabled. Run with AUTO_COMMIT=true to enable.', 'yellow');
    log(`Commit message would be: ${message}`, 'cyan');
    return;
  }
  
  try {
    // Check if on correct branch
    const currentBranch = exec('git branch --show-current').trim();
    if (currentBranch !== BRANCH_NAME) {
      log(`⚠️  Not on ${BRANCH_NAME} branch. Creating/switching...`, 'yellow');
      exec(`git checkout -b ${BRANCH_NAME}`);
    }
    
    // Stage and commit
    exec('git add .github/AI_CHATBOT_MASTER_PLAN.md');
    exec('git add src/**/*');
    exec(`git commit -m "${message}"`);
    
    log(`✅ Committed: ${message}`, 'green');
  } catch (error) {
    log(`❌ Git commit failed: ${error.message}`, 'red');
  }
}

function buildTypeScript() {
  log('\n🔨 Running TypeScript build...', 'cyan');
  try {
    exec('npm run build', { stdio: 'inherit' });
    log('✅ TypeScript build succeeded', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript build failed', 'red');
    return false;
  }
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🤖 AI CHATBOT AUTO-PROGRESS SYSTEM', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  if (DRY_RUN) {
    log('🔍 DRY RUN MODE - No changes will be made\n', 'yellow');
  }
  
  // Read master plan
  let planContent = readMasterPlan();
  const currentPhaseId = getCurrentPhase(planContent);
  
  if (!currentPhaseId) {
    log('🎉 All phases complete! Chatbot is ready for production.', 'green');
    return;
  }
  
  const currentPhase = PHASES.find(p => p.id === currentPhaseId);
  log(`📍 Current Phase: ${currentPhase.id} - ${currentPhase.name}`, 'cyan');
  
  // Run tests for current phase
  const testResult = runPhaseTests(currentPhase);
  
  log('\n' + '-'.repeat(60), 'cyan');
  log('📊 Test Results:', 'bright');
  log(`   Passed: ${testResult.passed}/${currentPhase.expectedTests}`, 'green');
  log(`   Failed: ${testResult.failed}`, testResult.failed > 0 ? 'red' : 'green');
  log(`   Success Rate: ${((testResult.passed / currentPhase.expectedTests) * 100).toFixed(1)}%`, 
      testResult.success ? 'green' : 'red');
  log('-'.repeat(60) + '\n', 'cyan');
  
  if (testResult.success) {
    log('✅ All tests passed! Proceeding to next phase...', 'green');
    
    // Update progress table
    planContent = updateProgressTable(planContent, currentPhase.id, 'complete', testResult.passed);
    writeMasterPlan(planContent);
    
    // Run TypeScript build
    const buildSuccess = buildTypeScript();
    if (!buildSuccess) {
      log('❌ Build failed. Fix errors before proceeding.', 'red');
      process.exit(1);
    }
    
    // Git commit
    const commitMessage = `feat(chatbot): Phase ${currentPhase.id} - ${currentPhase.name} complete [100% tests]`;
    gitCommit(commitMessage);
    
    // Check if all phases complete
    if (currentPhase.id === 6) {
      log('\n🎉🎉🎉 ALL PHASES COMPLETE! 🎉🎉🎉', 'green');
      log('AI Chatbot v1.0 is ready for production deployment.', 'green');
      
      const finalCommit = 'feat(chatbot): AI Chatbot v1.0 - All phases complete ✅';
      gitCommit(finalCommit);
    } else {
      log(`\n➡️  Moving to Phase ${currentPhase.id + 1}: ${PHASES[currentPhase.id].name}`, 'cyan');
      log('Run this script again to continue.', 'cyan');
    }
    
  } else {
    log('❌ Tests failed. Fix the following before proceeding:', 'red');
    if (testResult.error) {
      log(`\n${testResult.error}`, 'red');
    }
    log(`\n💡 Expected ${currentPhase.expectedTests} tests to pass, got ${testResult.passed}`, 'yellow');
    process.exit(1);
  }
}

// Run
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
