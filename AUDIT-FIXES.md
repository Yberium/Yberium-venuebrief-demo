# Demo UX hardening

This change set implements the balanced follow-up from the July 2026 audit:

- resets and invalidates downstream state;
- makes the fixed-sample demo boundary explicit;
- stops browser speech recognition when leaving the relevant context;
- improves keyboard and screen-reader behaviour;
- adds individual and bulk Relay copy plus native sharing where supported;
- improves mobile readability;
- versions public assets to reduce stale-cache behaviour;
- strengthens install metadata without adding a service worker;
- adds dependency-free smoke checks in GitHub Actions.
