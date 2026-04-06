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

## Table of Contents

- [Project Overview](#project-overview)
- [Live Systems](#live-systems)
- [MASH Demo Video](#mash-demo-video)
- [Thesis and Research Resources](#thesis-and-research-resources)
- [Documentation and Visual Assets](#documentation-and-visual-assets)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Local Development](#local-development)
- [Quality Checks](#quality-checks)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [License](#license)

## Project Overview

MASH is developed as part of a University of Caloocan City thesis initiative, integrating:

- A modern e-commerce web application
- CMS-powered content workflows
- Authentication and cloud services
- API-driven transaction and order workflows
- Research and presentation artifacts for academic review

## Live Systems

| Service | URL |
| --- | --- |
| E-Commerce (Production) | [www.mashmarket.app](https://www.mashmarket.app) |
| E-Commerce (Development) | [beta.mashmarket.app](https://beta.mashmarket.app) |
| Admin Panel | [zen.mashmarket.app](https://zen.mashmarket.app) |
| Backend API | [api.mashmarket.app/api/v1](https://api.mashmarket.app/api/v1) |
| Sanity Studio | [ppnamias.sanity.studio](https://ppnamias.sanity.studio) |
| Firebase Console | [mash-ddf8d project](https://console.firebase.google.com/u/7/project/mash-ddf8d/) |

## MASH Demo Video

### YouTube Link

[Watch on YouTube](https://www.youtube.com/watch?v=CbzYfdPU3hw&pp=ygUYbWFzaCBtdXNocm9vbSBhdXRvbWF0aW9u)

### Video Preview

[![MASH Demo Video](https://img.youtube.com/vi/CbzYfdPU3hw/maxresdefault.jpg)](https://www.youtube.com/watch?v=CbzYfdPU3hw&pp=ygUYbWFzaCBtdXNocm9vbSBhdXRvbWF0aW9u)

### Embed Snippet

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/CbzYfdPU3hw?si=ORNbcNsFIp6bxAgm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

Note: GitHub README rendering may block iframe playback. The YouTube link and preview image are the recommended public fallback.

## Thesis and Research Resources

### Quick Access Icons

#### Thesis and Paper

[![Thesis Soft Copy](https://img.shields.io/badge/Thesis%20Soft%20Copy-Google%20Docs-4285F4?style=for-the-badge&logo=googledocs&logoColor=white)](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing)
[![Research Paper](https://img.shields.io/badge/Research%20Paper-Current%20Soft%20Copy-1f6f43?style=for-the-badge&logo=readthedocs&logoColor=white)](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing)

#### Public Channels

[![YouTube Channel](https://img.shields.io/badge/YouTube-Channel-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@MASH-UCC)
[![Facebook Page](https://img.shields.io/badge/Facebook-Page-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/MASHMarketPH)
[![LinkedIn Company](https://img.shields.io/badge/LinkedIn-Company-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/mash-mushroom-automation/)

#### Project and Defense Documents

[![Software Development Plan](https://img.shields.io/badge/SDP-Software%20Development%20Plan-4B5563?style=for-the-badge&logo=readthedocs&logoColor=white)](./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md)
[![Faculty Status Report](https://img.shields.io/badge/Faculty-Status%20Report-6B7280?style=for-the-badge&logo=googledocs&logoColor=white)](./.github/FACULTY_STATUS_REPORT.md)
[![Presentation Guide](https://img.shields.io/badge/Presentation-Guide-8B5CF6?style=for-the-badge&logo=canva&logoColor=white)](./.github/PRESENTATION_GUIDE.md)
[![Architecture Slide Outline](https://img.shields.io/badge/Architecture-Slide%20Outline-1D4ED8?style=for-the-badge&logo=markdown&logoColor=white)](./docs/canva-architecture-slide-outline.md)

For final publication, replace the Research Paper badge target with your archived PDF or university repository URL.

## Documentation and Visual Assets

Use this repository as the public thesis reference package. For presentation visuals and publication-ready media, place assets in documentation folders and reference them in this README.

Recommended locations:

- `docs/screenshots/` for UI screenshots
- `docs/changelog/` for milestone visuals and release notes
- `public/` for reusable media assets used by the web app

Suggested thesis asset filenames:

- `docs/screenshots/thesis-banner-main.png`
- `docs/screenshots/system-architecture-overview.png`
- `docs/screenshots/research-methodology-flow.png`
- `docs/screenshots/results-and-evaluation.png`
- `docs/screenshots/final-defense-summary.png`

Markdown template for adding new visuals:

```md
## Thesis Gallery

![Thesis Banner](docs/screenshots/thesis-banner-main.png)
![System Architecture](docs/screenshots/system-architecture-overview.png)
![Methodology Flow](docs/screenshots/research-methodology-flow.png)
```

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

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Build first (required)

```bash
npm run build
```

### 3) Start development server

```bash
npm run dev
```

### 4) Open in browser

[http://localhost:3000](http://localhost:3000)

## Quality Checks

Run these before pushing to `main`:

```bash
npm run build
npm run lint
npm run test
```

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

- Use `.env.example` as a template for required variables.
- Do not commit secrets or credentials.
- Production and deployment configuration are managed via environment variables.

## License

This project is licensed under the terms in [`LICENSE`](./LICENSE).
