# 🚀 14 New Endpoints - Complete API Spec

**Base URL**: `http://localhost:3100`  
**Auth**: All endpoints require `Authorization: Bearer <jwt_token>` header

---

## 1️⃣ List Staff
**GET** `/api/auth/staff?limit=20&offset=0&role=MANAGER&search=john`

**Query Params**:
- `limit` (optional): 1-100, default 20
- `offset` (optional): pagination offset, default 0
- `role` (optional): MANAGER, KITCHEN_STAFF, WAITER, SUPER_ADMIN
- `search` (optional): search username/email

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "staff": [
      {
        "id": "staff_001",
        "username": "manager1",
        "email": "manager@restaurant.com",
        "phone": "9876543210",
        "role": "MANAGER",
        "tenant_id": "tenant_123",
        "is_active": true,
        "created_at": "2025-11-01T10:00:00Z",
        "updated_at": "2025-11-11T15:30:00Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

## 2️⃣ Get Staff by ID
**GET** `/api/auth/staff/{staff_id}`

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "id": "staff_001",
    "username": "manager1",
    "email": "manager@restaurant.com",
    "phone": "9876543210",
    "role": "MANAGER",
    "tenant_id": "tenant_123",
    "is_active": true,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-11T15:30:00Z"
  }
}
```

**Error (404)**:
```json
{
  "status": "error",
  "message": "Staff member not found"
}
```

---

## 3️⃣ Create Staff
**POST** `/api/auth/staff`

**Request Body**:
```json
{
  "username": "waiter_john",
  "email": "john@restaurant.com",
  "password": "SecurePass@123",
  "phone": "9876543210",
  "role": "WAITER"
}
```

**Response (201)**:
```json
{
  "status": "ok",
  "data": {
    "id": "staff_002",
    "username": "waiter_john",
    "email": "john@restaurant.com",
    "phone": "9876543210",
    "role": "WAITER",
    "tenant_id": "tenant_123",
    "is_active": true,
    "created_at": "2025-11-11T16:00:00Z"
  },
  "message": "Staff member created successfully"
}
```

**Error (400)**:
```json
{
  "status": "error",
  "message": "Email already exists"
}
```

---

## 4️⃣ Update Staff
**PATCH** `/api/auth/staff/{staff_id}`

**Request Body** (all optional):
```json
{
  "email": "newemail@restaurant.com",
  "phone": "9876543211",
  "role": "KITCHEN_STAFF",
  "is_active": true
}
```

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "id": "staff_001",
    "username": "manager1",
    "email": "newemail@restaurant.com",
    "phone": "9876543211",
    "role": "KITCHEN_STAFF",
    "tenant_id": "tenant_123",
    "is_active": true,
    "updated_at": "2025-11-11T16:15:00Z"
  },
  "message": "Staff member updated successfully"
}
```

---

## 5️⃣ Delete Staff (Soft Delete)
**DELETE** `/api/auth/staff/{staff_id}`

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "id": "staff_001",
    "username": "manager1",
    "is_active": false,
    "updated_at": "2025-11-11T16:20:00Z"
  },
  "message": "Staff member deactivated successfully"
}
```

---

## 6️⃣ Change Staff Password
**POST** `/api/auth/staff/{staff_id}/change-password`

**Request Body**:
```json
{
  "current_password": "OldPassword@123",
  "new_password": "NewPassword@456"
}
```

**Response (200)**:
```json
{
  "status": "ok",
  "message": "Password changed successfully"
}
```

**Error (401)**:
```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

---

## 7️⃣ Get Pending Razorpay Payments
**GET** `/api/orders/pending-razorpay-payments?limit=20&offset=0&tenant_id=...`

**Query Params**:
- `limit` (optional): default 20
- `offset` (optional): default 0
- `tenant_id` (optional): filter by tenant

**Response (200)**:
```json
{
  "status": "ok",
  "data": [
    {
      "order_id": "order_001",
      "customer_id": "cust_001",
      "table_id": 5,
      "status": "PENDING_PAYMENT",
      "payment_method": "RAZORPAY",
      "razorpay_order_id": "razorpay_001",
      "amount": 2500.00,
      "currency": "INR",
      "created_at": "2025-11-11T14:00:00Z",
      "items_count": 3
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

---

## 8️⃣ Get Kitchen Orders (Kitchen Display System)
**GET** `/api/orders/kitchen/orders?status=PENDING,PREPARING,READY&tenant_id=...`

**Query Params**:
- `status` (optional): comma-separated PENDING,PREPARING,READY,SERVED
- `tenant_id` (optional): filter by tenant
- `limit` (optional): default 100

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "orders": [
      {
        "id": "order_001",
        "table_id": 5,
        "status": "PREPARING",
        "items": [
          {
            "menu_item_id": "item_001",
            "name": "Paneer Tikka",
            "quantity": 2,
            "special_instructions": "Extra spicy"
          },
          {
            "menu_item_id": "item_002",
            "name": "Biryani",
            "quantity": 1,
            "special_instructions": ""
          }
        ],
        "created_at": "2025-11-11T15:00:00Z",
        "started_at": "2025-11-11T15:05:00Z"
      }
    ],
    "total": 8
  }
}
```

---

## 9️⃣ Update Kitchen Order Status
**POST** `/api/orders/kitchen/orders/{order_id}/status`

**Request Body**:
```json
{
  "status": "READY",
  "notes": "Order ready for serving"
}
```

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "order_id": "order_001",
    "old_status": "PREPARING",
    "new_status": "READY",
    "updated_at": "2025-11-11T15:15:00Z"
  },
  "message": "Order status updated successfully"
}
```

---

## 🔟 Get Dashboard Summary
**GET** `/api/analytics/dashboard-summary?period=day`

**Query Params**:
- `period` (required): day, week, month, year

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "period": "day",
    "total_orders": 24,
    "total_revenue": 12500.50,
    "avg_order_value": 520.85,
    "payment_breakdown": {
      "CASH": 8000.00,
      "RAZORPAY": 4500.50
    },
    "order_status_breakdown": {
      "COMPLETED": 20,
      "CANCELLED": 2,
      "PENDING": 2
    },
    "top_items": [
      {
        "item_id": "item_001",
        "name": "Paneer Tikka",
        "qty_sold": 15,
        "revenue": 2250.00
      },
      {
        "item_id": "item_002",
        "name": "Biryani",
        "qty_sold": 12,
        "revenue": 2400.00
      }
    ],
    "generated_at": "2025-11-11T16:30:00Z"
  }
}
```

---

## 1️⃣1️⃣ Bulk Update Inventory
**POST** `/api/inventory/bulk-update`

**Request Body**:
```json
{
  "item_ids": ["inv_001", "inv_002", "inv_003"],
  "updates": {
    "quantity_on_hand": 50,
    "reorder_level": 10,
    "unit_cost": 150.00
  }
}
```

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "updated_count": 3,
    "updated_items": [
      {
        "item_id": "inv_001",
        "name": "Paneer (kg)",
        "quantity_on_hand": 50,
        "reorder_level": 10
      },
      {
        "item_id": "inv_002",
        "name": "Tomatoes (kg)",
        "quantity_on_hand": 50,
        "reorder_level": 10
      },
      {
        "item_id": "inv_003",
        "name": "Onions (kg)",
        "quantity_on_hand": 50,
        "reorder_level": 10
      }
    ]
  },
  "message": "3 inventory items updated successfully"
}
```

---

## 1️⃣2️⃣ Bulk Update Menu Items
**PATCH** `/api/menu/items/bulk-update`

**Request Body**:
```json
{
  "item_ids": ["item_001", "item_002", "item_003"],
  "updates": {
    "price": 299.99,
    "discount_percentage": 10
  }
}
```

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "updated_count": 3,
    "updated_items": [
      {
        "item_id": "item_001",
        "name": "Paneer Tikka",
        "price": 299.99,
        "discount_percentage": 10
      },
      {
        "item_id": "item_002",
        "name": "Chicken Tikka",
        "price": 299.99,
        "discount_percentage": 10
      },
      {
        "item_id": "item_003",
        "name": "Fish Tikka",
        "price": 299.99,
        "discount_percentage": 10
      }
    ]
  },
  "message": "3 menu items updated successfully"
}
```

---

## 1️⃣3️⃣ Bulk Update Menu Status
**POST** `/api/menu/items/bulk-status`

**Request Body**:
```json
{
  "item_ids": ["item_001", "item_002"],
  "status": "active"
}
```

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "updated_count": 2,
    "message": "2 items status changed to active"
  }
}
```

---

## 1️⃣4️⃣ Get Menu Item Availability
**GET** `/api/menu/items/{item_id}/availability?tenant_id=...`

**Query Params**:
- `tenant_id` (optional): filter by tenant

**Response (200)**:
```json
{
  "status": "ok",
  "data": {
    "item_id": "item_001",
    "name": "Paneer Tikka",
    "is_available": true,
    "stock_status": "AVAILABLE",
    "current_stock": 25,
    "reorder_level": 5,
    "last_checked": "2025-11-11T16:45:00Z"
  }
}
```

**Response (200 - Out of Stock)**:
```json
{
  "status": "ok",
  "data": {
    "item_id": "item_002",
    "name": "Biryani",
    "is_available": false,
    "stock_status": "OUT_OF_STOCK",
    "current_stock": 0,
    "reorder_level": 10,
    "last_checked": "2025-11-11T16:45:00Z"
  }
}
```

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | ✅ Success |
| 201 | ✅ Created |
| 400 | ❌ Bad request / Validation error |
| 401 | ❌ Unauthorized (missing/invalid JWT) |
| 403 | ❌ Forbidden (insufficient permissions) |
| 404 | ❌ Not found |
| 422 | ❌ Unprocessable entity |
| 500 | ❌ Server error |

---

## Authentication

All endpoints require JWT token:
```
Authorization: Bearer <your_jwt_token>
```

Example:
```bash
curl -X GET "http://localhost:3100/api/auth/staff?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Response Format

All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```