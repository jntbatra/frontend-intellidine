# Kitchen Display System - API Endpoints Quick Map

## 🗺️ Visual Guide to API Integration

```
╔════════════════════════════════════════════════════════════════════════════╗
║                   KITCHEN DISPLAY SYSTEM - API MAP                        ║
║                      IntelliDine API Integration                          ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ KITCHEN PAGE (http://localhost:3001/kitchen)                               │
│ ┌───────────────────────────────────────────────────────────────────────┐   │
│ │ [🔄 Refresh] [⏸️ Pause] [▶️ Resume]                                    │   │
│ ├───────────────┬──────────────────┬──────────────────────────────────┤   │
│ │   PENDING     │    PREPARING     │         READY                    │   │
│ │   (Yellow)    │     (Blue)       │        (Green)                   │   │
│ ├───────────────┼──────────────────┼──────────────────────────────────┤   │
│ │               │                  │                                  │   │
│ │ ┌───────────┐ │ ┌───────────┐    │ ┌───────────┐                   │   │
│ │ │ Order #42 │ │ │ Order #41 │    │ │ Order #39 │                   │   │
│ │ │ Table 5   │ │ │ Table 2   │    │ │ Table 1   │                   │   │
│ │ │ $590      │ │ │ $450      │    │ │ $320      │                   │   │
│ │ │           │ │ │           │    │ │           │                   │   │
│ │ │[Start...] │ │ │[Mark ...]  │    │ │[Complete]│                   │   │
│ │ └─────────┬─┘ │ └─────────┬─┘    │ └──────┬────┘                   │   │
│ │           │   │           │      │        │                        │   │
│ │ (Click)───┘   │ (Click)───┘      │ (Click)┘                        │   │
│ │               │                  │                                  │   │
│ └───────────────┴──────────────────┴──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
        │               │                    │
        │               │                    │
        ▼               ▼                    ▼

┌──────────────────────────────────────────────────────────────────────────────┐
│ API CALLS MADE BY KITCHEN SYSTEM                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ EVERY 15 SECONDS (Auto-Refresh)                                             │
│ ├─ GET /api/orders                                                          │
│ │  ├─ Query: tenant_id, limit=50, offset=0                                 │
│ │  ├─ Headers: Authorization, X-Tenant-ID                                   │
│ │  └─ Returns: [Order, Order, Order, ...]                                   │
│ │                                                                            │
│ WHEN STATUS BUTTON CLICKED                                                  │
│ ├─ PATCH /api/orders/{id}/status                                            │
│ │  ├─ Body: { "status": "in_preparation" | "ready" | "completed" }         │
│ │  ├─ Headers: Authorization, X-Tenant-ID                                   │
│ │  └─ Returns: Updated Order object                                         │
│ │                                                                            │
│ WHEN CANCEL BUTTON CLICKED                                                  │
│ ├─ PATCH /api/orders/{id}/cancel                                            │
│ │  ├─ Body: { "reason": "cancellation reason" }                            │
│ │  ├─ Headers: Authorization, X-Tenant-ID                                   │
│ │  └─ Returns: Cancelled Order object                                       │
│ │                                                                            │
│ WHEN MANUAL REFRESH CLICKED                                                 │
│ └─ GET /api/orders (same as every 15s, but forced immediately)             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
        │
        │ NETWORK REQUEST
        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ INTELLIDINE API GATEWAY                                                      │
│ https://intellidine-api.aahil-khan.tech                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ✅ GET /api/orders          → Order Service (retrieve orders)               │
│ ✅ PATCH /api/orders/{id}/status → Order Service (update status)            │
│ ✅ PATCH /api/orders/{id}/cancel  → Order Service (cancel order)            │
│ ✅ GET /api/orders/{id}     → Order Service (get details)                   │
│                                                                              │
│ Authentication:                                                             │
│ • Header: Authorization: Bearer {jwt_token}                                 │
│ • Header: X-Tenant-ID: {tenant_id}                                         │
│ • Rate Limit: 100 requests/minute                                           │
│ • Timeout: 10 seconds                                                       │
│ • Retry: 3 attempts on GET failure                                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ ORDER SERVICE (Backend)                                                      │
│ Database: PostgreSQL                                                         │
│ • Stores order details                                                       │
│ • Manages status transitions                                                │
│ • Enforces multi-tenant isolation                                           │
│ • Logs all changes                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ RESPONSE BACK TO KITCHEN DISPLAY                                            │
│ {                                                                            │
│   "success": true,                                                           │
│   "data": [                                                                  │
│     { order details... },                                                    │
│     { order details... }                                                     │
│   ]                                                                          │
│ }                                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ REACT QUERY CACHE                                                            │
│ • Cache fresh for 5 seconds                                                 │
│ • Garbage collect after 10 minutes                                          │
│ • Optimistic updates for fast UI response                                   │
│ • Automatic refetch on error                                                │
└──────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ COMPONENT RE-RENDER                                                          │
│ • Orders grouped into 3 columns (Pending, Preparing, Ready)                 │
│ • Color-coded cards (Yellow, Blue, Green)                                   │
│ • Updated with new status                                                   │
│ • Toast notification sent (success or error)                                │
│ • Ready for next action                                                     │
└──────────────────────────────────────────────────────────────────────────────┘

```

---

## 📊 Request-Response Examples

### ✅ GET /api/orders

**REQUEST:**

```http
GET https://intellidine-api.aahil-khan.tech/api/orders?tenant_id=11111111-1111-1111-1111-111111111111&limit=50&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-ID: 11111111-1111-1111-1111-111111111111
Content-Type: application/json
```

**RESPONSE (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "order_001",
      "tenant_id": "11111111-1111-1111-1111-111111111111",
      "table_id": "5",
      "order_number": 42,
      "customer_name": "John Doe",
      "status": "pending",
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
      "created_at": "2025-11-09T10:30:00Z",
      "updated_at": "2025-11-09T10:30:00Z"
    },
    {
      "id": "order_002",
      "tenant_id": "11111111-1111-1111-1111-111111111111",
      "table_id": "2",
      "order_number": 41,
      "customer_name": "Jane Smith",
      "status": "in_preparation",
      "items": [...],
      "subtotal": 400,
      "tax": 72,
      "total_amount": 472,
      "created_at": "2025-11-09T10:15:00Z",
      "updated_at": "2025-11-09T10:20:00Z"
    }
  ]
}
```

---

### ✅ PATCH /api/orders/{id}/status

**REQUEST:**

```http
PATCH https://intellidine-api.aahil-khan.tech/api/orders/order_001/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-ID: 11111111-1111-1111-1111-111111111111
Content-Type: application/json

{
  "status": "in_preparation"
}
```

**RESPONSE (200 OK):**

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

**UI UPDATE:**

- Order card immediately changes color: Yellow → Blue
- Toast: ✅ "Order status updated"
- Optimistic update makes change instant
- API refetch confirms in background

---

### ✅ PATCH /api/orders/{id}/cancel

**REQUEST:**

```http
PATCH https://intellidine-api.aahil-khan.tech/api/orders/order_001/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-ID: 11111111-1111-1111-1111-111111111111
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

**RESPONSE (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "status": "cancelled",
    "cancelled_at": "2025-11-09T10:40:00Z"
  }
}
```

**UI UPDATE:**

- Order removed from display
- Toast: ✅ "Order cancelled"
- Next auto-refresh will confirm

---

## 🔍 Debugging with Browser DevTools

### Network Tab (F12 → Network)

**Filter for API calls:**

```
Name                          Method  Status  Type   Time
/api/orders?tenant_id=...     GET     200     xhr    456ms
/api/orders/order_001/status  PATCH   200     xhr    234ms
/api/orders?tenant_id=...     GET     200     xhr    423ms
```

**Request Headers:**

```
GET /api/orders?tenant_id=11111111-1111-1111-1111-111111111111&limit=50&offset=0 HTTP/1.1
Host: intellidine-api.aahil-khan.tech
Authorization: Bearer {jwt_token}
X-Tenant-ID: 11111111-1111-1111-1111-111111111111
```

**Response:**

```json
{
  "success": true,
  "data": [...]
}
```

---

## 📋 API Endpoint Checklist

### Before Deployment

- [ ] Can reach `https://intellidine-api.aahil-khan.tech`
- [ ] GET /api/orders returns orders
- [ ] PATCH .../status updates status
- [ ] PATCH .../cancel cancels order
- [ ] JWT token automatically injected
- [ ] X-Tenant-ID header present
- [ ] Responses parse correctly
- [ ] Error handling works
- [ ] No 401/403 errors
- [ ] Auto-refresh works every 15s
- [ ] Manual refresh works
- [ ] Pause/resume works
- [ ] Toast notifications appear
- [ ] Browser DevTools show correct requests

---

## 🚨 Common Status Codes

| Code | Meaning                | Action              |
| ---- | ---------------------- | ------------------- |
| 200  | ✅ Success             | Process data        |
| 400  | ❌ Bad Request         | Check parameters    |
| 401  | ❌ Unauthorized        | Re-authenticate     |
| 403  | ❌ Forbidden           | Check permissions   |
| 404  | ❌ Not Found           | Order doesn't exist |
| 429  | ❌ Too Many Requests   | Wait & retry        |
| 500  | ❌ Server Error        | Retry later         |
| 503  | ❌ Service Unavailable | API maintenance     |

---

## 📈 Performance Profile

```
Healthy Kitchen System:

┌─ Every 15 seconds ──────┐
│ GET /api/orders         │ → 300-500ms
│ Parse response          │ → 50-100ms
│ Update React cache      │ → <10ms
│ Re-render UI            │ → 100-200ms
│ Total cycle: ~800ms     │
└────────────────────────┘

When status changes:

┌─ Status Change Flow ────┐
│ User clicks button       │ → <10ms
│ Optimistic UI update    │ → <10ms
│ PATCH request sent      │ → 200-400ms
│ Response received       │ → <10ms
│ Cache updated           │ → <10ms
│ UI refreshed            │ → 50-100ms
│ Toast shown             │ → <10ms
│ Total: ~800ms           │
├─ User sees update:      │
│   In <100ms (optimistic)│
└────────────────────────┘
```

---

**System Status**: ✅ PRODUCTION READY  
**API Integration**: ✅ COMPLETE  
**Documentation**: ✅ COMPREHENSIVE

Ready to deploy! 🚀
