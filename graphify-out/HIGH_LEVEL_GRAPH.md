# TrekPal High-Level Graph (Cross-App)

```mermaid
flowchart LR
  %% Clients
  T[Traveler App<br/>Flutter]
  A[Agency Portal<br/>React]
  H[Hotel Portal<br/>React]
  AD[Admin Portal<br/>React]

  %% Platform Core
  API[TrekPal Backend API<br/>Node/Express]
  DB[(PostgreSQL / Prisma)]
  WS[Realtime Layer<br/>Socket.IO]
  AUTH[Auth & Role Guard]

  %% Core Domains
  subgraph DOMAIN[Domain Modules]
    BKG[Bookings]
    PKG[Packages / Trip Offers]
    HOT[Hotels / Rooms]
    VEH[Transport / Vehicles]
    BID[Bids / Trip Requests]
    CHAT[Chat / Trip Groups]
    USR[Users / Profiles / KYC]
    ADM[Admin Ops / Approvals / Reports]
  end

  %% Client -> API
  T --> API
  A --> API
  H --> API
  AD --> API

  %% Backend internals
  API --> AUTH
  API --> WS
  API --> DB

  %% API -> domain routing
  API --> BKG
  API --> PKG
  API --> HOT
  API --> VEH
  API --> BID
  API --> CHAT
  API --> USR
  API --> ADM

  %% Cross-domain flows
  BID --> BKG
  PKG --> BKG
  HOT --> BKG
  HOT --> PKG
  VEH --> PKG
  USR --> BKG
  CHAT --> PKG

  %% Realtime consumers
  WS --> T
  WS --> A
  WS --> H
```

## Graphify-Derived Hotspots

- Traveler app strongest hubs: `flutter/material.dart`, `provider`, shared formatters/loading widgets.
- Admin portal hotspot: `extractErrorMessage()` around approval/edit workflows.
- Agency portal hotspots: `ChatService`, `validateForm()`, image/room utility flows.
- Hotel portal is small and sparse; primary interactions are auth, rooms, bookings, settings/services.

## Notes

- This is a high-level architectural abstraction built from the generated graphify reports for:
  - `traveler-app/trekpal/lib`
  - `admin-portal/src`
  - `agency-portal/src`
  - `hotel-portal/src`
- For deeper dependency truth, run semantic-rich graphify on docs + code together (`--mode deep`) per app.
