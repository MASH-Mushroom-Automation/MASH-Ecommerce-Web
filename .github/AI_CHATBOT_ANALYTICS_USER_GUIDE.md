# AI Chatbot Analytics Dashboard - Admin User Guide

> **Complete guide for sellers and admins** to monitor, analyze, and optimize chatbot performance using real-time analytics and ML-powered insights.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Core Metrics](#core-metrics)
4. [Real-Time Monitoring](#real-time-monitoring)
5. [Query Clustering](#query-clustering)
6. [Intent Analysis](#intent-analysis)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Getting Started

### Accessing the Dashboard
**URL:** `https://zen.mashmarket.app/seller/analytics/chatbot`  
**Access:** Admin role required (seller accounts with analytics permissions)

### Dashboard Availability
- **24/7 Real-Time Data:** Live metrics update every 15-60 seconds
- **Historical Data:** View trends from the past 7, 30, or 90 days
- **Export Capabilities:** Download reports as CSV/PDF (coming soon)

### Prerequisites
- Active seller account on MASH Market
- Admin or Seller role assigned
- Chatbot deployed and receiving queries

---

## Dashboard Overview

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  Header: Real-Time Controls + Last Updated              │
├─────────────────────────────────────────────────────────┤
│  Summary Cards (4 metrics)                              │
│  - Total Queries | Avg Response Time | Success Rate     │
│  - Active Users                                          │
├─────────────────────────────────────────────────────────┤
│  Query Trends Chart (7-day line graph)                  │
├─────────────────────────────────────────────────────────┤
│  Intent Distribution (Pie chart)                        │
├─────────────────────────────────────────────────────────┤
│  Query Clusters (Top 10 grouped queries)                │
├─────────────────────────────────────────────────────────┤
│  Failed Searches (0-result queries requiring action)    │
└─────────────────────────────────────────────────────────┘
```

### Navigation
- **Refresh Button:** Manual refresh (reloads all metrics)
- **Auto-Refresh Toggle:** Enable/disable automatic updates
- **Interval Selector:** Choose refresh rate (15s, 30s, 60s)
- **Date Range Filter:** Select timeframe (7d, 30d, 90d)

---

## Core Metrics

### 1. Total Queries
**What it measures:** Total number of user queries sent to the chatbot  
**Time period:** Selected date range (default: 7 days)  
**Calculation:** Count of all messages with `role: 'user'` in Firestore

**How to interpret:**
- **Upward trend:** Growing chatbot adoption (good!)
- **Sudden spike:** Possible marketing campaign or product launch
- **Declining:** May indicate usability issues or reduced traffic

**Action items:**
- If declining: Review chatbot visibility, UI placement, and onboarding
- If spiking: Ensure infrastructure can handle load

---

### 2. Average Response Time
**What it measures:** Mean time (in seconds) for chatbot to respond  
**Time period:** Selected date range  
**Target:** < 2 seconds for optimal user experience

**How to interpret:**
- **< 2s:** Excellent performance ✅
- **2-5s:** Acceptable but room for improvement ⚠️
- **> 5s:** Poor performance - users may abandon ❌

**Action items:**
- If high (>5s):
  - Check Firebase Firestore indexing
  - Review Gemini API response times
  - Optimize RAG context retrieval
  - Consider caching frequent queries

---

### 3. Success Rate
**What it measures:** Percentage of queries that returned relevant results  
**Time period:** Selected date range  
**Calculation:** (Queries with results / Total queries) × 100  
**Target:** > 85% for good chatbot experience

**How to interpret:**
- **> 90%:** Excellent query understanding ✅
- **75-89%:** Good but improvable ⚠️
- **< 75%:** Poor performance - requires immediate attention ❌

**Action items:**
- If low (<75%):
  - Review "Failed Searches" section
  - Update product catalog in Sanity CMS
  - Improve chatbot training data
  - Add more product synonyms/variations

---

### 4. Active Users (Real-Time)
**What it measures:** Number of unique users interacting with chatbot *right now*  
**Time window:** Last 5 minutes  
**Data source:** Firebase Firestore `lastActivity` timestamps

**How to interpret:**
- **High during business hours:** Expected pattern
- **Zero during peak hours:** Check chatbot availability
- **Spike during launch:** Monitor for performance issues

**Action items:**
- Use this to plan maintenance windows (low activity periods)
- Alert team if unexpected drops during business hours

---

## Real-Time Monitoring

### Auto-Refresh System
The dashboard automatically updates without requiring manual refresh.

**Configuration:**
- **Default:** Enabled, 30-second interval
- **Options:** 15s, 30s, 60s intervals
- **Toggle:** Click "Auto-Refresh" button to enable/disable

**When to use:**
- **15s:** During product launches or high-traffic events
- **30s:** Normal business operations (default)
- **60s:** Background monitoring during low activity
- **Disabled:** When analyzing historical data (prevents distraction)

### Alert System (Coming Soon)
Future updates will include:
- **Response time alerts:** Notify when >5s for 5+ consecutive queries
- **Success rate drops:** Alert when <70% for 10+ minutes
- **Query volume spikes:** Warn of unusual traffic patterns
- **Failed search patterns:** Highlight recurring 0-result queries

---

## Query Clustering

### What is Query Clustering?
Groups similar user queries together to identify patterns and common topics.

**Algorithm:** Levenshtein distance (measures similarity between strings)  
**Threshold:** 75% similarity required to cluster queries  
**Example:**
```
Cluster: "button mushroom"
├─ "button mushrooms" (97% similar)
├─ "button mushroom fresh" (89% similar)
└─ "butoon mushroom" (typo - 91% similar)
```

### How to Use Clusters

#### 1. Product Demand Analysis
**Cluster:** "organic shiitake"  
**Count:** 45 queries  
**Success Rate:** 30%

**Interpretation:** High demand but low availability
**Action:** Consider adding organic shiitake to inventory or highlight existing products

#### 2. Synonym Detection
**Cluster:** "cheap mushrooms" (synonyms: "affordable", "inexpensive", "budget")

**Interpretation:** Users searching with price sensitivity  
**Action:** Ensure chatbot recognizes all price-related keywords

#### 3. Typo Identification
**Cluster:** "oyster" (includes "oysster", "oyster mushrooms", "oyster fungi")

**Interpretation:** Common misspellings  
**Action:** Add typo tolerance to search algorithm

### Actionable Insights from Clusters

**Top 3 Clusters = Most Requested Products**
- Use this data for inventory planning
- Feature these products prominently
- Create marketing campaigns around high-demand items

**Low Success Rate Clusters = Missing Products**
- Add these products to catalog
- Update product descriptions to match user language
- Train chatbot with additional context

**High Query Diversity = Broad Product Interest**
- Score: 1.0 = All unique queries (exploratory users)
- Score: 0.3 = Repetitive queries (specific product seekers)

---

## Intent Analysis

### 6 Intent Categories

#### 1. Product Search (60-70% of queries)
**Examples:** "show me button mushrooms", "find fresh oyster", "I need shiitake"  
**User Goal:** Locate specific products  
**Confidence:** 0.9 (high)

**Optimization:**
- Ensure product catalog is complete
- Add clear product images and descriptions
- Use descriptive titles (e.g., "Fresh Organic Button Mushrooms" not "Item #123")

#### 2. Information (15-20% of queries)
**Examples:** "what are the benefits of shiitake?", "how to cook mushrooms", "why are mushrooms healthy?"  
**User Goal:** Learn about mushrooms  
**Confidence:** 0.85

**Optimization:**
- Add FAQ section to product pages
- Create blog content about mushroom benefits
- Train chatbot with nutritional data

#### 3. Comparison (5-10% of queries)
**Examples:** "button vs oyster mushrooms", "compare shiitake and portobello", "which is better"  
**User Goal:** Decide between products  
**Confidence:** 0.8

**Optimization:**
- Create comparison tables
- Highlight unique features per mushroom type
- Add side-by-side product comparisons

#### 4. Recommendation (5-10% of queries)
**Examples:** "recommend mushrooms for soup", "which should I buy", "suggest something for beginners"  
**User Goal:** Get personalized advice  
**Confidence:** 0.85

**Optimization:**
- Implement recommendation engine
- Add "Frequently Bought Together" section
- Create use-case guides (e.g., "Best mushrooms for pasta")

#### 5. Support (2-5% of queries)
**Examples:** "where is my order", "cancel delivery", "help with refund"  
**User Goal:** Resolve order issues  
**Confidence:** 0.9

**Optimization:**
- Route to human support immediately
- Add order tracking chatbot integration
- Create self-service tools (cancel order button)

#### 6. Other (<5% of queries)
**Examples:** Random text, off-topic questions  
**User Goal:** Unknown  
**Confidence:** 0.3 (low)

**Optimization:**
- Add fallback message: "I didn't understand. Try asking about our products!"
- Log these for chatbot training improvements

---

## Performance Optimization

### Response Time Optimization

**Target:** < 2 seconds

**Common Bottlenecks:**
1. **Firebase Firestore Queries**
   - **Issue:** Missing indexes cause slow reads
   - **Fix:** Run `firebase deploy --only firestore:indexes`

2. **Gemini API Latency**
   - **Issue:** Large context windows increase response time
   - **Fix:** Optimize RAG context (top 3 products only)

3. **Sanity CMS Product Fetching**
   - **Issue:** Fetching all products on every query
   - **Fix:** Use CDN caching (`useCdn: true` in sanity client)

**Monitoring Tools:**
- Dashboard shows avg response time per day
- If consistently >5s, investigate backend logs

---

### Success Rate Optimization

**Target:** > 85%

**Improvement Strategies:**

#### 1. Add Missing Products
**Problem:** Users searching for products not in catalog  
**Solution:** Review "Failed Searches" section → Add products to Sanity CMS

#### 2. Improve Product Descriptions
**Problem:** Chatbot can't match user language to product names  
**Solution:** Add synonyms, alternate spellings, and common phrases

**Example:**
```diff
# Bad: "Pleurotus ostreatus"
+ Good: "Oyster Mushrooms (Pleurotus ostreatus) - Fresh, Organic"
```

#### 3. Train Chatbot with User Queries
**Problem:** Chatbot doesn't understand regional/local terms  
**Solution:** Use query clusters to identify common phrases → Add to training data

#### 4. Enhance RAG Context
**Problem:** Chatbot returns irrelevant products  
**Solution:** Improve vector search embeddings and similarity thresholds

---

## Troubleshooting

### Issue: "Dashboard shows 0 queries"
**Possible Causes:**
- Chatbot not deployed/accessible
- Firebase Firestore permissions issue
- Date range filter set to future dates

**Fix:**
1. Check chatbot is visible on https://www.mashmarket.app
2. Test sending a query as a customer
3. Verify date range is set to "Last 7 Days"

---

### Issue: "Real-time monitoring not updating"
**Possible Causes:**
- Auto-refresh disabled
- Browser tab inactive (browser throttles timers)
- Network connectivity issues

**Fix:**
1. Click "Enable Auto-Refresh" button
2. Keep browser tab active
3. Check network connection

---

### Issue: "Success rate is 0%"
**Possible Causes:**
- No products in Sanity CMS
- Chatbot not connected to product database
- All queries are off-topic (e.g., support requests)

**Fix:**
1. Verify products exist in Sanity CMS: https://ppnamias.sanity.studio
2. Check chatbot configuration in `src/lib/ai/gemini-service.ts`
3. Review query intent distribution (high "support" % indicates routing issue)

---

### Issue: "Clusters show strange groupings"
**Possible Causes:**
- Similarity threshold too high/low (default: 75%)
- Insufficient query volume (need 10+ queries minimum)

**Fix:**
- Wait for more query data (at least 50 queries)
- Check for data quality issues (spam, test queries)

---

## Best Practices

### Daily Monitoring Routine
**Morning Check (5 minutes):**
1. Review overnight query volume (any unusual spikes/drops?)
2. Check success rate (still above 85%?)
3. Scan failed searches (any new product requests?)

**Action:** Flag any anomalies for investigation

---

### Weekly Analysis (30 minutes)
**Monday Morning:**
1. **Review top 10 query clusters** → Update inventory priorities
2. **Analyze intent distribution** → Plan content creation
3. **Identify synonym patterns** → Improve chatbot training
4. **Check response time trends** → Schedule optimization if needed

**Deliverable:** Weekly report to team with key findings

---

### Monthly Deep Dive (2 hours)
**First of Month:**
1. **90-day trend analysis** → Identify long-term patterns
2. **Success rate by product category** → Find underperforming areas
3. **User journey analysis** → Map common query sequences
4. **Competitor comparison** → Benchmark against industry standards

**Deliverable:** Strategic recommendations for product team

---

### Alert Response Playbook

#### High Response Time Alert (>5s)
1. Check Firebase Firestore indexes (missing indexes?)
2. Review Gemini API status (downtime?)
3. Analyze query complexity (unusually long questions?)
4. Contact dev team if issue persists >15 minutes

#### Success Rate Drop Alert (<70%)
1. Review "Failed Searches" section (new missing products?)
2. Check if recent product deletions from Sanity CMS
3. Verify chatbot training data is current
4. Test chatbot manually with common queries

#### Query Volume Spike Alert (>300% normal)
1. Check for marketing campaigns (expected traffic?)
2. Monitor response times (infrastructure handling load?)
3. Review query quality (spam/bot traffic?)
4. Scale infrastructure if legitimate spike

---

## Key Takeaways

### What Makes a Successful Dashboard User?
1. **Daily monitoring:** Catch issues early (5 min/day habit)
2. **Data-driven decisions:** Use clusters and intents for inventory planning
3. **Continuous improvement:** Iterate on failed searches weekly
4. **Proactive optimization:** Don't wait for alerts - monitor trends

### Success Metrics for Your Team
- **Response Time:** < 2s consistently
- **Success Rate:** > 90% sustained for 30+ days
- **Query Volume:** Growing month-over-month (indicates adoption)
- **Active Users:** Peak during business hours (expected pattern)

### When to Escalate to Dev Team
- Response times consistently >10s (infrastructure issue)
- Success rate <50% for 24+ hours (critical chatbot failure)
- Dashboard not loading or showing errors (technical bug)
- Real-time monitoring stopped working (Firebase connection issue)

---

## Additional Resources

### Related Documentation
- **AI Chatbot ML Enhancement Plan:** `.github/AI_CHATBOT_ML_ENHANCEMENT_PLAN.md`
- **Firebase Firestore Rules:** `.github/FIRESTORE_SECURITY_RULES.md`
- **Sanity CMS Guide:** `studio/README.md`
- **API Integration:** `.github/LOCAL_DEVELOPMENT_GUIDE.md`

### Support
- **Technical Issues:** Contact dev team via Slack #mash-tech-support
- **Product Questions:** Email support@mashmarket.app
- **Feature Requests:** Create GitHub issue in MASH-Ecommerce-Web repo

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| **1.0.0** | 2026-01-22 | Initial release - Phase 1 analytics dashboard complete |

---

**Last Updated:** January 22, 2026  
**Maintained by:** MASH Development Team  
**Questions?** Open an issue on GitHub or contact the team.
