# MASH Marketplace - Test Reliability Hardening Plan

> **Goal**: Achieve zero test failures across all 253 test suites (5848+ tests)
>
> **Status**: COMPLETE
> **Created**: 2026-02-27
> **Last Updated**: 2026-02-27
> **Owner**: AI Agent (Ralph)
> **PRD File**: `prd-test-hardening.json`
> **Progress File**: `progress.txt`

---

## Baseline Metrics

| Metric | Before | After | Target |
|--------|:------:|:-----:|:------:|
| Test Suites | 247 passed, 6 failed | 253 passed, 0 failed | 253 passed, 0 failed |
| Tests | 5757 passed, 91 failed | 5844 passed, 0 failed | All passed, 0 failed |
| Actual Failing | 90 | 0 | 0 |

## Root Cause Analysis

| Suite | Failures | Root Cause |
|-------|:--------:|------------|
| ProductCard | 2 | Selector mismatch - out-of-stock button accessible name changed |
| useSeller | 5 | Hook rewritten to use Firebase+Sanity instead of SellerApi |
| Cart Page | 6 | UI restructured - card layout, stock selectors, Link navigation |
| Seller Dashboard | 30 | Complete rewrite - single hook instead of 4, different data shapes |
| Seller API | 47 | Class rewritten from mock-data to real API client with fetch |
| Shop Page | 0 | Already passing (was previously reported as failing) |

## Progress Dashboard

| Story | Suite | Failures | Status |
|-------|-------|:--------:|--------|
| TFIX-001 | ProductCard | 2 | COMPLETE |
| TFIX-002 | useSeller | 5 | COMPLETE |
| TFIX-003 | Cart Page | 6 | COMPLETE |
| TFIX-004 | Seller Dashboard | 30 | COMPLETE |
| TFIX-005 | Seller API | 47 | COMPLETE |
| TFIX-006 | Full Validation | 0 | COMPLETE |
| **Total** | | **90 -> 0** | **6/6 complete** |

## Execution Order

1. TFIX-001: Quick fix - update 2 selectors in ProductCard test
2. TFIX-002: Medium fix - re-mock useSellerDashboard tests for Firebase/Sanity
3. TFIX-003: Medium fix - update cart page test selectors and navigation
4. TFIX-004: Major rewrite - seller dashboard tests for single-hook architecture
5. TFIX-005: Major rewrite - seller API tests for real fetch-based client
6. TFIX-006: Validation run - confirm zero failures end-to-end
