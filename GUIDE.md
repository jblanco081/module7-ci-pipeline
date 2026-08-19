# Step-by-Step Guide: CI/CD Pipeline for the Module Seven Activity

> **Tip:** This guide is written in Markdown. For a more readable experience, open it in preview mode. In VS Code, open `GUIDE.md` and press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac) to open the preview. You can also click the preview icon (the split-pane icon with a magnifying glass) in the top-right corner of the editor. To see the source and preview side by side, press `Ctrl+K V` (Windows/Linux) or `Cmd+K V` (Mac).

This guide walks you through the steps needed to complete rubric criteria 1, 2, and 3. Each section is labeled with the rubric sub-item it supports so you can connect your work back to the assignment requirements. Rubric criteria 4 and 5 are reflective writing tasks that you will address in a separate paper — see your README for the full rubric overview.

## Part 1: Setting Up Your GitHub Repository

Before you can use GitHub Actions, your code needs to live in a GitHub repository.

> **Working locally instead of in Codio?** Confirm git is installed by running `git --version` in a terminal. If you see a version number, you're ready. Otherwise, install git:
>
> - **macOS**: Run `git --version` and accept the prompt to install the Xcode Command Line Tools, or install [Git for Mac](https://git-scm.com/download/mac).
> - **Windows**: Install [Git for Windows](https://git-scm.com/download/win). Use the included "Git Bash" terminal for the commands in this guide.
> - **Linux**: Install via your package manager — e.g. `sudo apt install git` (Debian/Ubuntu) or `sudo dnf install git` (Fedora).
>
> Every other step in this guide works the same whether you're in Codio or on your own machine.

**Step 1: Create a new repository on GitHub.**

Go to github.com and sign in to your account.

Click the "+" icon in the top right corner and select "New repository."

Give your repository a name that reflects the project.

Ensure the repository is set to private.

Do not initialize the repository with a README, .gitignore, or license since your project already has files.

Click "Create repository." On the next page, note the SSH URL — it looks like `git@github.com:your-username/your-repo-name.git`. You will need this in Step 4.

**Step 2: Configure your git identity.**

Git needs to know who you are before it will let you commit.

> **Check first:** Run these two commands:
> ```
> git config --global --get user.name
> git config --global --get user.email
> ```
> If both print values you recognize (ideally the name and email on your GitHub account), your identity is already set — skip ahead to Step 3.

Otherwise, set them now. These write to your global git config and apply to every repository on this machine:

```
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email address that's on your GitHub account so your commits link back to your profile.

**Step 3: Set up SSH access to GitHub.**

GitHub requires SSH keys for pushing code from the command line.

> **Check first:** Run `ssh -T git@github.com`. If the response is `Hi your-username! You've successfully authenticated`, SSH is already configured for your GitHub account — skip ahead to Step 4. (A "Permission denied (publickey)" response, or a prompt asking about a host's authenticity, means you need to continue with the setup below.)

Generate a new SSH key (press Enter to accept the defaults when prompted):

```
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Start the SSH agent and add your key:

```
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Copy your public key to your clipboard:

```
cat ~/.ssh/id_ed25519.pub
```

Add the key to GitHub:

1. Go to GitHub > Settings (click your profile picture, then "Settings").
2. In the left sidebar, click "SSH and GPG keys."
3. Click "New SSH key."
4. Give it a title (e.g., "Codio"), paste your public key, and click "Add SSH key."

Verify the connection:

```
ssh -T git@github.com
```

You should see a message like "Hi your-username! You've successfully authenticated."

> **Using VS Code's Source Control panel:** The Source Control icon in the left sidebar (the branching icon) uses the same git identity and SSH key you just configured in the terminal. Once `ssh -T git@github.com` succeeds, the commit, push, and pull buttons in the Source Control panel work without any additional sign-in. If the panel prompts you for GitHub credentials, you likely still have an HTTPS remote — run `git remote -v` and switch to an SSH URL (see "Permission denied (publickey)" in the troubleshooting section below).

**Step 4: Connect your local project to the GitHub repository.**

Open a terminal in your Codio environment.

Navigate to the root of your project directory.

> **Tip:** Make sure your terminal is in the project root directory. Run `pwd` to confirm, and `ls` to verify you see the `backend/`, `frontend/`, and `e2e/` directories.

Your project includes a `.gitignore` file. This tells git which files and directories to leave out of version control — things like `node_modules/` (installed dependencies), `*.db` (database files), and `dist/` (build output). These files are generated locally and should not be committed to your repository. You don't need to modify this file.

Run the following commands, replacing the URL with your own repository's SSH URL from Step 1:

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:your-username/your-repo-name.git
git push -u origin main
```

**Step 5: Verify the push was successful.**

Go to your repository on GitHub and confirm that your project files are visible.

**Verify:** Run these commands to confirm everything is set up correctly:

```
git status              # Should show "On branch main" and "nothing to commit"
git remote -v           # Should show your GitHub URL for both fetch and push
git log --oneline -1    # Should show your "Initial commit"
```

## Part 2: Implementing the CI/CD Pipeline

*This section supports rubric criterion 1: Implement a CI/CD pipeline that protects the main branch.*

GitHub Actions uses workflow files written in YAML to define your pipeline. These files live in a specific directory in your repository. Your project already includes an empty workflow file at `.github/workflows/ci.yml`.

**Step 1: Add the pipeline configuration.**

*This supports rubric criterion 1a: A workflow file that defines the pipeline stages.*

Open `.github/workflows/ci.yml` in your editor and paste the complete workflow file below. Read through the comments carefully before making any changes. Each comment explains what that section does and which rubric criterion it connects to.

*This supports rubric criterion 1a and 1b: A workflow file that defines the pipeline stages, and what each stage checks and why it belongs in the pipeline.*

```yaml
# ============================================================
# CI Pipeline Workflow — Module Seven Activity
# ============================================================
# This file defines your entire CI/CD pipeline. GitHub Actions
# reads this file and runs the stages you define every time
# the trigger conditions are met.
#
# This project has three separate packages, each with
# its own package.json:
#   backend/    — Express API server with unit tests
#   frontend/   — React SPA built with Vite
#   e2e/        — Playwright end-to-end test suite
#
# Each stage below targets the correct directory using
# "working-directory" so that npm commands run in the right
# package.
#
# YAML relies on consistent indentation to define structure.
# Use exactly 2 spaces per indent level. Do not use tabs.
# ============================================================

# ------------------------------------------------------------
# TRIGGER CONFIGURATION
# ------------------------------------------------------------
# The "on" section tells GitHub Actions when to run this
# pipeline. This configuration triggers the pipeline whenever
# a pull request is opened or updated against the main branch.
# ------------------------------------------------------------
name: CI

on:
  pull_request:
    branches:
      - main

# ------------------------------------------------------------
# JOBS
# ------------------------------------------------------------
# A job is a set of steps that run on the same machine. The
# "ci" job below runs on a fresh Ubuntu virtual machine hosted
# by GitHub. All steps within a job share the same filesystem
# and run in sequence. If any step fails, the remaining steps
# are skipped and the job is marked as failed.
# ------------------------------------------------------------
jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      # ------------------------------------------------------
      # SETUP STEPS
      # ------------------------------------------------------
      # These steps prepare the environment before any checks
      # run. "Checkout code" pulls your repository files onto
      # the runner. "Set up Node.js" installs the correct
      # version of Node so your application can run.
      # ------------------------------------------------------
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'

      # ------------------------------------------------------
      # STAGE 1: BACKEND TESTS
      # (Rubric criterion 1a and 1b)
      # ------------------------------------------------------
      # Installs backend dependencies and runs the unit test
      # suite. This catches functional regressions such as
      # broken service logic or incorrect validation before
      # any other stages run.
      # ------------------------------------------------------
      - name: Install backend dependencies
        run: npm install
        working-directory: backend

      - name: Run backend tests
        run: npm test
        working-directory: backend

      # ------------------------------------------------------
      # STAGE 2: FRONTEND BUILD
      # (Rubric criterion 1a and 1b)
      # ------------------------------------------------------
      # Installs frontend dependencies and runs the TypeScript
      # compiler and Vite bundler. This catches type errors,
      # import mistakes, and build failures that would prevent
      # the application from being deployed.
      # ------------------------------------------------------
      - name: Install frontend dependencies
        run: npm install
        working-directory: frontend

      - name: Build frontend
        run: npm run build
        working-directory: frontend

      # ------------------------------------------------------
      # STAGE 3: END-TO-END TESTS
      # (Rubric criterion 1a and 1b)
      # ------------------------------------------------------
      # Installs the e2e test dependencies and the Chromium
      # browser, then runs the full Playwright test suite.
      # These tests start the backend and frontend servers
      # automatically and verify the entire application works
      # together — API integration, user workflows, and
      # concurrent access patterns.
      # ------------------------------------------------------
      - name: Install e2e dependencies
        run: npm install
        working-directory: e2e

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        working-directory: e2e

      - name: Run e2e tests
        run: npx playwright test
        working-directory: e2e

      # ------------------------------------------------------
      # ARTIFACT UPLOADS
      # ------------------------------------------------------
      # After a successful build, the first step uploads the
      # frontend build output as a downloadable artifact. You
      # will download this artifact later to verify that the
      # built application was produced correctly.
      #
      # The second step uploads the Playwright test report
      # only when the pipeline fails, which helps with
      # debugging test failures.
      # ------------------------------------------------------
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: frontend/dist

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: e2e/playwright-report/
          retention-days: 7
```

**Step 2: Commit and push the workflow file.**

```
git add .github/workflows/ci.yml
git commit -m "Add CI pipeline workflow"
git push origin main
```

**Verify:** Run this command to confirm your commit:

```
git log --oneline -3    # Should show "Add CI pipeline workflow" as the latest commit
```

Also check your GitHub repository to confirm the `.github/workflows/ci.yml` file appears.

## Part 3: Configuring Branch Protection

*This section supports rubric criterion 1c: How your pipeline is configured so that failing checks would block unsafe integration to main.*

To ensure that failing pipeline checks actually prevent merging, you need to enable branch protection rules on the main branch. Note that you will need to complete a passing pipeline run (covered in Part 4) before you can select your workflow as a required status check. You may return to this section after completing Part 4 Step 6.

**Step 1:** On your repository page, click "Settings" in the top navigation.

**Step 2:** In the left sidebar, click "Branches" under the "Code and automation" section.

**Step 3:** Click "Add branch protection rule" (or "Add classic branch protection rule" if prompted). In the "Branch name pattern" field, type `main`.

**Step 4:** Check the box for "Require status checks to pass before merging." In the search field that appears, search for `ci` (the job name from your workflow file). Select it to make it a required check.

**Step 5:** Click "Create" or "Save changes" at the bottom of the page.

Now any pull request targeting main must pass the pipeline before the merge button becomes available. When documenting this for rubric criterion 1c, describe how this branch protection rule works together with your pipeline to block unsafe changes.

## Part 4: Verifying the Pipeline with a Passing Run

*This section supports rubric criterion 2: Verify the pipeline with a passing run.*

To trigger the pipeline, you need to open a pull request against main.

**Step 1: Create a test branch.**

> **Tip:** Run `git status` to confirm you are on `main` with no uncommitted changes before creating a new branch.

```
git checkout -b test-pipeline
```

**Step 2: Make a small, harmless change.**

Make a minor change that will not break anything, such as adding a comment to a file:

```
echo "// pipeline test" >> backend/server.ts
```

**Step 3: Commit and push the branch.**

```
git add .
git commit -m "Test pipeline with minor change"
git push origin test-pipeline
```

**Verify:** Run these commands to confirm your branch and commit:

```
git branch              # Should show * test-pipeline and main
git log --oneline -2    # Should show your test commit on top
```

**Step 4: Open a pull request.**

Go to your repository on GitHub. You should see a prompt to open a pull request for the branch you just pushed. Click "Compare & pull request." Set the base branch to `main` and the compare branch to `test-pipeline`. Give the pull request a descriptive title and click "Create pull request."

**Step 5: Observe the pipeline run.**

On the pull request page, you should see a "Checks" section that shows the pipeline running. Click "Details" to watch the pipeline progress through each stage. Wait for all stages to complete successfully.

**Step 6: Capture evidence.**

*This supports rubric criterion 2a: Evidence of a passing pipeline run that confirms the pipeline works on the current codebase.*

Take a screenshot of the passing pipeline run showing all stages completed with green checkmarks.

Note: If you have not yet configured branch protection (Part 3), you may do so now. Your completed pipeline run will make the workflow job available as a required status check.

**Step 7: Download and verify the build artifact.**

*This supports rubric criterion 2b: Evidence of the final build artifact running successfully.*

On the pipeline run summary page, scroll to the "Artifacts" section at the bottom. Download the `build-output` artifact. Extract the downloaded archive — you should see the compiled frontend files (HTML, CSS, and JavaScript) that Vite produced from the React source code. Take a screenshot showing the contents of the extracted artifact to demonstrate that the build stage produced a valid output.

**Step 8: Merge the test pull request.**

After confirming the pipeline passes, merge the pull request to keep your main branch up to date.

## Part 5: Introducing a Failing Change

*This section supports rubric criterion 3: Introduce a failing change and verify the pipeline catches it.*

**Step 1: Create a new feature branch.**

*This supports rubric criterion 3a: A new feature branch with a change that should cause the pipeline to fail.*

> **Tip:** Run `git status` to make sure you have no uncommitted changes before switching branches. If you do, commit them first.

Make sure you are on the main branch and it is up to date:

```
git checkout main
git pull origin main
```

Create and switch to a new branch:

```
git checkout -b breaking-change
```

**Step 2: Introduce a change that will cause a pipeline failure.**

Make a deliberate change that will cause one of your pipeline stages to fail. For example, you could:

- **Break a service function**: In `backend/service.ts`, change the validation in `createPacket` so that it no longer throws when the name is empty. The backend unit tests check this behavior and will fail.
- **Break the frontend build**: Introduce a TypeScript error in a component file (e.g., reference an undefined variable in `frontend/src/components/Home.tsx`). The frontend build stage will fail.
- **Break an API contract**: In `backend/server.ts`, change a route path (e.g., rename `/api/packets` to `/api/seeds`). The e2e tests expect the original paths and will fail.

Choose an approach that aligns with one of the stages in your pipeline so you can clearly identify which stage caught the problem.

**Step 3: Commit and push the breaking change.**

```
git add .
git commit -m "Introduce intentional failing change"
git push origin breaking-change
```

**Verify:** Run these commands to confirm your branch and commit:

```
git branch              # Should show * breaking-change, main, and test-pipeline
git log --oneline -2    # Should show your breaking change commit on top
```

**Step 4: Open a pull request.**

*This supports rubric criterion 3b: A pull request from the feature branch to main.*

Go to your repository on GitHub and open a pull request from `breaking-change` to `main`.

**Step 5: Observe the pipeline failure.**

*This supports rubric criterion 3c: Evidence that the pipeline detected the failure and blocked the merge.*

On the pull request page, watch the "Checks" section. The pipeline should fail at the stage where your breaking change is detected. Notice that the merge button is either disabled or shows a warning indicating that required checks have not passed.

**Step 6: Capture evidence.**

Take a screenshot showing the failed pipeline run, including which stage failed.

Take a screenshot showing that the merge is blocked on the pull request page.

## Summary of Rubric Connections

- **Rubric criterion 1a**: Covered in Part 2, where you create the workflow file. The YAML file with comments defines all pipeline stages.
- **Rubric criterion 1b**: Covered in Part 2. Use the inline comments as a starting point, but write your own explanation of what each stage checks and why it matters.
- **Rubric criterion 1c**: Covered in Part 3, where you configure branch protection so failing checks block merges.
- **Rubric criterion 2a**: Covered in Part 4, Steps 1–6, where you trigger a passing pipeline run and capture evidence.
- **Rubric criterion 2b**: Covered in Part 4, Step 7, where you download the build artifact and verify its contents.
- **Rubric criterion 3a**: Covered in Part 5, Steps 1–2, where you create a feature branch with a failing change.
- **Rubric criterion 3b**: Covered in Part 5, Step 4, where you open a pull request.
- **Rubric criterion 3c**: Covered in Part 5, Steps 5–6, where you capture evidence that the pipeline caught the failure and blocked the merge.

## About Rubric Criteria 4 and 5

Rubric criteria 4 and 5 are reflective writing tasks — no additional code or configuration is needed. In a separate paper, you will write responses based on your experiences completing Parts 1 through 5 of this guide:

- **Criterion 4**: Summarize what the pipeline results show about reliable integration, how CI/CD supports developer productivity, and what risks remain even when checks pass.
- **Criterion 5**: Describe an improvement you would make to strengthen main-branch protection in the future.
## Troubleshooting Common Git Issues

If you run into problems with git commands during this guide, check the list below for your error message and the recommended fix.

> **General tip:** Always run `git status` before and after git commands to confirm you're on the right branch and your working directory is in the expected state.

### "fatal: remote origin already exists"

You ran `git remote add origin` more than once. To fix this, update the existing remote URL instead:

```
git remote set-url origin git@github.com:your-username/your-repo-name.git
```

### "error: Your local changes would be overwritten"

You have uncommitted changes and git won't let you switch branches. Either commit your changes first:

```
git add .
git commit -m "WIP"
```

Or stash them temporarily:

```
git stash
git checkout other-branch
# ... do your work, then come back and restore:
git checkout original-branch
git stash pop
```

### "fatal: a branch named 'X' already exists"

The branch was already created. Switch to it without the `-b` flag:

```
git checkout X
```

Or, if you want to start the branch over from scratch, delete it and recreate it:

```
git branch -D X
git checkout -b X
```

### "Author identity unknown" or "Please tell me who you are"

You haven't set your git identity yet. Run:

```
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Then retry your commit.

### "Everything up-to-date" but changes are not on GitHub

You likely forgot to add or commit before pushing. Check your status and then add and commit:

```
git status              # Check for uncommitted changes
git add .
git commit -m "Your commit message"
git push origin your-branch
```

### "Permission denied (publickey)" or authentication failures on push

Your SSH key is not set up correctly. Work through these checks in order:

1. Verify your key exists: `ls ~/.ssh/id_ed25519.pub` — if this says "No such file," go back to Part 1 Step 3 and generate a key.
2. Make sure the SSH agent is running and has your key:
   ```
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```
3. Test the connection: `ssh -T git@github.com` — you should see "Hi your-username! You've successfully authenticated."
4. If the test fails, confirm that you added your public key to GitHub (Settings > SSH and GPG keys). Copy the output of `cat ~/.ssh/id_ed25519.pub` and add it as a new SSH key.
5. Make sure your remote is using an SSH URL, not HTTPS:
   ```
   git remote -v    # Should show git@github.com:..., not https://
   git remote set-url origin git@github.com:your-username/your-repo-name.git
   ```

### "error: failed to push some refs"

The remote branch has changes that you don't have locally. Pull the remote changes first, then push again:

```
git pull origin your-branch
git push origin your-branch
```

If `git pull` opens a merge commit message in your editor, save and close it to complete the merge.
