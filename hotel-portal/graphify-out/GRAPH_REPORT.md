# Graph Report - C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal  (2026-04-28)

## Corpus Check
- 16 files · ~9,885 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 26 nodes · 14 edges · 14 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
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
1. `onSubmit()` - 4 edges
2. `validateUploadFile()` - 2 edges
3. `handleSubmit()` - 2 edges
4. `handleSubmit()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `onSubmit()` --calls--> `handleSubmit()`  [INFERRED]
  C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src\modules\auth\pages\RegisterPage.tsx → C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src\modules\services\pages\ServicesPage.tsx
- `onSubmit()` --calls--> `handleSubmit()`  [INFERRED]
  C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src\modules\auth\pages\RegisterPage.tsx → C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src\modules\rooms\pages\RoomsPage.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.5
Nodes (3): onSubmit(), validateUploadFile(), handleSubmit()

### Community 1 - "Community 1"
Cohesion: 0.67
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (1): handleSubmit()

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
- **Thin community `Community 3`** (2 nodes): `App.tsx`, `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (2 nodes): `DashboardLayout.tsx`, `DashboardLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `ServicesPage.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `cn.ts`, `cn()`
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

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `onSubmit()` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `handleSubmit()` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `onSubmit()` (e.g. with `handleSubmit()` and `handleSubmit()`) actually correct?**
  _`onSubmit()` has 2 INFERRED edges - model-reasoned connections that need verification._