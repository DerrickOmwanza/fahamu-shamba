## Retired API Surface

This directory previously contained an alternate Vercel API implementation.

The supported runtime for Fahamu Shamba is now:

- `backend/server.js`

Why this folder is retained:

- to document that the old `api/` deployment path has been retired
- to prevent future drift between two separate backend entrypoints

Do not add new runtime code here. Add backend routes and handlers under:

- `backend/`
