# TrekPal Shared UI

This folder is the shared UI foundation for all portals.

- `styles/tokens.css` holds cross-portal design tokens using the `--tp-*` namespace.
- `styles/portal-layout.css` holds shared authenticated portal shell classes.
- `styles/provider-portal.css` holds the shared provider portal shell/styles used by agency and vehicle portals.
- Portal-specific screens, copy, business workflows, and one-off module CSS should stay inside each portal.

Use this split when adding UI:

1. Put repeated layout primitives, tokens, status colors, buttons, cards, inputs, and portal shell behavior here.
2. Keep feature-specific views in the owning portal.
3. Add portal-specific overrides with `html[data-portal='admin']`, `hotel`, `agency`, or `vehicle` instead of duplicating whole stylesheets.
