# MASH E-Commerce Platform

[![Thesis Project](https://img.shields.io/badge/Thesis-University%20of%20Caloocan%20City-1f6f43?style=for-the-badge)](https://www.mashmarket.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![NestJS API](https://img.shields.io/badge/NestJS-Backend-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea043?style=for-the-badge)](./LICENSE)

MASH (Mushroom Automation with Smart Hydro-environment) is a thesis-driven platform that combines mushroom automation concepts, data-informed cultivation, and a production-ready e-commerce system.

This repository contains the Next.js web application for customer storefront experiences, content management integration, and connected backend services.

## Executive Summary

This repository serves as a public thesis reference for researchers, faculty, evaluators, and technical reviewers.

It documents:

- the academic context and system scope
- the architecture and implementation workflow
- where to access the demo, thesis soft copy, and supporting documentation
- how to run, validate, and review the codebase

## Table of Contents

- [Executive Summary](#executive-summary)
- [Thesis Context](#thesis-context)
- [Problem Statement and Scope](#problem-statement-and-scope)
- [System Architecture Summary](#system-architecture-summary)
- [Methodology and High-Level Workflow](#methodology-and-high-level-workflow)
- [Outcomes and Evaluation Highlights](#outcomes-and-evaluation-highlights)
- [Live Systems](#live-systems)
- [MASH Demo Video](#mash-demo-video)
- [Thesis and Research Resources](#thesis-and-research-resources)
- [Setup Requirements](#setup-requirements)
- [Local Development and Validation Commands](#local-development-and-validation-commands)
- [Documentation and Review Map](#documentation-and-review-map)
- [Visual Asset Locations](#visual-asset-locations)
- [Architecture Diagram Placeholder](#architecture-diagram-placeholder)
- [Maintainer and Contributor Notes](#maintainer-and-contributor-notes)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Citation](#citation)
- [FAQ for Researchers and Evaluators](#faq-for-researchers-and-evaluators)
- [License](#license)

## Thesis Context

MASH is developed as part of a University of Caloocan City thesis initiative focused on integrating smart agriculture concepts with a scalable digital commerce platform.

The web application in this repository is the primary public software artifact for technical and academic review.

## Problem Statement and Scope

### Problem Statement

Mushroom-focused agribusiness workflows often face fragmented operations across cultivation guidance, customer engagement, product discovery, and order handling. This thesis addresses that gap through a unified platform with clear user-facing and operational capabilities.

### Scope Summary

In scope:

- e-commerce storefront and product experience
- CMS-backed content delivery (guides, recipes, informational pages)
- authentication and user-related workflows
- API-based order and transaction integration
- deployment and documentation artifacts for thesis review

Out of scope (current repository):

- full backend implementation details from external backend repositories
- non-web clients not included in this codebase

## System Architecture Summary

MASH uses a modular web architecture with clear service boundaries:

| Layer | Primary Responsibility | Main Technology |
| --- | --- | --- |
| Presentation Layer | UI pages, route handling, component rendering | Next.js 16 + React 19 |
| Content Layer | Product/content models and editorial control | Sanity CMS |
| Identity and Cloud Data | Authentication and cloud services | Firebase Auth + Firestore |
| Business API Layer | Order, account, and transactional endpoints | NestJS API |

Source mapping:

- App routes and pages: [`src/app`](./src/app)
- Shared components: [`src/components`](./src/components)
- Integrations and utilities: [`src/lib`](./src/lib)
- Type definitions: [`src/types`](./src/types)
- CMS studio code: [`studio`](./studio)

Architecture visual placeholder (replace with final diagram later):

![System Architecture Placeholder (ARCH-01)](./public/hero-1.jpg)

## Methodology and High-Level Workflow

The implementation and review workflow follows these high-level stages:

1. Requirements and thesis alignment (problem framing and target outcomes)
2. Architecture and data-flow design (frontend, CMS, auth, API boundaries)
3. Incremental implementation (feature modules and typed integrations)
4. Validation gates (build, lint, test)
5. Deployment and stakeholder review (production/dev links and documentation)
6. Iterative refinement through documented plans and reports

Methodology workflow visual placeholder:

![Methodology Workflow Placeholder (METH-01)](./public/hero-2.jpg)

## Outcomes and Evaluation Highlights

Current demonstrable outcomes include:

- publicly accessible production and development deployments
- integrated stack across Next.js, Sanity CMS, Firebase, and NestJS API
- automated quality-gate commands for repeatable technical verification
- documented thesis and review materials under [`docs`](./docs) and [`.github`](./.github)

Evaluation highlights visual placeholder:

![Outcomes and Evaluation Placeholder (EVAL-01)](./public/hero-1.jpg)

## Live Systems

| Service | URL |
| --- | --- |
| E-Commerce (Production) | [MASH Market Production](https://www.mashmarket.app) |
| E-Commerce (Development) | [MASH Market Development](https://beta.mashmarket.app) |
| Admin Panel | [MASH Admin](https://zen.mashmarket.app) |
| Backend API Base | [MASH API Base URL](https://api.mashmarket.app/api/v1) |
| Backend API Docs | [MASH API Documentation](https://api.mashmarket.app/api/docs) |
| Sanity Studio | [MASH Sanity Studio](https://ppnamias.sanity.studio) |
| Firebase Console | [MASH Firebase Project](https://console.firebase.google.com/u/7/project/mash-ddf8d/) |

## MASH Demo Video

### YouTube Link

[Watch the MASH Demo on YouTube](https://www.youtube.com/watch?v=CbzYfdPU3hw&pp=ygUYbWFzaCBtdXNocm9vbSBhdXRvbWF0aW9u)

### Video Preview

[![MASH Demo Video Preview](https://img.youtube.com/vi/CbzYfdPU3hw/maxresdefault.jpg)](https://www.youtube.com/watch?v=CbzYfdPU3hw&pp=ygUYbWFzaCBtdXNocm9vbSBhdXRvbWF0aW9u)

### Embed Snippet

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/CbzYfdPU3hw?si=ORNbcNsFIp6bxAgm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

Note: GitHub README rendering may block iframe playback. Use the direct YouTube link and preview image as the primary public-view fallback.

## Thesis and Research Resources

### Quick Access Icons

#### Thesis and Paper Access

[![Thesis Soft Copy](https://img.shields.io/badge/Thesis%20Soft%20Copy-Google%20Docs-4285F4?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing)
[![Research Paper](https://img.shields.io/badge/Research%20Paper-Current%20Soft%20Copy-1f6f43?style=for-the-badge&logo=readthedocs&logoColor=white)](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing)

#### Public Channels

[![YouTube Channel](https://img.shields.io/badge/YouTube-Channel-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@MASH-UCC)
[![Facebook Page](https://img.shields.io/badge/Facebook-Page-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/MASHMarketPH)
[![LinkedIn Company](https://img.shields.io/badge/LinkedIn-Company-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/mash-mushroom-automation/)

### Descriptive Resource Links

- Thesis soft copy (Google Docs): [FINAL Mam Pelagio](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing)
- Software Development Plan: [`./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md`](./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md)
- Faculty Status Report: [`./.github/FACULTY_STATUS_REPORT.md`](./.github/FACULTY_STATUS_REPORT.md)
- Presentation Guide: [`./.github/PRESENTATION_GUIDE.md`](./.github/PRESENTATION_GUIDE.md)
- Architecture Slide Outline: [`./docs/canva-architecture-slide-outline.md`](./docs/canva-architecture-slide-outline.md)

## Setup Requirements

- Node.js: `20.19.0` (from [`.nvmrc`](./.nvmrc))
- npm: current LTS-compatible version for Node 20
- Access to environment credentials based on [`.env.example`](./.env.example)
- Optional for e2e tests: Playwright browsers via `npx playwright install`

## Local Development and Validation Commands

Install dependencies:

```bash
npm install
```

Build first:

```bash
npm run build
```

Run development server:

```bash
npm run dev
```

Run validation commands:

```bash
npm run lint
npm run test
npm run test:coverage
```

Optional end-to-end tests:

```bash
npm run test:e2e
```

## Documentation and Review Map

| Audience | Document | Purpose |
| --- | --- | --- |
| Researchers and Faculty | [`./.github/FACULTY_STATUS_REPORT.md`](./.github/FACULTY_STATUS_REPORT.md) | Thesis progress, milestones, and review status |
| Technical Reviewers | [`./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md`](./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md) | Architecture and implementation planning details |
| Presenters and Defenders | [`./.github/PRESENTATION_GUIDE.md`](./.github/PRESENTATION_GUIDE.md) | Defense and demo narrative guidance |
| Documentation Maintainers | [`./.github/DOCUMENTATION_INDEX.md`](./.github/DOCUMENTATION_INDEX.md) | Index of major project documentation |
| README Iteration Planning | [`./docs/AI_PROMPT_README_DOCUMENTATION_NEXT_STEPS.md`](./docs/AI_PROMPT_README_DOCUMENTATION_NEXT_STEPS.md) | Prompt template for subsequent README improvements |

## Visual Asset Locations

Use these folders for thesis visuals, screenshots, and publication-ready assets:

- Primary screenshot folder: [`./docs/screenshots`](./docs/screenshots)
- Screenshot folder guide: [`./docs/screenshots/README.md`](./docs/screenshots/README.md)
- Changelog visuals and evidence: [`./docs/changelog`](./docs/changelog)
- Web-served media assets: [`./public`](./public)

## Architecture Diagram Placeholder

Use the placeholder slots below to keep image positions stable while your final thesis visuals are being prepared.

### Placeholder Replacement Map

| Slot ID | Current Placeholder Image | Final Target File to Create/Replace |
| --- | --- | --- |
| ARCH-01 | `./public/hero-1.jpg` | `./docs/screenshots/system-architecture-overview.png` |
| METH-01 | `./public/hero-2.jpg` | `./docs/screenshots/research-methodology-flow.png` |
| EVAL-01 | `./public/hero-1.jpg` | `./docs/screenshots/results-and-evaluation.png` |

### Current Placeholder Preview Blocks

#### System Architecture Position (ARCH-01)

![System Architecture Placeholder (ARCH-01)](./public/hero-1.jpg)

#### Methodology Workflow Position (METH-01)

![Methodology Workflow Placeholder (METH-01)](./public/hero-2.jpg)

#### Evaluation Highlights Position (EVAL-01)

![Outcomes and Evaluation Placeholder (EVAL-01)](./public/hero-1.jpg)

### How to Replace Placeholders Later

1. Add final images to `./docs/screenshots/` using the target filenames in the table.
2. Replace the image paths in each placeholder block from `./public/...` to `./docs/screenshots/...`.
3. Keep the same slot location in the README so the layout stays consistent for reviewers.

## Maintainer and Contributor Notes

- Keep README links descriptive and stable for public academic review.
- Prefer relative links for repository files and folders.
- Keep long-form details in dedicated docs and keep README focused on fast orientation.
- For major documentation updates, add an entry to [`./docs/changelog`](./docs/changelog).

## Core Features

- Next.js 16 application with App Router and route groups
- Product catalog, shopping cart, and checkout workflows
- Sanity CMS integration for content and product management
- Firebase authentication and realtime cloud integrations
- NestJS backend API integration for transactions and business logic
- Automated testing setup with Jest and Playwright

## Technology Stack

- Next.js 16 (Turbopack)
- TypeScript
- Tailwind CSS with shadcn/Radix UI
- Sanity CMS
- Firebase Auth and Firestore
- NestJS backend API
- Jest and React Testing Library
- Playwright

## Project Structure

```text
src/
  app/                Next.js routes and pages
  components/         UI and feature components
  contexts/           App-wide state providers
  hooks/              Reusable hooks
  lib/                API clients, integrations, utilities
  types/              Shared TypeScript types
studio/               Sanity Studio project
docs/                 Documentation and thesis resources
.github/              Plans, guides, and project reports
```

## Environment Configuration

- Use [`.env.example`](./.env.example) as a template for required variables.
- Do not commit secrets or credentials.
- Production and deployment configuration are managed via environment variables.

## Citation

If you reference this repository in academic work, use one of the following formats and replace placeholder values.

### BibTeX

```bibtex
@misc{mash_ecommerce_2026,
  title        = {MASH E-Commerce Platform: Mushroom Automation with Smart Hydro-environment},
  author       = {{MASH Thesis Team}},
  year         = {2026},
  howpublished = {GitHub repository},
  note         = {Accessed: YYYY-MM-DD},
  url          = {https://github.com/ORG_OR_USER/MASH-Ecommerce}
}
```

### Suggested Thesis Reference Entry

MASH Thesis Team. (2026). *MASH E-Commerce Platform: Mushroom Automation with Smart Hydro-environment* [Software repository]. GitHub. [https://github.com/ORG_OR_USER/MASH-Ecommerce](https://github.com/ORG_OR_USER/MASH-Ecommerce)

## FAQ for Researchers and Evaluators

### Where can I access the thesis soft copy?

Use the thesis link in [Thesis and Research Resources](#thesis-and-research-resources) or go directly to [Google Docs](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing).

### Where should architecture and evaluation images be placed?

Place them under [`./docs/screenshots`](./docs/screenshots), following the naming guidance in [Architecture Diagram Placeholder](#architecture-diagram-placeholder).

### Which commands should reviewers run first?

Run:

```bash
npm install
npm run build
npm run lint
npm run test
```

### Where are the main review documents?

Start with [Documentation and Review Map](#documentation-and-review-map), then read:

- [`./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md`](./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md)
- [`./.github/FACULTY_STATUS_REPORT.md`](./.github/FACULTY_STATUS_REPORT.md)
- [`./.github/PRESENTATION_GUIDE.md`](./.github/PRESENTATION_GUIDE.md)

## License

This project is licensed under the terms in [`LICENSE`](./LICENSE).
