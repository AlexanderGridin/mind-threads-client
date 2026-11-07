# CI pipeline and GitHub Pages publishing: Mind Threads client

**Type:** Technical / enabler story · **Status:** Reviewed and Approved · **Created:** 2026-11-07

## Story

In order to stop broken or vulnerable changes from reaching `main` and to have a hosted version of the app that can be shared by URL,
we need to set up a GitHub Actions pipeline that audits dependencies, runs unit tests with coverage checks, builds the app, and publishes it to GitHub Pages, and to protect `main` so that changes only arrive through pull requests.

## Problem / rationale

- The repo has no automated checks. Audit, tests, and builds only run if someone remembers to run them locally.
- A broken or vulnerable change can reach `main` today, because nothing blocks a merge or a direct push.
- There is no hosted version of the app, so sharing it means running it locally.

## Enables

- Sharing the app through a public URL, with every merge into `main` published automatically.
- Follow-up story: add lint and formatting checks to the pipeline. These checks are not part of this story.

## Acceptance criteria

### Prerequisites

- Given pipeline work has not started, when the repo's full history is checked for secrets, then every secret found is revoked and removed before pipeline work starts.
- Given the secrets check is complete, when the repo settings are reviewed, then the repo is public and GitHub Pages is enabled.

### Pipeline triggers and order

- Given a pull request targeting `main` is opened or updated, when the pipeline runs, then Audit, Tests, and Build run in that order.
- Given a pull request targeting `main` is opened or updated, when the pipeline runs, then Publish does not run.
- Given a pull request is merged into `main`, when the pipeline runs, then Audit, Tests, Build, and Publish run in that order.
- Given two pull requests are merged into `main` in quick succession, when both pipeline runs finish, then the published site shows the newer merge.
- Given the current `main`, with 10 moderate advisories, no high or critical ones, and coverage above the configured thresholds, when the pipeline runs for the first time after setup, then all four steps pass.

### Audit

- Given a dependency has at least one critical advisory, when Audit runs, then Audit fails.
- Given a dependency has at least one high advisory, when Audit runs, then Audit fails.
- Given dependencies only have low or moderate advisories, when Audit runs, then Audit passes.

### Tests

- Given a unit test fails, when Tests runs, then Tests stops at the first failed test and fails.
- Given all unit tests pass and coverage is below the project's configured threshold for lines, functions, branches, or statements (currently 90% each), when Tests runs, then Tests fails.
- Given all unit tests pass and coverage meets the configured threshold for lines, functions, branches, and statements, when Tests runs, then Tests passes.
- Given a configured coverage threshold is changed in the project, when Tests runs, then Tests applies the new value without a pipeline change.

### Build

- Given the project has a TypeScript error, when Build runs, then Build fails.
- Given the production build cannot complete, when Build runs, then Build fails.
- Given a production build includes unit test files, test helpers, mocks, or test fixtures, when Build runs, then Build fails.
- Given no TypeScript errors and no test code in the output, when Build runs, then Build passes.

### Publish

- Given Audit, Tests, and Build passed after a merge into `main`, when Publish finishes, then `https://alexandergridin.github.io/mind-threads-client/` serves the version built from that merge.

### Published app

- Given the site is published, when a visitor opens `https://alexandergridin.github.io/mind-threads-client/`, then the dashboard page is displayed.
- Given a thread is saved in the visitor's browser, when the visitor opens that thread from the dashboard, then the thread page is displayed under `https://alexandergridin.github.io/mind-threads-client/`.
- Given a thread is saved in the visitor's browser, when the visitor opens that thread's link directly in a new tab, then the thread page is displayed instead of a GitHub 404 page.
- Given a visitor is on a thread page, when the visitor reloads the page, then the same thread page is displayed instead of a GitHub 404 page.

### Branch protection and merge rules

- Given `main` is protected, when anyone, including a repo admin, pushes directly to `main`, then the push is rejected.
- Given Audit, Tests, or Build failed on a pull request, when someone tries to merge it into `main`, then the merge is blocked.
- Given Audit, Tests, and Build passed on a pull request with no reviewer approval, when someone tries to merge it into `main`, then the merge is allowed.

### Regression and documentation

- Given this story is complete, when a developer starts the app locally, then the dashboard page is displayed at the local development URL.
- Given this story is complete, when the existing unit test suite runs, then all tests pass.
- Given this story is complete, when a developer reads the project README, then it describes the four pipeline steps, the `main` branch rules, the published site URL, and the rollback steps.

### Error handling and user feedback

- Given any step fails, when the pipeline stops, then the steps after it do not run.
- Given a step fails on a pull request, when a developer opens the pull request, then a failed check is shown.
- Given a step fails after a merge into `main`, when a developer opens the merge commit, then a failed check is shown.
- Given a step fails, when a developer opens the pipeline run, then the failed step and its logs are visible.
- Given a step fails, when the pipeline run ends, then GitHub's standard failure notification is sent according to the developer's notification settings. No custom alerts are added.
- Given Audit, Tests, Build, or Publish fails after a merge into `main`, when a visitor opens the published site, then the previously published version is still served.

## Risks & rollback

- Bad version published: open and merge a pull request that reverts the change, and the pipeline republishes the earlier code. A rollback takes one pull request run and one run after the merge, so it is not instant.
- Rollback blocked: a revert cannot merge if Audit, Tests, or Build fails on its pull request. The failing step has to be fixed first.
- New critical or high advisory: a newly announced advisory at either level can block unrelated pull requests, including urgent fixes, until the dependency is fixed. High advisories are more frequent than critical ones, so this block will happen more often than with a critical-only rule.
- Coverage drop: a change that lowers coverage below a configured threshold blocks its own pull request until tests are added.
- Lower-severity advisories: low and moderate advisories do not fail the pipeline by design, including the 10 moderate ones present today. They still need separate follow-up.
- Public source code: once the repo is public, its code and history are open to anyone and may be cached or copied even if it later goes private. The secrets check is the mitigation.
- Public site: anyone with the URL can open the published app. This includes the internal colors demo page, which stays reachable.
- Shared browser storage: threads are saved in the visitor's browser under the `alexandergridin.github.io` address, which every GitHub Pages project site on this account shares. Another project site on this account could read or overwrite them.
- Actions usage: the pipeline runs on every pull request update and every merge into `main`. Public repos have no Actions minutes limit, so this adds no cost.
