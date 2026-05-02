# Graph Report - C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\backend\prisma  (2026-05-02)

## Corpus Check
- 1 files · ~3,803 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 16 nodes · 31 edges · 2 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]

## God Nodes (most connected - your core abstractions)
1. `main()` - 12 edges
2. `ensureAuthUser()` - 6 edges
3. `upsertAdmin()` - 3 edges
4. `upsertTravelers()` - 3 edges
5. `upsertAgencies()` - 3 edges
6. `isDuplicateError()` - 2 edges
7. `findAuthUserByEmail()` - 2 edges
8. `upsertHotels()` - 2 edges
9. `upsertVehicles()` - 2 edges
10. `upsertPackages()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `upsertAdmin()`  [EXTRACTED]
  C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\backend\prisma\seed.ts → C:\Users\AbuZar\Desktop\Fyp\trek pal\Trekpal\backend\prisma\seed.ts  _Bridges community 1 → community 0_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.38
Nodes (9): main(), upsertBids(), upsertChatData(), upsertCompletedReview(), upsertHotels(), upsertPackageBookings(), upsertPackages(), upsertTripRequests() (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.33
Nodes (6): ensureAuthUser(), findAuthUserByEmail(), isDuplicateError(), upsertAdmin(), upsertAgencies(), upsertTravelers()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.257) - this node is a cross-community bridge._
- **Why does `ensureAuthUser()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `upsertAdmin()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._