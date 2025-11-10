# Tenant API Integration Guide

## Overview

This guide explains how to fetch and use tenant details in your application. The tenant API provides restaurant/business information stored on the backend.

## API Endpoint

```
GET /tenants/{tenant_id}
Authorization: Bearer {auth_token}
X-Tenant-ID: {tenant_id} (optional, automatically added by apiClient)
```

## Files Created

### 1. **lib/api/tenant.ts**

Core tenant API functions with authorization and caching support.

**Key Functions:**

#### `getTenantDetails(tenantId: string)`

Fetch tenant details from the API.

```typescript
import { getTenantDetails } from "@/lib/api/tenant";

const response = await getTenantDetails("11111111-1111-1111-1111-111111111111");
const tenantData = response.data; // Tenant object
```

#### `getCurrentTenantDetails()`

Fetch the current tenant details from localStorage.

```typescript
import { getCurrentTenantDetails } from "@/lib/api/tenant";

const response = await getCurrentTenantDetails();
const tenantData = response.data;
```

#### `getTenantDetailsWithCache(tenantId, useCache?)`

Fetch tenant details with automatic caching (recommended for production).

```typescript
import { getTenantDetailsWithCache } from "@/lib/api/tenant";

// First call fetches from API
const tenantData = await getTenantDetailsWithCache("tenant-id");

// Subsequent calls use cache
const cachedData = await getTenantDetailsWithCache("tenant-id");
```

#### `setCurrentTenantId(tenantId: string)`

Set the current tenant ID in localStorage.

```typescript
import { setCurrentTenantId } from "@/lib/api/tenant";

setCurrentTenantId("11111111-1111-1111-1111-111111111111");
```

#### `cacheTenantDetails(tenantId, tenantDetails)`

Manually cache tenant details.

```typescript
import { cacheTenantDetails } from "@/lib/api/tenant";

cacheTenantDetails("tenant-id", tenantDetails);
```

#### `getCachedTenantDetails(tenantId)`

Get cached tenant details from localStorage.

```typescript
import { getCachedTenantDetails } from "@/lib/api/tenant";

const cached = getCachedTenantDetails("tenant-id");
if (cached) {
  console.log("Using cached data:", cached);
}
```

#### `clearTenantCache(tenantId?)`

Clear tenant cache (specific or all).

```typescript
import { clearTenantCache } from "@/lib/api/tenant";

// Clear specific tenant cache
clearTenantCache("tenant-id");

// Clear all tenant caches
clearTenantCache();
```

---

### 2. **hooks/use-tenant-details.ts**

React hooks for easy integration with components.

#### `useTenantDetails(tenantId?, enabled?)`

Fetch and manage tenant details with React Query.

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function RestaurantHeader() {
  const { tenantData, isLoading, isError, error, refetch } = useTenantDetails();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{tenantData?.name}</h1>
      <p>{tenantData?.cuisine_type}</p>
      {tenantData?.logo_url && (
        <img src={tenantData.logo_url} alt={tenantData.name} />
      )}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

#### `useCurrentTenant()`

Shorthand hook for current tenant details.

```typescript
import { useCurrentTenant } from "@/hooks/use-tenant-details";

export function AppHeader() {
  const { tenantData, isLoading } = useCurrentTenant();

  if (isLoading) return <div>Loading...</div>;

  return <h1>Welcome to {tenantData?.name}</h1>;
}
```

---

## Tenant Data Structure

```typescript
interface TenantData {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  owner_email?: string;
  operating_hours?: {
    mon_fri?: string;
    sat_sun?: string;
  };
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TenantApiResponse {
  success: boolean;
  data: TenantData;
}
```

### Example Response:

```json
{
  "data": {
    "success": true,
    "data": {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Restaurant Name",
      "address": "123 Main Street, City, Country",
      "contact": "1234567890",
      "owner_email": "owner@restaurant.com",
      "operating_hours": {
        "mon_fri": "11:00-23:00",
        "sat_sun": "11:00-23:30"
      },
      "is_active": true,
      "created_at": "2025-10-21T19:26:02.637Z"
    }
  },
  "meta": {
    "timestamp": "2025-11-09T11:24:14.277Z",
    "correlationId": "1dc284e2-579a-43e0-995d-7d7d12981fdc",
    "tenantId": "11111111-1111-1111-1111-111111111111"
  }
}
```

### Available Fields:

| Field                     | Type    | Description                  |
| ------------------------- | ------- | ---------------------------- |
| `id`                      | string  | Unique tenant identifier     |
| `name`                    | string  | Restaurant/business name     |
| `address`                 | string  | Physical address             |
| `contact`                 | string  | Contact phone number         |
| `owner_email`             | string  | Owner's email address        |
| `operating_hours.mon_fri` | string  | Hours format: "HH:MM-HH:MM"  |
| `operating_hours.sat_sun` | string  | Hours format: "HH:MM-HH:MM"  |
| `is_active`               | boolean | Whether tenant is active     |
| `created_at`              | string  | ISO timestamp of creation    |
| `updated_at`              | string  | ISO timestamp of last update |

---

## Usage Examples

### Example 1: Display Restaurant Info

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function RestaurantInfo() {
  const { tenantData, isLoading } = useTenantDetails();

  if (isLoading) return <p>Loading restaurant info...</p>;

  return (
    <div>
      <h1>{tenantData?.name}</h1>
      <p>Address: {tenantData?.address}</p>
      <p>Phone: {tenantData?.contact}</p>
      <p>Email: {tenantData?.owner_email}</p>
    </div>
  );
}
```

### Example 2: Show Operating Hours

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function OperatingHours() {
  const { tenantData } = useTenantDetails();

  return (
    <div>
      <h3>Operating Hours</h3>
      <p>Mon-Fri: {tenantData?.operating_hours?.mon_fri}</p>
      <p>Sat-Sun: {tenantData?.operating_hours?.sat_sun}</p>
      <p>Status: {tenantData?.is_active ? "Open" : "Closed"}</p>
    </div>
  );
}
```

### Example 3: Check Active Status

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function TenantStatus() {
  const { tenantData } = useTenantDetails();

  if (!tenantData?.is_active) {
    return <div className="error">Restaurant is currently closed</div>;
  }

  return <div>Restaurant is open and accepting orders</div>;
}
```

---

## Authorization

The tenant API automatically uses:

1. **Authorization Header**: `Bearer {auth_token}` (from localStorage)
2. **Tenant ID Header**: `X-Tenant-ID: {tenant_id}` (from localStorage)

These are automatically added by the `apiClient` in `lib/api/client.ts`.

---

## Caching Strategy

The `useTenantDetails` hook uses React Query with:

- **staleTime**: 30 minutes (data is fresh for 30 mins)
- **gcTime**: 60 minutes (cache is kept for 60 mins)

For manual caching:

```typescript
import { getTenantDetailsWithCache } from "@/lib/api/tenant";

// Uses cache if available (faster)
const tenant = await getTenantDetailsWithCache(tenantId);

// Force fresh data from API
const fresh = await getTenantDetails(tenantId);
```

---

## Error Handling

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function TenantComponent() {
  const { tenantData, isError, error, refetch } = useTenantDetails();

  if (isError) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }

  return <div>{tenantData?.name}</div>;
}
```

---

## Integration Points

### Menu Page

Display restaurant-specific menu information:

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function MenuPage() {
  const { tenantData } = useTenantDetails();

  return (
    <div>
      <h1>{tenantData?.name} Menu</h1>
      <p>Hours: {tenantData?.operating_hours?.mon_fri}</p>
      {/* Display menu items */}
    </div>
  );
}
```

### Kitchen Display

Show business information:

```typescript
import { useCurrentTenant } from "@/hooks/use-tenant-details";

export function KitchenHeader() {
  const { tenantData } = useCurrentTenant();

  return (
    <header>
      <h1>{tenantData?.name}</h1>
      <p>Status: {tenantData?.is_active ? "Open" : "Closed"}</p>
    </header>
  );
}
```

### Order Confirmation

Show restaurant details on order completion:

```typescript
import { useTenantDetails } from "@/hooks/use-tenant-details";

export function OrderConfirmation() {
  const { tenantData } = useTenantDetails();

  return (
    <div>
      <h2>Order Confirmed at {tenantData?.name}</h2>
      <p>Address: {tenantData?.address}</p>
      <p>Contact: {tenantData?.contact}</p>
    </div>
  );
}
```

---

## Best Practices

1. **Use the Hook**: Prefer `useTenantDetails()` in React components
2. **Cache Data**: Use `getTenantDetailsWithCache()` for better performance
3. **Handle Errors**: Always check `isError` and provide fallback UI
4. **Refresh Manually**: Call `refetch()` when tenant data changes
5. **Avoid N+1**: Don't fetch tenant details multiple times in same component tree
6. **Set Tenant ID Early**: Set the current tenant ID in localStorage during app initialization

---

## Testing

```typescript
import { getTenantDetails } from "@/lib/api/tenant";

// Test fetching tenant details
const response = await getTenantDetails("test-tenant-id");
console.log("Tenant:", response.data);
console.log("Success:", response.success);
```
