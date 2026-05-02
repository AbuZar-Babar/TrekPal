# Graph Report - C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src  (2026-05-02)

## Corpus Check
- 14 files · ~7,229 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 27 nodes · 16 edges · 12 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `validateUploadFile()` - 2 edges
2. `onSubmit()` - 2 edges
3. `handleSubmit()` - 2 edges
4. `onSubmit()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `onSubmit()`  [INFERRED]
  C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src\modules\services\pages\ServicesPage.tsx → C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\hotel-portal\src\modules\settings\pages\SettingsPage.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.5
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.5
Nodes (2): handleSubmit(), onSubmit()

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.67
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (2): onSubmit(), validateUploadFile()

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

## Knowledge Gaps
- **Thin community `Community 5`** (2 nodes): `App.tsx`, `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `DashboardLayout.tsx`, `DashboardLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (2 nodes): `cn.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (1 nodes): `axios.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `DashboardPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `RoomsPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `useAuthStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._