# MASH E-Commerce Platform

[![Thesis Project](https://img.shields.io/badge/Thesis-University%20of%20Caloocan%20City-1f6f43?style=for-the-badge)](https://www.mashmarket.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![NestJS API](https://img.shields.io/badge/NestJS-Backend-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea043?style=for-the-badge)](./LICENSE)

MASH (Mushroom Automation with Smart Hydro-environment) is a thesis-driven platform bridging smart agriculture concepts with a scalable digital commerce ecosystem. This repository contains the public Next.js web application for storefront experiences, CMS integrations, and connected backend services.

## Quick Links

| Resource | Link |
| --- | --- |
| **Live Production** | [MASH Market](https://www.mashmarket.app) |
| **Development** | [MASH Market Dev](https://beta.mashmarket.app) |
| **Admin Panel** | [MASH Admin](https://zen.mashmarket.app) |
| **Backend API** | [API Docs](https://api.mashmarket.app/api/docs) |
| **Thesis Soft Copy** | [Google Docs](https://docs.google.com/document/d/1MzVCAP95i2d0Zoid7Q5eyv25B26pIkgrsCAtq5rahqg/edit?usp=sharing) |
| **Demo Video** | [Watch on YouTube](https://www.youtube.com/watch?v=CbzYfdPU3hw) |

---

## About MASH

This project is part of a **University of Caloocan City thesis**. It resolves fragmented agribusiness workflows by providing a unified platform integrating cultivation guidance, product discovery, order handling, and content delivery.

**Scope inclusions**: E-commerce storefront, CMS-backed content delivery, user authentication, and API-based transactional flows.

---

## System Demonstration

Click the video preview below to watch the complete workflow of the MASH Platform on YouTube.

[![MASH System Demo Video](https://img.youtube.com/vi/CbzYfdPU3hw/maxresdefault.jpg)](https://www.youtube.com/watch?v=CbzYfdPU3hw "Click to Watch MASH Demo Video")

*(For embedded viewing in supported environments, use [this embed link](https://www.youtube.com/embed/CbzYfdPU3hw?si=ORNbcNsFIp6bxAgm))*

---

## System Architecture

MASH follows a modular web architecture:

- **Presentation Layer**: Next.js 16 + React 19 (in src/app and src/components)
- **Content Layer**: Sanity CMS (in studio)
- **Identity & Data**: Firebase Auth + Firestore
- **Business Logic**: NestJS API

> **Note on Placeholders (ARCH-01 / METH-01 / EVAL-01):** Final diagrams (system-architecture-overview.png, research-methodology-flow.png, results-and-evaluation.png) should be placed in docs/screenshots/ prior to final presentation. Below are visual placeholders.

### Architecture (ARCH-01)

[![Architecture Diagram Placeholder](./public/hero-1.jpg)](./public/hero-1.jpg)

### Methodology (METH-01)

[![Methodology Flow Placeholder](./public/hero-2.jpg)](./public/hero-2.jpg)

### Evaluation (EVAL-01)

[![Evaluation Statistics Placeholder](./public/hero-1.jpg)](./public/hero-1.jpg)

---

## Development Setup

**Requirements:** Node.js 20.19.0 (see .nvmrc)

1. **Install Dependencies:** npm install
2. **Build and Run:**

   `ash
   npm run build
   npm run dev
   `

3. **Validate:**

   `ash
   npm run lint
   npm run test
   `

---

## Project Structure & Documentation

Key documentation artifacts for technical and academic review:

- **Architecture & Implementation Plan**: [SDP_SOFTWARE_DEVELOPMENT_PLAN.md](./.github/SDP_SOFTWARE_DEVELOPMENT_PLAN.md)
- **Faculty Progress Status**: [FACULTY_STATUS_REPORT.md](./.github/FACULTY_STATUS_REPORT.md)
- **Presentation Guide**: [PRESENTATION_GUIDE.md](./.github/PRESENTATION_GUIDE.md)

For detailed layout overview, view the src/ and docs/ directories.

---

### Citation

If referring to this repository in an academic capacity:

`ibtex
@misc{mash_ecommerce_2026,
  title        = {MASH E-Commerce Platform: Mushroom Automation with Smart Hydro-environment},
  author       = {{MASH Thesis Team}},
  year         = {2026},
  url          = {https://github.com/ORG_OR_USER/MASH-Ecommerce}
}
`

*Licensed under the [MIT License](./LICENSE).*
