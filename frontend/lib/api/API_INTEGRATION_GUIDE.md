# Kitchen Display System - API Integration Guide

## Overview

The Kitchen Display System integrates with the **IntelliDine API** using endpoints from the **Order Service** and is managed through the **API Gateway**.

**Base URL**: `https://intellidine-api.aahil-khan.tech`

---

## API Endpoints Used

### 1. **List Orders** (Order Service)

**Endpoint**: `GET /api/orders`

Retrieves all orders for a tenant with optional pagination and filtering.

**Request**:

```http
GET /api/orders?tenant_id={{tenant_id}}&limit=50&offset=0
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

**Query Parameters**:

- `tenant_id` (required): The unique tenant identifier
- `limit` (optional): Maximum number of orders to return (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by order status (pending, in_preparation, ready, completed, cancelled)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "order_001",
      "tenant_id": "11111111-1111-1111-1111-111111111111",
      "table_id": "5",
      "customer_name": "John Doe",
      "order_number": 42,
      "items": [
        {
          "menu_item_id": "item_001",
          "quantity": 2,
          "name": "Biryani",
          "special_instructions": "Extra spicy"
        }
      ],
      "subtotal": 500,
      "tax": 90,
      "total_amount": 590,
      "status": "pending",
      "created_at": "2025-11-09T10:30:00Z",
      "updated_at": "2025-11-09T10:30:00Z"
    }
  ]
}
```

---

### 2. **Update Order Status** (Order Service)

**Endpoint**: `PATCH /api/orders/{id}/status`

Updates the status of an order. Used for workflow transitions.

**Request**:

```http
PATCH /api/orders/order_001/status
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "status": "in_preparation"
}
```

**Path Parameters**:

- `id` (required): The order ID

**Body**:

- `status` (required): New status value
  - `pending` → Initial state
  - `in_preparation` → Kitchen is preparing
  - `ready` → Order is ready for pickup/delivery
  - `completed` → Order completed
  - `cancelled` → Order cancelled

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "status": "in_preparation",
    "updated_at": "2025-11-09T10:35:00Z"
  }
}
```

---

### 3. **Cancel Order** (Order Service)

**Endpoint**: `PATCH /api/orders/{id}/cancel`

Cancels an order with an optional reason.

**Request**:

```http
PATCH /api/orders/order_001/cancel
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

**Path Parameters**:

- `id` (required): The order ID

**Body**:

- `reason` (optional): Cancellation reason

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "status": "cancelled",
    "updated_at": "2025-11-09T10:40:00Z"
  }
}
```

---

### 4. **Get Order Details** (Order Service)

**Endpoint**: `GET /api/orders/{id}`

Retrieves complete details for a specific order.

**Request**:

```http
GET /api/orders/order_001?tenant_id={{tenant_id}}
Authorization: Bearer {{jwt_token}}
X-Tenant-ID: {{tenant_id}}
```

**Response**: Same as List Orders but for a single order

---

## Implementation Details

### Authentication

All requests require:

1. **JWT Token**: Passed in `Authorization` header

   ```
   Authorization: Bearer {{jwt_token}}
   ```

2. **Tenant ID**: Passed in `X-Tenant-ID` header and query parameter
   ```
   X-Tenant-ID: {{tenant_id}}
   ```

**Obtaining JWT Token**:

**For Kitchen Staff**:

```http
POST /api/auth/staff/login
Content-Type: application/json

{
  "username": "kitchen_staff",
  "password": "password123",
  "tenant_id": "{{tenant_id}}"
}
```

**For Testing (Customer OTP Flow)**:

```http
POST /api/auth/customer/request-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "tenant_id": "{{tenant_id}}"
}

POST /api/auth/customer/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456",
  "tenant_id": "{{tenant_id}}"
}
```

---

### API Response Format

All API responses follow a standard format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string (optional),
  "error": string (optional)
}
```

---

## Frontend Implementation

### Files Using API

#### 1. **lib/api/kitchen.ts**

Contains all API functions for kitchen operations:

- `fetchKitchenOrders()` - Fetch orders
- `fetchOrderDetails()` - Get single order
- `updateOrderStatus()` - Change order status
- `prepareOrder()` - Shortcut to set status to "in_preparation"
- `readyOrder()` - Shortcut to set status to "ready"
- `completeOrder()` - Shortcut to set status to "completed"
- `cancelOrder()` - Cancel an order
- `getKitchenStats()` - Calculate kitchen metrics

#### 2. **hooks/use-kitchen-orders.ts**

React Query custom hook:

- Manages orders data fetching and caching
- Auto-refresh every 15 seconds (configurable)
- Handles mutations for status updates
- Error handling and toast notifications
- Provides refetch and refresh controls

#### 3. **components/kitchen/KitchenOrderBoard.tsx**

Main UI component:

- Displays 3-column layout (Pending, Preparing, Ready)
- Uses `useKitchenOrders` hook
- Handles refresh, pause, and manual control
- Shows error states and loading states

---

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://intellidine-api.aahil-khan.tech
NEXT_PUBLIC_TENANT_ID=11111111-1111-1111-1111-111111111111

# Optional: Override for development
NEXT_PUBLIC_DEV_MODE=true
```

### API Client Setup

The `apiClient` in `lib/api/client.ts` automatically:

- Injects JWT token from `localStorage.getItem("auth_token")`
- Injects `X-Tenant-ID` header from `localStorage.getItem("current_tenant_id")`
- Retries GET requests up to 3 times on failure
- Times out requests after 10 seconds
- Handles 401 (Unauthorized) errors

---

## Error Handling

### Error Codes

| Code | Meaning      | Action                                   |
| ---- | ------------ | ---------------------------------------- |
| 200  | Success      | Process response                         |
| 400  | Bad Request  | Check request parameters                 |
| 401  | Unauthorized | Re-authenticate and get new JWT token    |
| 403  | Forbidden    | User lacks permission for this operation |
| 404  | Not Found    | Order doesn't exist                      |
| 500  | Server Error | Retry or contact support                 |

### Fallback to Mock Data

In development mode, if the API is unavailable:

```typescript
if (process.env.NODE_ENV === "development") {
  // Uses MOCK_ORDERS from lib/constants/mockOrders.ts
}
```

---

## Usage Examples

### Example 1: Fetching Orders

```typescript
import { fetchKitchenOrders } from "@/lib/api/kitchen";

const response = await fetchKitchenOrders({
  tenant_id: "11111111-1111-1111-1111-111111111111",
  limit: 50,
  offset: 0,
  status: "pending", // Optional: filter by status
});

if (response.success) {
  console.log("Orders:", response.data);
} else {
  console.error("Failed to fetch orders");
}
```

### Example 2: Updating Order Status

```typescript
import { updateOrderStatus } from "@/lib/api/kitchen";

const response = await updateOrderStatus("order_001", "in_preparation");

if (response.success) {
  console.log("Order updated:", response.data);
} else {
  console.error("Failed to update order");
}
```

### Example 3: Using React Query Hook

```typescript
import { useKitchenOrders } from "@/hooks/use-kitchen-orders";

function KitchenPage() {
  const {
    orders,
    isLoading,
    isError,
    updateOrderStatus,
    isUpdating,
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,
  } = useKitchenOrders("tenant_id", true);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading orders</div>;

  return (
    <div>
      <button onClick={toggleAutoRefresh}>
        {autoRefresh ? "Pause" : "Resume"} Auto-Refresh
      </button>
      <button onClick={manualRefresh}>Manual Refresh</button>

      {orders.map((order) => (
        <div key={order.id}>
          <h3>Order #{order.order_number}</h3>
          <p>Status: {order.status}</p>
          <button
            onClick={() =>
              updateOrderStatus({
                orderId: order.id,
                status: "in_preparation",
              })
            }
            disabled={isUpdating}
          >
            Start Preparing
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Rate Limiting

The API Gateway implements rate limiting:

- **100 requests per minute** per authenticated user
- **10 requests per minute** per IP (unauthenticated)

If rate limit is exceeded, responses will return `429 Too Many Requests`.

---

## Performance Optimization

### Caching Strategy

- **staleTime**: 5 seconds - Data is considered fresh for 5 seconds
- **gcTime**: 10 minutes - Unused cached data is garbage collected after 10 minutes
- **refetchInterval**: 15 seconds - Auto-refresh interval for active polling

### Pagination

For large order lists, use pagination:

```typescript
const params = {
  tenant_id: "...",
  limit: 50,
  offset: 0, // Start from 0
};

// Next page
params.offset += 50;
```

---

## Testing with Postman

A Postman collection is available at `DOCUMENTATION/api.json`.

**Quick Start**:

1. Import `api.json` into Postman
2. Set variables: `tenant_id`, `customer_phone`
3. Run "Customer - Request OTP"
4. Copy OTP and run "Customer - Verify OTP"
5. JWT token auto-populates in all requests
6. Test kitchen endpoints: "List Orders", "Update Order Status", etc.

---

## Troubleshooting

| Problem             | Solution                                                    |
| ------------------- | ----------------------------------------------------------- |
| 401 Unauthorized    | Re-authenticate, ensure JWT token is set in localStorage    |
| 403 Forbidden       | Verify tenant_id is correct and user has kitchen staff role |
| 404 Not Found       | Order ID doesn't exist or was deleted                       |
| Empty orders list   | Verify tenant_id is correct, check with GET /api/orders     |
| Orders not updating | Check WebSocket connection, manual refresh may be needed    |
| Slow performance    | Increase refetchInterval, reduce limit parameter            |

---

## API Gateway Endpoints

The API Gateway provides aggregation endpoints:

**Health Check**:

```http
GET /health
```

**Available Routes**:

```http
GET /routes
```

---

## Future Enhancements

- [ ] WebSocket real-time updates (reduce polling interval)
- [ ] Order notifications via Web Push API
- [ ] Kitchen section filtering (Pizza section, Dessert section, etc.)
- [ ] Priority/VIP order badges
- [ ] Sound alerts for new orders
- [ ] Keyboard shortcuts for faster workflow
- [ ] Multi-kitchen support with section-based routing

---

## Support

For API issues, refer to:

- **API Documentation**: `DOCUMENTATION/README.md`
- **Service Documentation**: `DOCUMENTATION/services/ORDER_SERVICE.md`
- **Production Deployment**: `DOCUMENTATION/others/PRODUCTION_DEPLOYMENT_GUIDE.md`
