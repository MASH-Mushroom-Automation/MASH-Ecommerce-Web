/**
 * AI Configuration Test Script
 * 
 * Tests both Gemini and Hugging Face API configurations
 * to ensure the chatbot can work properly.
 * 
 * Usage: node scripts/test-ai-config.js
 */

require('dotenv').config();

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test Gemini API Configuration
 */
async function testGemini() {
  log('\n📊 Testing Gemini API...', 'cyan');

  if (!GEMINI_API_KEY) {
    log('❌ GEMINI_API_KEY not found in environment', 'red');
    return false;
  }

  log(`✓ API Key found: ${GEMINI_API_KEY.substring(0, 10)}...`, 'green');

  try {
    const model = 'gemini-2.0-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    log(`\n🔄 Testing model: ${model}`, 'blue');
    log(`📡 Endpoint: ${apiUrl.replace(GEMINI_API_KEY, 'KEY')}`, 'blue');

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Please respond with exactly: "Gemini API is working correctly"',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    };

    log('\n⏳ Sending test request...', 'yellow');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(`❌ API Error (${response.status}):`, 'red');
      log(errorText, 'red');
      return false;
    }

    const data = await response.json();

    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      log('❌ No content generated from Gemini', 'red');
      log(JSON.stringify(data, null, 2), 'yellow');
      return false;
    }

    log('\n✅ Gemini API Response:', 'green');
    log(`"${generatedText}"`, 'cyan');

    // Check token usage
    if (data.usageMetadata) {
      log('\n📈 Token Usage:', 'blue');
      log(
        `  Input tokens: ${data.usageMetadata.promptTokenCount || 0}`,
        'blue'
      );
      log(
        `  Output tokens: ${data.usageMetadata.candidatesTokenCount || 0}`,
        'blue'
      );
      log(
        `  Total tokens: ${data.usageMetadata.totalTokenCount || 0}`,
        'blue'
      );
    }

    return true;
  } catch (error) {
    log(`❌ Network Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Hugging Face API Configuration
 */
async function testHuggingFace() {
  log('\n\n📊 Testing Hugging Face API (Fallback)...', 'cyan');

  if (!HF_API_KEY) {
    log('❌ HF_API_KEY not found in environment', 'red');
    return false;
  }

  log(`✓ API Key found: ${HF_API_KEY.substring(0, 10)}...`, 'green');

  try {
    const model = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    const apiUrl = `https://router.huggingface.co/models/${model}`;

    log(`\n🔄 Testing model: ${model}`, 'blue');
    log(`📡 Endpoint: ${apiUrl}`, 'blue');

    const requestBody = {
      inputs:
        'Please respond with exactly: "Hugging Face API is working correctly"',
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
      },
    };

    log('\n⏳ Sending test request...', 'yellow');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(`❌ API Error (${response.status}):`, 'red');
      log(errorText, 'red');

      if (response.status === 503) {
        log(
          '\n⚠️  Model is loading. This is normal - try again in 20 seconds.',
          'yellow'
        );
      }

      return false;
    }

    const data = await response.json();

    // HF response format: [{ generated_text: "..." }] or { error: "..." }
    if (data.error) {
      log(`❌ API Error: ${data.error}`, 'red');
      return false;
    }

    const generatedText =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : '';

    if (!generatedText) {
      log('❌ No content generated from Hugging Face', 'red');
      log(JSON.stringify(data, null, 2), 'yellow');
      return false;
    }

    log('\n✅ Hugging Face API Response:', 'green');
    log(`"${generatedText}"`, 'cyan');

    return true;
  } catch (error) {
    log(`❌ Network Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  log('='.repeat(60), 'blue');
  log('  MASH AI Chatbot - API Configuration Test', 'blue');
  log('='.repeat(60), 'blue');

  const geminiResult = await testGemini();
  const hfResult = await testHuggingFace();

  log('\n' + '='.repeat(60), 'blue');
  log('  Test Results Summary', 'blue');
  log('='.repeat(60), 'blue');

  log(
    `\n${geminiResult ? '✅' : '❌'} Gemini API: ${geminiResult ? 'WORKING' : 'FAILED'}`,
    geminiResult ? 'green' : 'red'
  );
  log(
    `${hfResult ? '✅' : '❌'} Hugging Face API: ${hfResult ? 'WORKING' : 'FAILED'}`,
    hfResult ? 'green' : 'red'
  );

  if (geminiResult || hfResult) {
    log('\n✅ Chatbot can function!', 'green');
    if (geminiResult && hfResult) {
      log(
        '   Primary (Gemini) and Fallback (Hugging Face) both working.',
        'green'
      );
    } else if (geminiResult) {
      log(
        '   Primary (Gemini) working. Fallback unavailable.',
        'yellow'
      );
    } else {
      log(
        '   Only Fallback (Hugging Face) available. Primary failed.',
        'yellow'
      );
    }
  } else {
    log('\n❌ Chatbot CANNOT function - both APIs failed!', 'red');
  }

  log('\n' + '='.repeat(60), 'blue');

  // Exit with appropriate code
  process.exit(geminiResult || hfResult ? 0 : 1);
}

// Run tests
main().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
