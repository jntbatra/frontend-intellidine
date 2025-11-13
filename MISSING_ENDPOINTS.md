# Missing API Endpoints - Backend Implementation Required

**Status**: ⏳ Pending Backend Implementation  
**Last Updated**: November 11, 2025  
**Priority**: HIGH - Required for Admin Dashboard functionality

---

## 📋 Overview

This document lists all API endpoints required by the **Admin Dashboard** that are **not currently documented in `API_REFERENCE.md`**. These endpoints are essential for the admin interface to function with real data instead of mock data.

**Frontend Code Location**: `frontend/app/admin/**/*`  
**Frontend API Clients**: `frontend/lib/api/admin/*.ts`

---

## 🔐 Authentication Requirements

All endpoints require:
```
Authorization: Bearer {staff_jwt_token}
X-Tenant-ID: {tenant_id}
Content-Type: application/json
```

**Staff JWT** is obtained from: `POST /api/auth/staff/login` (documented in API_REFERENCE.md)

---

## 🛠️ Staff Management Service

**Frontend Route**: `/admin/staff`  
**Current State**: Using mock data `MOCK_STAFF`

### 1. Get All Staff Members (Paginated)
```
GET /api/staff?tenant_id={tenant_id}&role={role}&limit=20&offset=0
Auth: Required (Staff JWT + TenantGuard)
Headers:
  Authorization: Bearer {staff_jwt}
  X-Tenant-ID: {tenant_id}

Query Parameters:
  tenant_id (required): Filter by tenant
  role (optional): MANAGER, KITCHEN_STAFF, WAITER, ACCOUNTANT
  limit (optional, default=20): Results per page
  offset (optional, default=0): Pagination offset
  search (optional): Search by username or email

Response (200 OK):
{
  "status": "ok",
  "data": {
    "staff": [
      {
        "id": "staff-uuid",
        "tenant_id": "tenant-uuid",
        "username": "manager1",
        "email": "manager@restaurant.com",
        "phone": "9876543210",
        "role": "MANAGER",
        "status": "ACTIVE",
        "created_at": "2025-10-21T19:26:00Z",
        "updated_at": "2025-10-21T19:26:00Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### 2. Get Single Staff Member
```
GET /api/staff/{staff_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "id": "staff-uuid",
  "tenant_id": "tenant-uuid",
  "username": "manager1",
  "email": "manager@restaurant.com",
  "phone": "9876543210",
  "role": "MANAGER",
  "status": "ACTIVE",
  "created_at": "2025-10-21T19:26:00Z",
  "updated_at": "2025-10-21T19:26:00Z"
}
```

### 3. Create Staff Member
```
POST /api/staff?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "username": "waiter1",
  "email": "waiter@restaurant.com",
  "password": "SecurePassword@123",
  "phone": "9876543210",
  "role": "WAITER"
}

Response (201 Created):
{
  "id": "staff-uuid",
  "username": "waiter1",
  "email": "waiter@restaurant.com",
  "phone": "9876543210",
  "role": "WAITER",
  "status": "ACTIVE",
  "created_at": "2025-11-11T10:30:00Z"
}
```

### 4. Update Staff Member
```
PATCH /api/staff/{staff_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "email": "newemail@restaurant.com",
  "phone": "9876543211",
  "role": "KITCHEN_STAFF",
  "status": "ACTIVE"
}

Response (200 OK):
{
  "id": "staff-uuid",
  "username": "waiter1",
  "email": "newemail@restaurant.com",
  "phone": "9876543211",
  "role": "KITCHEN_STAFF",
  "status": "ACTIVE",
  "updated_at": "2025-11-11T10:35:00Z"
}
```

### 5. Delete Staff Member (Soft Delete)
```
DELETE /api/staff/{staff_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "message": "Staff member deleted successfully"
}
```

### 6. Change Staff Password
```
POST /api/staff/{staff_id}/change-password?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "current_password": "OldPassword@123",
  "new_password": "NewPassword@456"
}

Response (200 OK):
{
  "message": "Password changed successfully"
}
```

---

## 📦 Order Details & Updates

**Frontend Route**: `/admin/orders`, `/admin/orders/[id]`  
**Current State**: Using mock data `MOCK_ORDERS`

### Notes:
- ✅ `GET /api/orders` - Already documented
- ✅ `GET /api/orders/{order_id}` - Already documented
- ✅ `PATCH /api/orders/{order_id}/status` - Already documented
- ⚠️ Needs clarification on complete order workflow & payment handling

### New Required: Get Pending Payments (Different from Cash)
```
GET /api/orders/pending-razorpay-payments?tenant_id={tenant_id}&limit=50
Auth: Required (Staff JWT + TenantGuard)

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
        "customer_phone": "9876543210",
        "items_count": 2,
        "created_at": "2025-11-11T10:30:00Z",
        "razorpay_order_id": "order_0z3dj3232"
      }
    ],
    "total": 5
  }
}
```

---

## 🍽️ Menu Management Enhancements

**Frontend Route**: `/admin/menu`, `/admin/menu/add`, `/admin/menu/[id]`  
**Current State**: Using mock data `MOCK_MENU_ITEMS`, `MOCK_CATEGORIES`

### Notes:
- ✅ `GET /api/menu` - Already documented (public)
- ✅ `GET /api/menu/categories` - Already documented (public)
- ✅ `POST /api/menu/items` - Already documented
- ✅ `PATCH /api/menu/items/{item_id}` - Already documented
- ✅ `DELETE /api/menu/items/{item_id}` - Already documented

### New Required: Bulk Update Menu Items Availability
```
PATCH /api/menu/items/bulk-update?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "item_ids": ["item_001", "item_002", "item_003"],
  "updates": {
    "is_available": false,
    "reason": "Out of ingredients"
  }
}

Response (200 OK):
{
  "updated_count": 3,
  "message": "3 items updated successfully"
}
```

### New Required: Get Menu Item Stock/Availability Status
```
GET /api/menu/items/{item_id}/availability?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "item_id": "item_001",
  "is_available": true,
  "stock_status": "AVAILABLE",
  "current_stock": 45,
  "reorder_level": 20,
  "last_checked": "2025-11-11T10:30:00Z"
}
```

---

## 📊 Analytics Enhancements

**Frontend Route**: `/admin/analytics`, `/admin/analytics/report`  
**Current State**: Using mock data `MOCK_ANALYTICS`

### Notes:
- ✅ `GET /api/analytics/daily-metrics` - Already documented
- ✅ `GET /api/analytics/order-trends` - Already documented
- ✅ `GET /api/analytics/top-items` - Already documented

### New Required: Get Analytics Dashboard Summary
```
GET /api/analytics/dashboard-summary?tenant_id={tenant_id}&period=day
Auth: Required (Staff JWT + TenantGuard)

Query Parameters:
  tenant_id (required)
  period: day, week, month, year (default: day)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "period": "day",
    "date": "2025-11-11",
    "total_orders": 15,
    "total_revenue": 18324.50,
    "total_discount_given": 1500.00,
    "total_tax": 3300.00,
    "average_order_value": 1221.63,
    "order_completion_rate": 93.3,
    "top_items": [
      {
        "item_id": "item_001",
        "name": "Butter Chicken",
        "quantity_sold": 8,
        "revenue": 3040
      }
    ],
    "payment_methods": {
      "cash": 8500.00,
      "card": 6824.50,
      "upi": 2000.00
    },
    "order_status_breakdown": {
      "completed": 13,
      "preparing": 1,
      "ready": 1,
      "pending": 0,
      "cancelled": 0
    }
  }
}
```

### New Required: Get Hourly Revenue Chart Data
```
GET /api/analytics/hourly-revenue?tenant_id={tenant_id}&date={YYYY-MM-DD}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "date": "2025-11-11",
    "hourly_data": [
      {
        "hour": "09:00",
        "revenue": 0,
        "orders_count": 0
      },
      {
        "hour": "10:00",
        "revenue": 1500.00,
        "orders_count": 2
      },
      {
        "hour": "12:00",
        "revenue": 6500.00,
        "orders_count": 5
      }
    ]
  }
}
```

### New Required: Get Top Customers
```
GET /api/analytics/top-customers?tenant_id={tenant_id}&limit=10&period=month
Auth: Required (Staff JWT + TenantGuard)

Query Parameters:
  tenant_id (required)
  limit (optional, default=10)
  period: day, week, month, year

Response (200 OK):
{
  "status": "ok",
  "data": {
    "customers": [
      {
        "customer_id": "cust-uuid",
        "customer_phone": "9876543210",
        "customer_name": "Rajesh Kumar",
        "total_orders": 5,
        "total_spent": 6108,
        "last_order_date": "2025-11-11T18:00:00Z"
      }
    ]
  }
}
```

### New Required: Get Payment Method Breakdown
```
GET /api/analytics/payment-methods?tenant_id={tenant_id}&date_from={date}&date_to={date}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "breakdown": [
      {
        "method": "RAZORPAY",
        "total_amount": 6824.50,
        "order_count": 6,
        "percentage": 37.2
      },
      {
        "method": "CASH",
        "total_amount": 8500.00,
        "order_count": 8,
        "percentage": 46.4
      },
      {
        "method": "UPI",
        "total_amount": 2000.00,
        "order_count": 1,
        "percentage": 10.9
      }
    ]
  }
}
```

---

## 💰 Discounts Management

**Frontend Route**: `/admin/discounts`, `/admin/discounts/new`, `/admin/discounts/[id]`  
**Current State**: Using mock data via `useDiscounts` hook

### Notes:
- ✅ `POST /api/discounts/calculate` - Already documented

### New Required: Get All Discounts
```
GET /api/discounts?tenant_id={tenant_id}&status=active&type=percentage&limit=20&offset=0
Auth: Required (Staff JWT + TenantGuard)

Query Parameters:
  tenant_id (required)
  status (optional): active, inactive, expired, scheduled
  type (optional): percentage, fixed_amount, bogo, quantity_based
  limit (optional, default=20)
  offset (optional, default=0)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "discounts": [
      {
        "id": "discount-uuid",
        "tenant_id": "tenant-uuid",
        "code": "BULK10",
        "type": "percentage",
        "value": 10,
        "description": "10% off for 5+ items",
        "status": "active",
        "valid_from": "2025-10-01T00:00:00Z",
        "valid_until": "2025-12-31T23:59:59Z",
        "usage_count": 45,
        "usage_limit": null,
        "applicable_payment_methods": ["RAZORPAY", "UPI", "CASH"],
        "created_at": "2025-10-01T10:00:00Z",
        "updated_at": "2025-10-01T10:00:00Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### New Required: Get Single Discount
```
GET /api/discounts/{discount_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "id": "discount-uuid",
  "code": "BULK10",
  "type": "percentage",
  "value": 10,
  "description": "10% off for 5+ items",
  "status": "active",
  "valid_from": "2025-10-01T00:00:00Z",
  "valid_until": "2025-12-31T23:59:59Z",
  "usage_count": 45,
  "usage_limit": null,
  "applicable_payment_methods": ["RAZORPAY", "UPI", "CASH"],
  "created_at": "2025-10-01T10:00:00Z"
}
```

### New Required: Create Discount
```
POST /api/discounts?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "code": "WEEKEND20",
  "type": "percentage",
  "value": 20,
  "description": "20% off weekend orders",
  "valid_from": "2025-11-15T00:00:00Z",
  "valid_until": "2025-11-30T23:59:59Z",
  "usage_limit": 100,
  "applicable_payment_methods": ["RAZORPAY", "UPI", "CASH"],
  "min_order_value": 500
}

Response (201 Created):
{
  "id": "discount-uuid",
  "code": "WEEKEND20",
  "type": "percentage",
  "value": 20,
  "description": "20% off weekend orders",
  "status": "scheduled",
  "usage_count": 0,
  "created_at": "2025-11-11T10:30:00Z"
}
```

### New Required: Update Discount
```
PATCH /api/discounts/{discount_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "status": "inactive",
  "usage_limit": 50
}

Response (200 OK):
{
  "id": "discount-uuid",
  "code": "WEEKEND20",
  "status": "inactive",
  "usage_limit": 50,
  "updated_at": "2025-11-11T10:35:00Z"
}
```

### New Required: Delete Discount
```
DELETE /api/discounts/{discount_id}?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "message": "Discount deleted successfully"
}
```

### New Required: Get Discount Statistics
```
GET /api/discounts/stats?tenant_id={tenant_id}&period=month
Auth: Required (Staff JWT + TenantGuard)

Query Parameters:
  period: day, week, month, year

Response (200 OK):
{
  "status": "ok",
  "data": {
    "total_discounts": 12,
    "active_discounts": 8,
    "total_savings_given": 45000.00,
    "average_discount_per_order": 250.00,
    "most_used_discount": {
      "code": "BULK10",
      "usage_count": 150
    },
    "discount_types": [
      {
        "type": "percentage",
        "count": 8,
        "total_savings": 25000.00
      },
      {
        "type": "fixed_amount",
        "count": 4,
        "total_savings": 20000.00
      }
    ]
  }
}
```

---

## 📦 Notifications & Alerts

**Frontend Route**: `/admin/notifications`  
**Current State**: May need implementation

### New Required: Get Notifications
```
GET /api/notifications?tenant_id={tenant_id}&status=unread&limit=20
Auth: Required (Staff JWT + TenantGuard)

Query Parameters:
  status: unread, read, all
  limit (optional, default=20)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "type": "LOW_STOCK_ALERT",
        "title": "Butter Chicken Low Stock",
        "message": "Butter Chicken stock is below reorder level",
        "data": {
          "inventory_id": "inv-uuid",
          "current_quantity": 5,
          "reorder_level": 20
        },
        "read": false,
        "created_at": "2025-11-11T10:30:00Z"
      }
    ],
    "total": 1,
    "unread_count": 1
  }
}
```

### New Required: Mark Notification as Read
```
PATCH /api/notifications/{notification_id}/mark-read?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "message": "Notification marked as read"
}
```

---

## 🔐 Tenant Management Enhancements

**Frontend Route**: `/admin/profile` (Settings/Tenant Profile)

### New Required: Get Operating Hours
```
GET /api/tenants/{tenant_id}/operating-hours
Auth: Required (Staff JWT + TenantGuard)

Response (200 OK):
{
  "status": "ok",
  "data": {
    "operating_hours": {
      "monday": {
        "open": "09:00",
        "close": "22:00",
        "is_open": true
      },
      "tuesday": {
        "open": "09:00",
        "close": "22:00",
        "is_open": true
      }
    }
  }
}
```

### New Required: Update Operating Hours
```
PATCH /api/tenants/{tenant_id}/operating-hours?tenant_id={tenant_id}
Auth: Required (Staff JWT + TenantGuard)

Request:
{
  "operating_hours": {
    "monday": {
      "open": "10:00",
      "close": "23:00"
    },
    "tuesday": {
      "open": "10:00",
      "close": "23:00"
    }
  }
}

Response (200 OK):
{
  "message": "Operating hours updated successfully"
}
```

---

## 🛡️ Implementation Priority

### Phase 1 (Critical - Must Have)
- [ ] Staff Management (CRUD)
- [ ] Orders Pending Payments
- [ ] Analytics Dashboard Summary
- [ ] Discounts Management (CRUD)

### Phase 2 (High Priority)
- [ ] Menu Bulk Updates
- [ ] Analytics Enhancements (Hourly, Customers, Payment Breakdown)
- [ ] Notifications System
- [ ] Inventory Adjustments (already in progress, might need API enhancements)

### Phase 3 (Nice to Have)
- [ ] Operating Hours Management
- [ ] Menu Item Availability Status
- [ ] Advanced Analytics Reports

---

## 📝 Notes for Backend Implementation

1. **Pagination**: All list endpoints should support `limit` and `offset` query parameters
2. **Filtering**: Support filtering by status, type, date range where applicable
3. **Sorting**: Consider adding `sort_by` and `sort_order` query parameters
4. **Soft Deletes**: Use soft deletes for staff and discounts (don't hard delete from database)
5. **Audit Logging**: Log all admin actions (create, update, delete)
6. **Tenant Isolation**: Ensure all queries are scoped to the tenant_id in the request
7. **Rate Limiting**: Apply rate limiting to bulk operations
8. **Error Handling**: Return consistent error responses with proper HTTP status codes

---

## 🔗 Related Files

- **API Reference**: `DOCUMENTATION/api.json` & `API_REFERENCE.md`
- **Frontend Admin Components**: `frontend/app/admin/**/*`
- **Frontend API Clients**: `frontend/lib/api/admin/*.ts`
- **Frontend Hooks**: `frontend/hooks/admin/*.ts`
- **Mock Data**: `frontend/lib/constants/mock*.ts`

---

**Created**: November 11, 2025  
**Status**: ⏳ Awaiting Backend Implementation  
**Assigned to**: Backend Team (@jntbatra)
