# CI/CD Pipeline for SeedSwap

**Course:** CS 650 - Module 7-2

> **Open this folder in VS Code** using **File > Open Folder** and select the `module-7-2-seedswap` directory. This gives you the full project structure in the sidebar. To read this README with formatting, right-click the file and choose **Open Preview**.

## Getting Started

```bash
# Terminal 1 — backend (port 3000)
cd backend && npm install && node seed.ts && node server.ts

# Terminal 2 — frontend (port 5173)
cd frontend && npm install && npm run dev
```

## Running

> These commands skip the one-time install and database seed.
> If you need to reset your data, see the **Database** section below.

```bash
# Terminal 1 — backend (port 3000)
cd backend && node server.ts

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

## Database

The database (`backend/seedswap.db`) is created and seeded during first-time setup. It persists across server restarts.

To reset the database to its original state, delete the file and re-seed:

```bash
cd backend && rm -f seedswap.db && node seed.ts
```

## Running the Tests

```bash
# Backend unit tests
cd backend && npm test

# E2E tests (stop your dev servers first — Playwright starts its own)
cd e2e && npm install && npx playwright install chromium && npx playwright test
```

## Overview

SeedSwap is a seed-packet-sharing app where gardeners post available seed packets and others can claim them. The application and all tests are fully implemented. Your task is to build a CI/CD pipeline around it using GitHub Actions.

## What You Are Building

You are not modifying the application code. Instead, you will:

1. Create a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs the existing test suite on pull requests to main.
2. Configure branch protection rules so failing checks block merges.
3. Demonstrate the pipeline working with both a passing and failing run.

See **[GUIDE.md](GUIDE.md)** for detailed step-by-step instructions covering rubric criteria 1 through 3.

Rubric criteria 4 and 5 are reflective writing tasks to be addressed in a separate paper.

## Assignment Tasks

| # | Task | File | RC |
|---|------|------|----|
| TODO-1 | Create a GitHub Actions workflow that runs the existing test suite on pull requests to main. Include stages for installing dependencies, running backend unit tests, building the frontend, and running end-to-end tests. | `.github/workflows/ci.yml` | RC 1 |

## Rubric Criteria

| RC | Description | Coding |
|----|-------------|--------|
| RC 1 | Implement a CI/CD pipeline that protects the main branch. Include a workflow file that defines the pipeline stages, what each stage checks and why it belongs in the pipeline, and how the pipeline is configured so that failing checks block unsafe integration to main. | Yes |
| RC 2 | Verify the pipeline with a passing run. Include evidence of a passing pipeline run that confirms the pipeline works on the current codebase and evidence of the final build artifact running successfully. | No |
| RC 3 | Verify the pipeline catches a failing change. Include a new feature branch with a change that should cause the pipeline to fail, a pull request from the feature branch to main, and evidence that the pipeline detected the failure and blocked the merge. | No |
| RC 4 | Summarize what the pipeline results show about reliable integration. Include what the passing and failing pipeline results reveal about how CI/CD protects code quality, how CI/CD pipelines support developer productivity beyond catching bugs, and what risks remain even when all pipeline checks pass. | No |
| RC 5 | Describe an improvement you would make to strengthen main-branch protection in the future. | No |

CI pipeline verification branch.
