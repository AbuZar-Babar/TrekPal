# Graph Report - admin-portal  (2026-04-27)

## Corpus Check
- Corpus is ~19,786 words - fits in a single context window. You may not need a graph.

## Summary
- 146 nodes · 100 edges · 66 communities detected
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.83)
- Token cost: 8,200 input · 1,400 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Agency & User Management|Agency & User Management]]
- [[_COMMUNITY_Auth Guard & API Client|Auth Guard & API Client]]
- [[_COMMUNITY_Formatters Utility|Formatters Utility]]
- [[_COMMUNITY_App Routing & Protected Routes|App Routing & Protected Routes]]
- [[_COMMUNITY_Dashboard Hooks & Analytics|Dashboard Hooks & Analytics]]
- [[_COMMUNITY_Agency Card Component|Agency Card Component]]
- [[_COMMUNITY_Hotel Approval Flow|Hotel Approval Flow]]
- [[_COMMUNITY_Vehicle Approval Flow|Vehicle Approval Flow]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_Shared API Hooks|Shared API Hooks]]
- [[_COMMUNITY_Core Domain Types|Core Domain Types]]
- [[_COMMUNITY_Error Handler Utility|Error Handler Utility]]
- [[_COMMUNITY_Agencies Data Hook|Agencies Data Hook]]
- [[_COMMUNITY_Admin Login Form|Admin Login Form]]
- [[_COMMUNITY_Auth Hook|Auth Hook]]
- [[_COMMUNITY_Auth Store Slice|Auth Store Slice]]
- [[_COMMUNITY_Hotels Data Hook|Hotels Data Hook]]
- [[_COMMUNITY_Inventory Page|Inventory Page]]
- [[_COMMUNITY_Report Charts|Report Charts]]
- [[_COMMUNITY_Reports Data Hook|Reports Data Hook]]
- [[_COMMUNITY_Admin Portal Src Modules Users|Admin Portal Src Modules Users]]
- [[_COMMUNITY_Admin Portal Src Modules Vehic|Admin Portal Src Modules Vehic]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Hooks|Admin Portal Src Shared Hooks ]]
- [[_COMMUNITY_Admin Portal Src Shared Theme|Admin Portal Src Shared Theme ]]
- [[_COMMUNITY_Types Travelerkycstatus|Types Travelerkycstatus]]
- [[_COMMUNITY_Admin Portal Postcss Config Js|Admin Portal Postcss Config Js]]
- [[_COMMUNITY_Admin Portal Tailwind Config J|Admin Portal Tailwind Config J]]
- [[_COMMUNITY_Admin Portal Vite Config Ts|Admin Portal Vite Config Ts]]
- [[_COMMUNITY_Admin Portal Src Main Tsx|Admin Portal Src Main Tsx]]
- [[_COMMUNITY_Admin Portal Src Vite Env D Ts|Admin Portal Src Vite Env D Ts]]
- [[_COMMUNITY_Admin Portal Src Modules Activ|Admin Portal Src Modules Activ]]
- [[_COMMUNITY_Admin Portal Src Modules Agenc|Admin Portal Src Modules Agenc]]
- [[_COMMUNITY_Admin Portal Src Modules Agenc|Admin Portal Src Modules Agenc]]
- [[_COMMUNITY_Admin Portal Src Modules Auth|Admin Portal Src Modules Auth ]]
- [[_COMMUNITY_Admin Portal Src Modules Dashb|Admin Portal Src Modules Dashb]]
- [[_COMMUNITY_Admin Portal Src Modules Dashb|Admin Portal Src Modules Dashb]]
- [[_COMMUNITY_Admin Portal Src Modules Hotel|Admin Portal Src Modules Hotel]]
- [[_COMMUNITY_Admin Portal Src Modules Hotel|Admin Portal Src Modules Hotel]]
- [[_COMMUNITY_Admin Portal Src Modules Hotel|Admin Portal Src Modules Hotel]]
- [[_COMMUNITY_Admin Portal Src Modules Repor|Admin Portal Src Modules Repor]]
- [[_COMMUNITY_Admin Portal Src Modules Repor|Admin Portal Src Modules Repor]]
- [[_COMMUNITY_Admin Portal Src Modules Repor|Admin Portal Src Modules Repor]]
- [[_COMMUNITY_Admin Portal Src Modules Users|Admin Portal Src Modules Users]]
- [[_COMMUNITY_Admin Portal Src Modules Users|Admin Portal Src Modules Users]]
- [[_COMMUNITY_Admin Portal Src Modules Vehic|Admin Portal Src Modules Vehic]]
- [[_COMMUNITY_Admin Portal Src Modules Vehic|Admin Portal Src Modules Vehic]]
- [[_COMMUNITY_Admin Portal Src Modules Vehic|Admin Portal Src Modules Vehic]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Compon|Admin Portal Src Shared Compon]]
- [[_COMMUNITY_Admin Portal Src Shared Hooks|Admin Portal Src Shared Hooks ]]
- [[_COMMUNITY_Admin Portal Src Shared Servic|Admin Portal Src Shared Servic]]
- [[_COMMUNITY_Admin Portal Src Shared Types|Admin Portal Src Shared Types ]]
- [[_COMMUNITY_Admin Portal Src Store Index T|Admin Portal Src Store Index T]]
- [[_COMMUNITY_Admin Portal Src Store Rootred|Admin Portal Src Store Rootred]]
- [[_COMMUNITY_Types User|Types User]]
- [[_COMMUNITY_Architecture Antipatterns|Architecture Antipatterns]]

## God Nodes (most connected - your core abstractions)
1. `extractErrorMessage()` - 7 edges
2. `API Client (Axios)` - 5 edges
3. `ProtectedRoute()` - 4 edges
4. `refreshAgencies()` - 4 edges
5. `refreshUsers()` - 4 edges
6. `handleApprove()` - 3 edges
7. `handleReject()` - 3 edges
8. `handleSave()` - 3 edges
9. `refreshList()` - 3 edges
10. `handleApprove()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `401 Unauthorized Redirect` --semantically_similar_to--> `ProtectedRoute()`  [INFERRED] [semantically similar]
  admin-portal/src/shared/services/apiClient.ts → admin-portal\src\App.tsx
- `Service Layer Pattern` --rationale_for--> `API Client (Axios)`  [INFERRED]
  admin-portal/docs/ARCHITECTURE_PATTERNS.md → admin-portal/src/shared/services/apiClient.ts
- `handleApprove()` --calls--> `extractErrorMessage()`  [INFERRED]
  admin-portal\src\modules\agencies\components\AgencyList.tsx → admin-portal\src\shared\utils\errors.ts
- `handleReject()` --calls--> `extractErrorMessage()`  [INFERRED]
  admin-portal\src\modules\agencies\components\AgencyList.tsx → admin-portal\src\shared\utils\errors.ts
- `handleSave()` --calls--> `extractErrorMessage()`  [INFERRED]
  admin-portal\src\modules\agencies\components\AgencyList.tsx → admin-portal\src\shared\utils\errors.ts

## Hyperedges (group relationships)
- **Shared API Hook Layer** — useapiquery_standardfetching, useapimutation_mutations, useapipagination_paginationhook [EXTRACTED 0.95]
- **Approvable Entities (Agency/Hotel/Vehicle)** — types_agency, types_hotel, types_vehicle [INFERRED 0.90]
- **Authentication Guard System** — app_protectedroute, apiclient_authtokeninterceptor, apiclient_401redirect [INFERRED 0.85]

## Communities

### Community 0 - "Agency & User Management"
Cohesion: 0.24
Nodes (11): handleApprove(), handleReject(), handleSave(), refreshAgencies(), extractErrorMessage(), getDateInputValue(), handleApprove(), handleReject() (+3 more)

### Community 1 - "Auth Guard & API Client"
Cohesion: 0.2
Nodes (11): 401 Unauthorized Redirect, Auth Token Interceptor, API Client (Axios), Component-Hook-Service-API Data Flow, Error Handling Pattern, Standardized Module Structure, Service Layer Pattern, Paginated Response Generic (+3 more)

### Community 2 - "Formatters Utility"
Cohesion: 0.22
Nodes (3): formatTravelerKycStatus(), toTitleCase(), toneToClass()

### Community 3 - "App Routing & Protected Routes"
Cohesion: 0.33
Nodes (4): ProtectedRoute(), App Routing Config, Redux Store, Root State Type

### Community 4 - "Dashboard Hooks & Analytics"
Cohesion: 0.4
Nodes (0): 

### Community 5 - "Agency Card Component"
Cohesion: 0.5
Nodes (0): 

### Community 6 - "Hotel Approval Flow"
Cohesion: 0.83
Nodes (3): handleApprove(), handleReject(), refreshList()

### Community 7 - "Vehicle Approval Flow"
Cohesion: 0.83
Nodes (3): handleApprove(), handleReject(), refreshList()

### Community 8 - "Error Boundary"
Cohesion: 0.5
Nodes (0): 

### Community 9 - "Shared API Hooks"
Cohesion: 0.5
Nodes (2): useApiPagination(), useApiQuery()

### Community 10 - "Core Domain Types"
Cohesion: 0.5
Nodes (4): Agency Interface, Dashboard Stats Interface, Hotel Interface, Vehicle Interface

### Community 11 - "Error Handler Utility"
Cohesion: 1.0
Nodes (2): getErrorMessage(), handleApiError()

### Community 12 - "Agencies Data Hook"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Admin Login Form"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Auth Hook"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Auth Store Slice"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Hotels Data Hook"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Inventory Page"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Report Charts"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Reports Data Hook"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Admin Portal Src Modules Users"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Admin Portal Src Modules Vehic"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Admin Portal Src Shared Hooks "
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Admin Portal Src Shared Theme "
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Types Travelerkycstatus"
Cohesion: 1.0
Nodes (2): Traveler KYC Status, User Profile Interface

### Community 30 - "Admin Portal Postcss Config Js"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Admin Portal Tailwind Config J"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Admin Portal Vite Config Ts"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Admin Portal Src Main Tsx"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Admin Portal Src Vite Env D Ts"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Admin Portal Src Modules Activ"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Admin Portal Src Modules Agenc"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Admin Portal Src Modules Agenc"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Admin Portal Src Modules Auth "
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Admin Portal Src Modules Dashb"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Admin Portal Src Modules Dashb"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Admin Portal Src Modules Hotel"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Admin Portal Src Modules Hotel"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Admin Portal Src Modules Hotel"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Admin Portal Src Modules Repor"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Admin Portal Src Modules Repor"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Admin Portal Src Modules Repor"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Admin Portal Src Modules Users"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Admin Portal Src Modules Users"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Admin Portal Src Modules Vehic"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Admin Portal Src Modules Vehic"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Admin Portal Src Modules Vehic"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Admin Portal Src Shared Compon"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Admin Portal Src Shared Hooks "
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Admin Portal Src Shared Servic"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Admin Portal Src Shared Types "
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Admin Portal Src Store Index T"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Admin Portal Src Store Rootred"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Types User"
Cohesion: 1.0
Nodes (1): User Interface

### Community 65 - "Architecture Antipatterns"
Cohesion: 1.0
Nodes (1): Anti-Patterns to Avoid

## Knowledge Gaps
- **14 isolated node(s):** `App Routing Config`, `Auth Token Interceptor`, `Redux Store`, `User Interface`, `Hotel Interface` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Agencies Data Hook`** (2 nodes): `useAgencies.ts`, `useAgencies()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Login Form`** (2 nodes): `AdminLoginForm.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Hook`** (2 nodes): `useAuth.ts`, `useAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Store Slice`** (2 nodes): `authSlice.ts`, `checkAuthentication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hotels Data Hook`** (2 nodes): `useHotels.ts`, `useHotels()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Inventory Page`** (2 nodes): `InventoryPage.tsx`, `switchType()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Report Charts`** (2 nodes): `ReportCharts.tsx`, `ChartCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Reports Data Hook`** (2 nodes): `useReports.ts`, `useReports()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Users`** (2 nodes): `useUsers.ts`, `useUsers()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Vehic`** (2 nodes): `useVehicles.ts`, `useVehicles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (2 nodes): `ComingSoon.tsx`, `ComingSoon()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (2 nodes): `MetricCard.tsx`, `MetricCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (2 nodes): `SimpleChartCard.tsx`, `SimpleChartCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (2 nodes): `Layout.tsx`, `Layout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (2 nodes): `DocumentGrid.tsx`, `looksLikeImage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Hooks `** (2 nodes): `useApiMutation.ts`, `useApiMutation()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Theme `** (2 nodes): `ThemeProvider.tsx`, `getInitialTheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Types Travelerkycstatus`** (2 nodes): `Traveler KYC Status`, `User Profile Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Postcss Config Js`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Tailwind Config J`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Vite Config Ts`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Main Tsx`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Vite Env D Ts`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Activ`** (1 nodes): `ActivityDashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Agenc`** (1 nodes): `agencyService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Agenc`** (1 nodes): `agencySlice.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Auth `** (1 nodes): `authService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Dashb`** (1 nodes): `Dashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Dashb`** (1 nodes): `dashboardService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Hotel`** (1 nodes): `HotelCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Hotel`** (1 nodes): `hotelService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Hotel`** (1 nodes): `hotelSlice.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Repor`** (1 nodes): `ReportDashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Repor`** (1 nodes): `reportsService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Repor`** (1 nodes): `reportsSlice.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Users`** (1 nodes): `usersService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Users`** (1 nodes): `usersSlice.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Vehic`** (1 nodes): `VehicleCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Vehic`** (1 nodes): `vehiclesService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Modules Vehic`** (1 nodes): `vehiclesSlice.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `ErrorPopup.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `Sidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `EntityEditModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `ManagementPageShell.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `Button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Compon`** (1 nodes): `Input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Hooks `** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Servic`** (1 nodes): `apiClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Shared Types `** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Store Index T`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Portal Src Store Rootred`** (1 nodes): `rootReducer.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Types User`** (1 nodes): `User Interface`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Architecture Antipatterns`** (1 nodes): `Anti-Patterns to Avoid`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `toneToClass()` connect `Formatters Utility` to `Agency & User Management`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `extractErrorMessage()` (e.g. with `handleApprove()` and `handleReject()`) actually correct?**
  _`extractErrorMessage()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `API Client (Axios)` (e.g. with `Service Layer Pattern` and `useApiQuery Hook`) actually correct?**
  _`API Client (Axios)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `App Routing Config`, `Auth Token Interceptor`, `Redux Store` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._