# Admin Architecture Patterns

## 📐 Standardized Module Structure

All admin modules follow this consistent structure:

```
admin-portal/src/modules/{module}/
├── components/           # React components
│   ├── {Module}List.tsx
│   ├── {Module}Detail.tsx
│   └── {Module}Form.tsx
├── hooks/                # Custom React hooks (optional)
│   └── use{Module}.ts
├── services/             # API service layer
│   └── {module}Service.ts
└── types/                # TypeScript types (optional)
    └── {module}.types.ts
```

## 🔄 Data Flow Pattern

```
Component → Custom Hook → Service → API Client → Backend
    ↓
  State
(React Query)
```

### Example: Fetching Agencies

```typescript
// 1. Service Layer (agencyService.ts)
export const agencyService = {
  async getAll(params): Promise<PaginatedResponse<Agency>> {
    const response = await apiClient.get('/admin/agencies', { params });
    return response.data.data;
  },
};

// 2. Custom Hook (useAgencies.ts) - OPTIONAL
export function useAgencies(filters: AgencyFilters) {
  return useApiQuery(
    ['agencies', filters],
    () => agencyService.getAll(filters)
  );
}

// 3. Component
function AgenciesList() {
  const { data, isLoading } = useAgencies({ status: 'PENDING' });
  
  if (isLoading) return <Loading />;
  
  return <Table data={data} />;
}
```

## 🎣 Shared Hooks

Located in `shared/hooks/`:

### `useApiQuery`
Standardized data fetching with caching and retry logic.

```typescript
const { data, isLoading, error, refetch } = useApiQuery(
  ['agencies', 'list'],
  () => agencyService.getAll()
);
```

### `useApiMutation`
Standardized data mutations (create, update, delete).

```typescript
const { mutate, isLoading } = useApiMutation(
  (id: string) => agencyService.approve(id),
  {
    onSuccess: () => {
      toast.success('Agency approved');
      queryClient.invalidateQueries(['agencies']);
    }
  }
);
```

### `useApiPagination`
Built-in pagination state management.

```typescript
const { 
  data, 
  page, 
  totalPages, 
  goToNextPage,
  goToPrevPage 
} = useApiPagination(
  ['agencies'],
  (page, limit) => agencyService.getAll({ page, limit })
);
```

## ⚠️ Error Handling

### Error Handler Utility

```typescript
import { handleApiError } from '@/shared/utils/errorHandler';

try {
  await agencyService.approve(id);
} catch (error) {
  const apiError = handleApiError(error);
  toast.error(apiError.message);
  
  if (apiError.isAuthError) {
    // Redirect to login
  }
}
```

### Error Boundary

Wrap components to catch React errors:

```typescript
// App.tsx
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

<ErrorBoundary>
  <AdminDashboard />
</ErrorBoundary>
```

## 📝 Service Layer Pattern

All services must:
1. **Call backend API** (no hardcoded data)
2. **Return typed responses** (use TypeScript)
3. **Handle errors gracefully** (throw or return error objects)

```typescript
// ✅ GOOD: Calls backend API
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/admin/reports/dashboard');
    return response.data.data;
  },
};

// ❌ BAD: Returns hardcoded data
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return { totalUsers: 1247 }; // WRONG!
  },
};
```

## 🎨 Component Patterns

### Loading States

```typescript
if (isLoading) {
  return <Spinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

if (!data || data.length === 0) {
  return <EmptyState message="No agencies found" />;
}

return <AgenciesTable data={data} />;
```

### Mutations with Optimistic Updates

```typescript
const { mutate: approveAgency } = useApiMutation(
  (id: string) => agencyService.approve(id),
  {
    onMutate: async (id) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries(['agencies']);
      
      // Optimistic update
      const previous = queryClient.getQueryData(['agencies']);
      queryClient.setQueryData(['agencies'], (old) =>
        updateAgencyStatus(old, id, 'APPROVED')
      );
      
      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(['agencies'], context?.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agencies']);
      toast.success('Agency approved!');
    },
  }
);
```

## 📚 TypeScript Best Practices

1. **Define interfaces for all API responses**
2. **Use strict typing** (avoid `any`)
3. **Share types** between frontend and backend when possible

```typescript
// shared/types.ts
export interface Agency {
  id: string;
  name: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

## 🚫 Anti-Patterns to Avoid

1. **❌ Hardcoded data in services**
2. **❌ Direct Prisma/DB calls from frontend**
3. **❌ Inconsistent error handling**
4. **❌ Missing loading/error states**
5. **❌ Not using React Query for data fetching**
6. **❌ Prop drilling instead of context/hooks**

## ✅ Checklist for New Modules

- [ ] Create service file with API calls
- [ ] Define TypeScript interfaces
- [ ] Use `use form` or custom hooks
- [ ] Implement loading & error states
- [ ] Add error boundary
- [ ] Test with empty/error/success states
- [ ] Document any special patterns

---

**Created**: 2026-02-06  
**Status**: ✅ Standardized  
**Applies to**: All admin portal modules
