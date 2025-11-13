# IntelliDine API - Comprehensive Endpoints Reference

**Last Updated**: November 11, 2025  
**Platform**: Multi-tenant Restaurant Management SaaS  
**Base URL**: `http://localhost:3100/` (Local) or `https://intellidine-api.aahil-khan.tech` (Production)

---

## 📋 Table of Contents

1. [Authentication](#authentication-api)
2. [Menu Management](#menu-service)
3. [Orders](#order-service)
4. [Payments](#payment-service)
5. [Inventory](#inventory-service)
6. [Discounts](#discount-engine)
7. [Analytics](#analytics-service)
8. [Tenant Management](#tenant-management)
9. [Common Response Formats](#common-response-formats)

---

## 🔐 Authentication API

**Service**: `auth-service` | **Port**: `3101` | **Base Path**: `/api/auth`

### Customer OTP Flow

#### Request OTP
```
POST /api/auth/customer/request-otp
Auth: None (Public)
Content-Type: application/json

Request:
{
  "phone": "+919876543210"
}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "message": "OTP sent to your phone",
    "expires_at": "2025-11-11T10:35:00Z"
  }
}
```

#### Verify OTP & Get JWT
```
POST /api/auth/customer/verify-otp
Auth: None (Public)
Content-Type: application/json

Request:
{
  "phone": "+919876543210",
  "otp": "123456"
}

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-11-12T10:25:00Z",
  "user": {
    "id": "cust-uuid",
    "phone_number": "+919876543210"
  }
}
```

**Token Usage**: Include in all customer requests:
```
Authorization: Bearer {access_token}
X-Tenant-ID: {tenant_id}
```

---

### Staff Login

#### Login with Credentials
```
POST /api/auth/staff/login
Auth: None (Public)
Content-Type: application/json

Request:
{
  "username": "manager1",
  "password": "Password@123"
}

Response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-11-12T10:25:00Z",
  "user": {
    "id": "user-uuid",
    "username": "manager1",
    "email": "manager@restaurant.com",
    "role": "MANAGER",
    "tenant_id": "tenant-uuid"
  }
}
```

**Token Usage**: Include in all staff requests:
```
Authorization: Bearer {access_token}
X-Tenant-ID: {tenant_id}
```

---

## 🍽️ Menu Service

**Service**: `menu-service` | **Port**: `3103` | **Base Path**: `/api/menu`

### Get Menu (Public - No Auth)
```
GET /api/menu?tenant_id={tenant_id}&category_id={category_id}
Auth: None (Public)

Query Parameters:
  tenant_id (required): Tenant identifier
  category_id (optional): Filter by category

Response (200 OK):
{
  "categories": [
    {
      "id": "c-main",
      "name": "Main Course",
      "display_order": 1,
      "items": [
        {
          "id": "item_001",
          "tenant_id": "tenant-uuid",
          "category_id": "c-main",
          "name": "Butter Chicken",
          "description": "Tomato-butter gravy",
          "image_url": "https://...",
          "price": 380,
          "cost_price": 170,
          "discount_percentage": 0,
          "dietary_tags": ["non-veg", "spicy"],
          "preparation_time": 25,
          "is_available": true,
          "stock_level": 45,
          "stock_status": "AVAILABLE",
          "reorder_level": 20,
          "created_at": "2025-10-21T19:26:02.655Z",
          "updated_at": "2025-10-21T19:26:02.655Z"
        }
      ]
    }
  ]
}
```

**Stock Status Values**:
- `AVAILABLE` - Item in stock and ready to order
- `LOW_STOCK` - Item quantity ≤ 50% of reorder_level
- `OUT_OF_STOCK` - Item quantity = 0

---

### Get Categories
```
GET /api/menu/categories
Auth: None (Public)

Response (200 OK):
{
  "categories": [
    {
      "id": "c-app",
      "name": "Appetizers",
      "display_order": 1,
      "items": []
    },
    {
      "id": "c-main",
      "name": "Main Course",
      "display_order": 2,
      "items": []
    }
  ]
}
```

---

### Get Single Menu Item
```
GET /api/menu/items/{item_id}
Auth: None (Public)

Response (200 OK):
{
  "id": "item_001",
  "tenant_id": "tenant-uuid",
  "category_id": "c-main",
  "name": "Butter Chicken",
  "description": "Tomato-butter gravy",
  "price": 380,
  "cost_price": 170,
  "discount_percentage": 0,
  "dietary_tags": ["non-veg"],
  "preparation_time": 25,
  "is_available": true,
  "stock_level": 45,
  "stock_status": "AVAILABLE",
  "reorder_level": 20,
  "created_at": "2025-10-21T19:26:02.655Z",
  "updated_at": "2025-10-21T19:26:02.655Z"
}
```

---

### Create Menu Item (Staff Only)
```
POST /api/menu/items?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "category_id": "c-main",
  "name": "Butter Chicken",
  "description": "Tomato-butter gravy",
  "image_url": "https://...",
  "price": 380,
  "cost_price": 170,
  "discount_percentage": 0,
  "dietary_tags": ["non-veg", "spicy"],
  "preparation_time": 25
}

Response (201 Created):
{
  "id": "item_001",
  "tenant_id": "tenant-uuid",
  "category_id": "c-main",
  "name": "Butter Chicken",
  "price": 380,
  ...
}
```

---

### Update Menu Item (Staff Only)
```
PATCH /api/menu/items/{item_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "name": "Premium Butter Chicken",
  "price": 420,
  "is_available": true,
  "dietary_tags": ["non-veg"]
}

Response (200 OK):
{
  "id": "item_001",
  "name": "Premium Butter Chicken",
  "price": 420,
  ...
}
```

---

### Delete Menu Item (Soft Delete - Staff Only)
```
DELETE /api/menu/items/{item_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "message": "Menu item deleted successfully"
}
```

---

## 🛒 Order Service

**Service**: `order-service` | **Port**: `3102` | **Base Path**: `/api/orders`

### Create Order
```
POST /api/orders?tenant_id={tenant_id}
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "table_id": "3",
  "customer_id": "cust-uuid (optional - auto-uses JWT customer if not provided)",
  "items": [
    {
      "menu_item_id": "item_001",
      "quantity": 2,
      "special_requests": "No onions"
    }
  ],
  "payment_method": "RAZORPAY",
  "special_instructions": "Call me when ready"
}

Response (201 Created):
{
  "status": "ok",
  "data": {
    "id": "order-uuid",
    "order_number": 81,
    "tenant_id": "tenant-uuid",
    "customer_id": "cust-uuid",
    "table_id": "3",
    "table_number": 3,
    "status": "PENDING",
    "subtotal": 1120,
    "gst": 201.6,
    "discount_amount": 100,
    "discount_reason": "Bulk Order Discount (10%)",
    "total": 1221.6,
    "items": [
      {
        "menu_item_id": "item_001",
        "menu_item_name": "Butter Chicken",
        "quantity": 2,
        "unit_price": 560,
        "subtotal": 1120,
        "special_requests": "No onions"
      }
    ],
    "created_at": "2025-11-11T10:30:00Z",
    "updated_at": "2025-11-11T10:30:00Z"
  }
}
```

---

### Calculate Cart Discount (Real-Time Preview)
```
POST /api/orders/calculate-discount?tenant_id={tenant_id}
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Request (Does NOT create order):
{
  "items": [
    {
      "menu_item_id": "item_001",
      "quantity": 5,
      "price_at_order": 380
    }
  ],
  "payment_method": "RAZORPAY"
}

Response (200 OK):
{
  "subtotal": 1900,
  "discount_amount": 190,
  "discount_reason": "Medium Order Discount (10%)",
  "discount_percent": 10,
  "tax_amount": 342,
  "total": 2052,
  "items_count": 5
}
```

**Use Case**: Frontend calls this as customer adds items to preview discount in real-time

---

### Get Single Order
```
GET /api/orders/{order_id}?tenant_id={tenant_id}
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "id": "order-uuid",
  "order_number": 81,
  "tenant_id": "tenant-uuid",
  "customer_id": "cust-uuid",
  "table_number": 3,
  "status": "PENDING",
  "subtotal": 1120,
  "gst": 201.6,
  "discount_amount": 100,
  "discount_reason": "Bulk Order Discount",
  "total": 1221.6,
  "items": [...],
  "created_at": "2025-11-11T10:30:00Z"
}
```

---

### List Orders
```
GET /api/orders?tenant_id={tenant_id}&status={status}&limit=20&offset=0
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Query Parameters:
  tenant_id (required): Filter by tenant
  status (optional): PENDING, PREPARING, READY, SERVED, COMPLETED, CANCELLED, AWAITING_CASH_PAYMENT
  limit (optional, default=20): Results per page (max 100)
  offset (optional, default=0): Pagination offset

Response (200 OK):
{
  "status": "ok",
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "order_number": 81,
        "status": "PREPARING",
        "subtotal": 1120,
        "total": 1221.6,
        "created_at": "2025-11-11T10:30:00Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Get Customer's Order History
```
GET /api/customers/my-orders?tenant_id={tenant_id}&limit=20&offset=0
Auth: Required (Customer JWT)
Headers:
  Authorization: Bearer {customer_jwt}

Query Parameters:
  tenant_id (required): Your restaurant's tenant ID
  limit (optional, default=20): Results per page
  offset (optional, default=0): Pagination offset

Response (200 OK):
{
  "status": "ok",
  "data": {
    "total": 3,
    "orders": [
      {
        "id": "order-uuid-1",
        "order_number": 81,
        "table_id": "3",
        "status": "COMPLETED",
        "subtotal": 1120,
        "discount_amount": 100,
        "total": 1221.6,
        "created_at": "2025-11-11T10:30:00Z"
      },
      {
        "id": "order-uuid-2",
        "order_number": 80,
        "table_id": "2",
        "status": "SERVED",
        "subtotal": 840,
        "discount_amount": 0,
        "total": 991.2,
        "created_at": "2025-11-10T19:15:00Z"
      }
    ]
  }
}
```

---

### Update Order Status
```
PATCH /api/orders/{order_id}/status?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "status": "PREPARING",
  "notes": "In kitchen queue"
}

Valid Status Transitions:
  PENDING → CONFIRMED, CANCELLED
  CONFIRMED → PREPARING, CANCELLED
  PREPARING → READY, CANCELLED
  READY → SERVED, CANCELLED
  SERVED → COMPLETED, CANCELLED
  AWAITING_CASH_PAYMENT → COMPLETED, CANCELLED

Response (200 OK):
{
  "id": "order-uuid",
  "status": "PREPARING",
  "updated_at": "2025-11-11T10:35:00Z"
}
```

---

### Get Pending Cash Payments
```
GET /api/orders/pending-cash-payments?tenant_id={tenant_id}&limit=50&offset=0
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "pending_orders": [
      {
        "id": "order-uuid",
        "order_number": 81,
        "table_number": 3,
        "total": 1221.6,
        "items_count": 2,
        "created_at": "2025-11-11T10:30:00Z"
      }
    ],
    "total": 3
  }
}
```

---

## 💳 Payment Service

**Service**: `payment-service` | **Port**: `3105` | **Base Path**: `/api/payments`

### Create Razorpay Payment Order
```
POST /api/payments/razorpay/create-order?tenant_id={tenant_id}
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "order_id": "order-uuid",
  "amount": 1221.6,
  "currency": "INR"
}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "razorpay_order_id": "order_0z3dj3232",
    "amount": 1221.6,
    "currency": "INR",
    "status": "created"
  }
}
```

---

### Verify Razorpay Payment
```
POST /api/payments/razorpay/verify?tenant_id={tenant_id}
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "razorpay_order_id": "order_0z3dj3232",
  "razorpay_payment_id": "pay_1b9u41nwu9dj",
  "razorpay_signature": "signature_hash"
}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "payment_id": "payment-uuid",
    "order_id": "order-uuid",
    "status": "COMPLETED",
    "amount": 1221.6
  }
}
```

---

### Confirm Cash Payment
```
POST /api/payments/cash/confirm?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "order_id": "order-uuid",
  "amount_received": 1300,
  "change_given": 78.4
}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "payment_id": "payment-uuid",
    "order_id": "order-uuid",
    "status": "COMPLETED",
    "amount": 1221.6,
    "change_given": 78.4
  }
}
```

---

## 📦 Inventory Service

**Service**: `inventory-service` | **Port**: `3104` | **Base Path**: `/api/inventory`

### Create Inventory Item
```
POST /api/inventory/items?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "item_name": "Chicken Breast",
  "category": "Proteins",
  "quantity": 100,
  "unit": "kg",
  "reorder_level": 20,
  "cost_price": 150.00,
  "expiry_date": "2025-12-15"
}

Response (201 Created):
{
  "id": "inv-uuid",
  "item_name": "Chicken Breast",
  "quantity": 100,
  "unit": "kg",
  "reorder_level": 20,
  "cost_price": 150.00,
  "created_at": "2025-11-11T10:30:00Z"
}
```

---

### List Inventory Items
```
GET /api/inventory/items?tenant_id={tenant_id}&limit=20&offset=0
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "items": [
      {
        "id": "inv-uuid",
        "item_name": "Chicken Breast",
        "quantity": 100,
        "unit": "kg",
        "reorder_level": 20,
        "cost_price": 150.00,
        "created_at": "2025-11-11T10:30:00Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Get Inventory Item by ID
```
GET /api/inventory/items/{item_id}
Auth: None (Public)

Response (200 OK):
{
  "id": "inv-uuid",
  "item_name": "Chicken Breast",
  "category": "Proteins",
  "quantity": 100,
  "unit": "kg",
  "reorder_level": 20,
  "cost_price": 150.00,
  "expiry_date": "2025-12-15",
  "created_at": "2025-11-11T10:30:00Z"
}
```

---

### Update Inventory Item
```
PATCH /api/inventory/items/{item_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "quantity": 85,
  "reorder_level": 15
}

Response (200 OK):
{
  "id": "inv-uuid",
  "item_name": "Chicken Breast",
  "quantity": 85,
  "reorder_level": 15,
  "updated_at": "2025-11-11T10:35:00Z"
}
```

---

### Deduct Inventory (For Orders)
```
PATCH /api/inventory/deduct?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "inventory_id": "inv-uuid",
  "quantity": 5
}

Response (200 OK):
{
  "id": "inv-uuid",
  "item_name": "Chicken Breast",
  "quantity": 80,
  "updated_at": "2025-11-11T10:35:00Z"
}

Side Effects:
- If quantity ≤ reorder_level → Creates ReorderAlert
- Publishes inventory.low_stock event to Kafka
- Notification service broadcasts to managers
```

---

### Get Low Stock Alerts
```
GET /api/inventory/alerts?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "alerts": [
      {
        "id": "alert-uuid",
        "inventory_id": "inv-uuid",
        "current_quantity": 5,
        "alert_status": "WARNING",
        "created_at": "2025-11-11T10:30:00Z",
        "updated_at": "2025-11-11T10:35:00Z"
      }
    ],
    "total_alerts": 1,
    "critical": 0
  }
}

Alert Status:
- WARNING: quantity ≤ reorder_level
- CRITICAL: quantity = 0
```

---

### Get Inventory Statistics
```
GET /api/inventory/stats?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "total_items": 10,
    "total_value": 5000.00,
    "low_stock_items": 2,
    "out_of_stock_items": 1,
    "warning_alerts": 2,
    "critical_alerts": 1
  }
}
```

---

## 🎯 Discount Engine

**Service**: `discount-engine` | **Port**: `3108` | **Base Path**: `/api/discounts`

### Calculate Discount for Cart
```
POST /api/discounts/calculate?tenant_id={tenant_id}
Auth: Required (JWT + TenantGuard)
Headers:
  Authorization: Bearer {jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "items": [
    {
      "menu_item_id": "item_001",
      "quantity": 5,
      "price": 380
    }
  ],
  "payment_method": "RAZORPAY",
  "customer_id": "cust-uuid"
}

Response (200 OK):
{
  "subtotal": 1900,
  "discount_amount": 190,
  "discount_reason": "Medium Order Discount (10%)",
  "discount_percent": 10,
  "tax_amount": 342,
  "total": 2052
}

Discount Rules:
- 1-4 items: No discount
- 5-10 items: 10% (Medium Order)
- 11+ items: 20% (Bulk Order)
- Premium members: Additional 5%
```

---

## 📊 Analytics Service

**Service**: `analytics-service` | **Port**: `3107` | **Base Path**: `/api/analytics`

### Get Daily Metrics
```
GET /api/analytics/daily-metrics?tenant_id={tenant_id}&date={YYYY-MM-DD}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "date": "2025-11-11",
    "total_orders": 15,
    "total_revenue": 18324.50,
    "average_order_value": 1221.63,
    "total_discounts": 1500.00,
    "total_tax": 3300.00,
    "peak_hour": "12:00-13:00",
    "top_items": [
      {
        "item_id": "item_001",
        "name": "Butter Chicken",
        "quantity_sold": 8,
        "revenue": 3040
      }
    ]
  }
}
```

---

### Get Order Trends
```
GET /api/analytics/order-trends?tenant_id={tenant_id}&period=week
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Query Parameters:
  period: day, week, month

Response (200 OK):
{
  "status": "ok",
  "data": {
    "period": "week",
    "trends": [
      {
        "date": "2025-11-11",
        "orders": 15,
        "revenue": 18324.50,
        "avg_order_value": 1221.63
      },
      {
        "date": "2025-11-10",
        "orders": 12,
        "revenue": 14658.40,
        "avg_order_value": 1221.53
      }
    ]
  }
}
```

---

### Get Top Selling Items
```
GET /api/analytics/top-items?tenant_id={tenant_id}&limit=10
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Response (200 OK):
{
  "status": "ok",
  "data": {
    "period": "today",
    "items": [
      {
        "item_id": "item_001",
        "name": "Butter Chicken",
        "quantity_sold": 8,
        "revenue": 3040,
        "rank": 1
      },
      {
        "item_id": "item_003",
        "name": "Dal Makhani",
        "quantity_sold": 5,
        "revenue": 1250,
        "rank": 2
      }
    ]
  }
}
```

---

## 🏢 Tenant Management

**Service**: `api-gateway` | **Port**: `3100` | **Base Path**: `/api/tenants`

### Get Tenant Details (Public)
```
GET /api/tenants/{tenant_id}
Auth: None (Public)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "id": "tenant-uuid",
    "name": "Updated Restaurant Name",
    "address": "123 Main St, City",
    "contact": "9876543210",
    "owner_email": "owner@restaurant.com",
    "operating_hours": {
      "monday": ["09:00", "22:00"],
      "tuesday": ["09:00", "22:00"]
    },
    "created_at": "2025-10-21T18:45:00Z",
    "updated_at": "2025-11-11T10:30:00Z",
    "is_active": true
  }
}
```

---

### Update Tenant Details (Admin Only)
```
PATCH /api/tenants/{tenant_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Request:
{
  "name": "New Restaurant Name",
  "address": "456 Oak St, City",
  "contact": "9876543210",
  "operating_hours": {
    "monday": ["10:00", "23:00"]
  }
}

Response (200 OK):
{
  "id": "tenant-uuid",
  "name": "New Restaurant Name",
  "address": "456 Oak St, City",
  "updated_at": "2025-11-11T10:35:00Z"
}
```

---

## 🏥 Health Check Endpoints

### API Gateway Health
```
GET /health
Response: { "status": "ok", "service": "api-gateway", "timestamp": "..." }
```

### All Services Health
```
GET /services/health
Response:
{
  "status": "ok|degraded",
  "gateway": "healthy",
  "services": {
    "auth-service": { "status": "up", "healthy": true },
    "order-service": { "status": "up", "healthy": true },
    "menu-service": { "status": "up", "healthy": true },
    "inventory-service": { "status": "up", "healthy": true },
    "payment-service": { "status": "up", "healthy": true },
    "discount-engine": { "status": "up", "healthy": true },
    "notification-service": { "status": "up", "healthy": true },
    "analytics-service": { "status": "up", "healthy": true }
  },
  "timestamp": "2025-11-11T10:30:00Z"
}
```

---

## 📋 Common Response Formats

### Success Response (200/201)
```json
{
  "status": "ok",
  "data": {
    ...response_body...
  },
  "message": "Optional success message"
}
```

### Error Response (4xx/5xx)
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "code": "ERROR_CODE_ENUM"
}
```

---

## 🔑 Authentication Headers

All authenticated endpoints require:

```
Authorization: Bearer {jwt_token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json
```

---

## 🔄 Pagination

Endpoints supporting pagination use:

```
Query Parameters:
  limit (default: 20, max: 100)
  offset (default: 0)

Response:
{
  "data": {
    "items": [...],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

---

## 📊 Filtering & Sorting

### Order Filters
- `status`: PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED
- `payment_method`: RAZORPAY, CASH
- `customer_id`: Filter by customer

### Inventory Filters
- `category`: Filter by inventory category
- `below_reorder`: true/false (only show items below reorder level)

---

## ⏱️ Rate Limiting

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Bulk operations**: 50 requests/minute

---

## 🚀 Deployment URLs

- **Local Development**: `http://localhost:3100`
- **Production**: `https://intellidine-api.aahil-khan.tech`

---

## 📞 Support & Documentation

- **System Overview**: See `DOCUMENTATION/SYSTEM_OVERVIEW.md`
- **Architecture**: See `DOCUMENTATION/CODEBASE_ARCHITECTURE.md`
- **Workflows**: See `DOCUMENTATION/workflows/`
- **Stock Status Implementation**: See `STOCK_STATUS_IMPLEMENTATION.md`

---

**Last Updated**: November 11, 2025  
**API Version**: v1.0  
**Status**: ✅ Production Ready