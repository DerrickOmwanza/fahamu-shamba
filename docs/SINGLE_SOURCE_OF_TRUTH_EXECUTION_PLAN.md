# Fahamu Shamba - Single Source of Truth (SSOT) Execution Plan

## Objective
Stabilize the project for production by enforcing one runtime architecture, removing conflicting paths, and shipping through a controlled sequence with acceptance gates.

## SSOT Decision
Use this architecture as the only production source of truth:

1. Backend API + page serving: `backend/server.js`
2. Web UI assets: root `public/`
3. Database: `backend/fahamu_shamba.db` for dev, managed DB for prod
4. Android app (near-term): WebView wrapper loading production web URL

Defer/disable parallel production tracks:

1. `api/` serverless market endpoints (Vercel Functions)
2. Expo app as production client
3. Duplicate/legacy deployment configs that route differently

## Keep vs Remove

### Keep (Authoritative)
1. `backend/server.js`
2. `backend/*.js` feature modules used by server
3. `backend/auth-routes.js`, `backend/admin-routes.js`, `backend/community-routes.js`, `backend/market-routes.js`, `backend/feedback-routes.js`, `backend/farmer-profile-routes.js`, `backend/farmer-routes.js`
4. Root `public/` pages, JS, translations, manifest, service worker
5. Android Studio project under `android-studio/FahamuShamba` (WebView app)
6. One production deployment config file (final choice below)

### Remove or Archive (Non-Authoritative)
1. `api/` folder serverless handlers for market (`api/market/*.js`) after migration of any needed logic to backend
2. Either `vercel.json` or `VERCEL_CONFIG_FINAL.json` (keep one only)
3. Docs claiming conflicting runtime paths or outdated architecture claims
4. Expo mobile app from production scope:
   - Keep code in repo as `experimental`
   - Remove from release checklist and deployment pipeline
5. Generated IDE/build artifacts from version control:
   - `android-studio/FahamuShamba/.gradle/`
   - `android-studio/FahamuShamba/build/`
   - `.idea/` files not intentionally shared

## Non-Negotiable Production Rules
1. No duplicate endpoint ownership across `backend/` and `api/`
2. No route serving from non-existent directories
3. One deployment topology documented and enforced
4. One auth flow behavior in UI (no mixed demo-only and API auth on same path)
5. Every release passes pre-defined smoke and regression checks

## Exact Execution Order

### Phase 0 - Freeze and Branch (Day 0)
1. Create stabilization branch: `stabilize/ssot-production`
2. Freeze feature work until Phase 5 completes
3. Capture baseline:
   - endpoint inventory
   - page inventory
   - current deployment behavior
4. Define release owner and rollback owner

Gate:
1. Branch created
2. No new feature commits on main

### Phase 1 - Runtime Consolidation (Day 1)
1. In `backend/server.js`, make root `public/` the only static/UI source
2. Remove references to `backend/public` paths and missing files
3. Ensure all intended feature routers are mounted:
   - `farmerRoutes` currently imported must be explicitly mounted
4. Remove duplicate/conflicting root routes; keep one canonical `/`
5. Normalize API namespace to one pattern under `/api/*`

Gate:
1. `GET /`, `/login`, `/dashboard`, `/market`, `/recommendations` return expected pages
2. `GET /api/health` and `GET /api/test` green
3. `GET/POST` endpoints for auth, market, community, feedback, farmer profile reachable

### Phase 2 - Deployment Topology Unification (Day 1-2)
1. Choose exactly one deployment descriptor:
   - Recommended: keep `vercel.json`, remove `VERCEL_CONFIG_FINAL.json`
2. Route all API traffic to `backend/server.js`
3. Remove `api/` serverless route rewrites and cron dependencies
4. Move any required market cron behavior into backend scheduled job strategy (or external scheduler hitting backend endpoint)

Gate:
1. One config file controls deployment
2. No active dependency on `api/market/*.js`
3. Preview deployment serves web + backend from same topology

### Phase 3 - Auth and UX Consistency (Day 2)
1. Pick one login mode for production:
   - API-backed auth (recommended), not demo localStorage bypass
2. Update `public/login.html` and related pages to same auth contract
3. Ensure token usage and logout behavior consistent across pages
4. Remove or explicitly label demo-only flows behind non-production flag

Gate:
1. Login -> dashboard -> protected API works with real token
2. Logout clears session and blocks protected endpoints

### Phase 4 - Repo Hygiene and CI Safety (Day 2-3)
1. Add/update `.gitignore` for Android/IDE generated artifacts
2. Remove tracked generated files from git index
3. Add scripts:
   - `npm run smoke` (API health + key endpoints)
   - `npm run lint` if available
4. Add minimal CI checks on PR:
   - server start
   - smoke tests

Gate:
1. Clean `git status` after build artifacts ignored
2. CI passes on stabilization branch

### Phase 5 - Production Validation (Day 3)
1. Run smoke test matrix:
   - Auth
   - Prediction
   - Market prices/trends
   - Community read/write
   - Feedback submit/read
2. Validate mobile web responsiveness on key pages
3. Validate Android WebView app against production URL
4. Confirm monitoring and logs:
   - error rate
   - endpoint latency
   - auth failures

Gate:
1. All critical journeys pass
2. No Sev-1/Sev-2 open issues
3. Rollback plan tested

### Phase 6 - Cutover and Lock (Day 4)
1. Merge stabilization branch
2. Tag release: `v1.0-ssot`
3. Deploy production
4. Lock architecture in docs:
   - one architecture diagram
   - one start guide
   - one deployment guide
5. Archive deprecated files and docs in `/archive/legacy-paths/`

Gate:
1. Production stable for 24h
2. No route mismatch incidents
3. Team using one runbook

## Immediate Task List (First 10 tasks)
1. Mount `farmerRoutes` in `backend/server.js`
2. Remove/repair all `backend/public` sendFile references
3. Collapse duplicate root route declarations into one
4. Choose final homepage file (`public/index.html` or `public/landing-page.html`) and enforce
5. Choose one Vercel config file and delete the other
6. Remove `api/` rewrites from deployment config
7. Convert `public/login.html` from demo auth to backend auth
8. Add `.gitignore` entries for Android build/IDE files
9. Remove tracked generated Android files from git
10. Run and record smoke test results before merge

## Definition of Done
1. Single deploy path
2. Single endpoint ownership model
3. Single auth behavior in production UI
4. Clean repository hygiene
5. Reproducible deployment with one checklist
6. Production runbook reflects actual code behavior

## Risk Register
1. Risk: Hidden dependency on `api/market/*`
   - Mitigation: endpoint traffic scan + remove rewrites only after parity check
2. Risk: Auth regression when removing demo flow
   - Mitigation: phased toggle and smoke tests
3. Risk: Route breakage from sendFile path cleanup
   - Mitigation: page-by-page route verification script
4. Risk: Docs/code drift returns
   - Mitigation: docs update required in release checklist

## Ownership Model
1. Backend owner: route/API integrity and DB migrations
2. Frontend owner: page routing, auth UX, responsive QA
3. Mobile owner: Android WebView packaging and release
4. Release owner: deployment config, CI gate, rollback execution

## Final Recommendation
Ship production on one unified web backend (`backend/server.js` + root `public/`) and treat Android as a delivery shell over that stable web surface. Reintroduce Expo/native as Phase 2 only after SSOT is stable in production.
