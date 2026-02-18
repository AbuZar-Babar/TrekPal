# Repository Pattern Documentation

## 🎯 Purpose

The repository pattern abstracts data access logic from business logic, enabling:
- **Database Flexibility**: Swap PostgreSQL for MySQL, MongoDB, etc. without changing business logic
- **Testability**: Mock repositories for unit testing services
- **Maintainability**: Centralize database query logic
- **Separation of Concerns**: Services focus on business rules, not data access

## 📐 Architecture

```
┌─────────────────────┐
│   Controllers       │  ← HTTP layer
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Services         │  ← Business logic (uses interfaces)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Repository         │  ← Data access abstraction
│  Interfaces         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Prisma Repos       │  ← Concrete implementation (PostgreSQL)
└─────────────────────┘
```

## 📂 Structure

```
backend/src/
├── repositories/
│   ├── index.ts                          # Exports
│   ├── interfaces/
│   │   ├── IRepository.ts                # Base interface
│   │   ├── IAgencyRepository.ts          # Agency operations
│   │   ├── IHotelRepository.ts           # Hotel operations
│   │   ├── IVehicleRepository.ts         # Vehicle operations
│   │   └── IUserRepository.ts            # User operations
│   └── prisma/
│       ├── PrismaAgencyRepository.ts     # Prisma implementation
│       ├── PrismaHotelRepository.ts
│       ├── PrismaVehicleRepository.ts
│       └── PrismaUserRepository.ts
└── modules/
    └── admin/
        └── admin.service.ts              # Uses repository interfaces
```

## 🔧 Current Status

### ✅ Implemented (Admin Module Only)

The repository pattern is implemented **only for the admin module** as a **proof of concept**:

- **Interfaces**: `IAgencyRepository`, `IHotelRepository`, `IVehicleRepository`, `IUserRepository`
- **Implementations**: Prisma-based repositories for all four entities
- **Service Integration**: `AdminService` refactored to use repository interfaces with dependency injection

### ⏳ Not Yet Implemented

Other modules still use direct Prisma access:
- Auth module
- Booking module
- Transport module
- Hotel module
- Trip module

## 💻 Usage Example

### Old Way (Direct Prisma)
```typescript
// ❌ Tightly coupled to Prisma
import { prisma } from '../../config/database';

export class AdminService {
  async getAgencies() {
    return await prisma.agency.findMany({ /* ... */ });
  }
}
```

### New Way (Repository Pattern)
```typescript
// ✅ Decoupled, testable, flexible
import { IAgencyRepository, PrismaAgencyRepository } from '../../repositories';

export class AdminService {
  private agencyRepo: IAgencyRepository;

  constructor(agencyRepo?: IAgencyRepository) {
    this.agencyRepo = agencyRepo || new PrismaAgencyRepository();
  }

  async getAgencies(page: number, limit: number, status?: string, search?: string) {
    const filters = { page, limit, status, search };
    return await this.agencyRepo.findMany(filters);
  }
}
```

## 🧪 Testing Example

```typescript
// Mock implementation for testing
class MockAgencyRepository implements IAgencyRepository {
  async findMany(filters: AgencyFilters) {
    return [ /* mock data */ ];
  }
  // ... other methods
}

// In tests
describe('AdminService', () => {
  it('should fetch agencies', async () => {
    const mockRepo = new MockAgencyRepository();
    const service = new AdminService(mockRepo);
    const result = await service.getAgencies(1, 20);
    expect(result).toBeDefined();
  });
});
```

## 🔄 Switching Databases

To switch from PostgreSQL to MongoDB (example):

1. **Create MongoDB implementation**:
```typescript
// repositories/mongo/MongoAgencyRepository.ts
export class MongoAgencyRepository implements IAgencyRepository {
  async findMany(filters: AgencyFilters) {
    // MongoDB query logic
  }
  // ...
}
```

2. **Update service instantiation**:
```typescript
// OLD: const agencyRepo = new PrismaAgencyRepository();
const agencyRepo = new MongoAgencyRepository(); // NEW
```

3. **No changes needed in**:
   - Controllers
   - Routes
   - Service business logic

## 📚 Interface Overview

### `IRepository<T>`
Base interface with generic CRUD operations:
- `findMany(filters?)`: Get multiple entities
- `findById(id)`: Get single entity
- `create(data)`: Create entity
- `update(id, data)`: Update entity
- `delete(id)`: Delete entity
- `count(filters?)`: Count entities

### Specialized Interfaces
Each entity has specialized methods:
- **IAgencyRepository**: `updateStatus(id, status)`
- **IHotelRepository**: `updateStatus(id, status)`
- **IVehicleRepository**: `updateStatus(id, status)`
- **IUserRepository**: `countRecentRegistrations(days)`

## 🚀 Future Expansion

To apply this pattern to other modules:

1. **Create interfaces** for other entities (Booking, Trip, etc.)
2. **Create Prisma implementations**
3. **Refactor services** to accept repositories via dependency injection
4. **Update instantiation** in controllers or use a DI container

## ⚠️ Important Notes

- **POC Status**: This is currently a proof of concept for admin module only
- **Migration Strategy**: Gradually refactor other modules module-by-module
- **No Breaking Changes**: Existing functionality preserved
- **Backward Compatible**: Old code still works while migration happens

## 📖 Related Files

- **Interfaces**: `backend/src/repositories/interfaces/`
- **Implementations**: `backend/src/repositories/prisma/`
- **Service Example**: `backend/src/modules/admin/admin.service.ts`
- **Implementation Plan**: See `implementation_plan.md` for full context

---

**Author**: Architectural Improvement - Phase 1  
**Date**: 2026-02-06  
**Status**: ✅ Implemented (Admin Module POC)
