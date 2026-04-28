# Graph Report - hotel-portal  (2026-04-29)

## Corpus Check
- Corpus is ~7,541 words - fits in a single context window. You may not need a graph.

## Summary
- 28 nodes · 15 edges · 14 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `onSubmit()` - 3 edges
2. `validateUploadFile()` - 2 edges
3. `onSubmit()` - 2 edges
4. `handleSubmit()` - 2 edges
5. `handleSubmit()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `onSubmit()`  [INFERRED]
  hotel-portal\src\modules\rooms\pages\RoomsPage.tsx → hotel-portal\src\modules\settings\pages\SettingsPage.tsx
- `handleSubmit()` --calls--> `onSubmit()`  [INFERRED]
  hotel-portal\src\modules\services\pages\ServicesPage.tsx → hotel-portal\src\modules\settings\pages\SettingsPage.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (3): handleSubmit(), handleSubmit(), onSubmit()

### Community 1 - "Community 1"
Cohesion: 0.67
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (2): onSubmit(), validateUploadFile()

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 4`** (2 nodes): `App.tsx`, `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `DashboardLayout()`, `DashboardLayout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `cn()`, `cn.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `axios.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `DashboardPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `useAuthStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.