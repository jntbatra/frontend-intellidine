# Admin Dashboard API Integration - Implementation Guide

**Status**: 🚀 Ready for Integration  
**Last Updated**: November 11, 2025  
**Frontend Location**: `frontend/app/admin/**/*`  
**API Services**: `frontend/lib/api/admin/*.ts`  
**Backend**: Awaiting implementation of endpoints in `MISSING_ENDPOINTS.md`

---

## 📊 Executive Summary

The admin dashboard frontend is now fully prepared for real API integration. All mock data has been identified, and comprehensive API service layers have been created with proper TypeScript types and functions.

### What's Been Done ✅

1. **Created `MISSING_ENDPOINTS.md`** - Comprehensive specification of all required backend endpoints (65+ endpoints across 8 services)
2. **Enhanced API Services** - All admin API service files (`lib/api/admin/*.ts`) now have:
   - ✅ Complete TypeScript type definitions
   - ✅ All necessary API functions with proper signatures
   - ✅ Support for pagination, filtering, and sorting
   - ✅ Proper error handling with `ApiResponse` types
   - ✅ Integration with centralized `apiClient` from `lib/api/client.ts`

### What's Next 🔄

1. **Backend Implementation** - Implement all endpoints in `MISSING_ENDPOINTS.md`
2. **Frontend Page Integration** - Replace mock data in admin pages with real API calls
3. **Testing** - Integration testing across all admin modules

---

## 🏗️ Architecture Overview

### API Service Layer (`lib/api/admin/`)

All admin API calls are organized by domain:

```
lib/api/admin/
├── orders.ts          # Order management (list, create, update status)
├── menu.ts            # Menu item CRUD and bulk operations
├── inventory.ts       # Stock management and low stock alerts
├── staff.ts           # Staff member management
├── analytics.ts       # Dashboard metrics and trends
├── discounts.ts       # Promotional codes and discounts
├── notifications.ts   # System notifications (NEW)
└── [existing files]   # profile.ts, customer/ (public APIs)
```

### Centralized API Client

**File**: `lib/api/client.ts`
- Handles authentication tokens from `localStorage.auth_token`
- Adds `X-Tenant-ID` header from `localStorage.current_tenant_id`
- Automatic error handling and retry logic
- Request/response interceptors ready

### Authentication Flow

All admin endpoints require:
```typescript
Authorization: Bearer {staff_jwt_token}
X-Tenant-ID: {tenant_id}
```

**Token Flow**:
1. Staff logs in via `POST /api/auth/staff/login` (already implemented in API_REFERENCE.md)
2. Frontend stores `auth_token` and `current_tenant_id` in localStorage
3. All subsequent requests automatically include these headers via `apiClient`

---

## 📋 API Service Functions Reference

### Orders (`lib/api/admin/orders.ts`)

```typescript
// Get all orders with filters
getOrders(tenantId: string, params?: OrderFilterParams)
  → Returns: Order[]

// Get single order details
getOrder(orderId: string, tenantId: string)
  → Returns: Order

// Create new order
createOrder(payload: CreateOrderPayload, tenantId: string)
  → Returns: Order

// Update order status (PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED)
updateOrderStatus(orderId: string, payload: UpdateOrderStatusPayload, tenantId: string)
  → Returns: Order

// Get pending cash payments
getPendingCashPayments(tenantId: string, limit?: number, offset?: number)
  → Returns: { pending_orders: Order[]; total: number }

// Get pending Razorpay payments
getPendingRazorpayPayments(tenantId: string, limit?: number)
  → Returns: Pending order details
```

**Usage Example**:
```typescript
import { getOrders, updateOrderStatus } from "@/lib/api/admin/orders";

// List orders
const response = await getOrders(tenantId, {
  status: "in_preparation",
  limit: 20,
  offset: 0
});

// Update order status
await updateOrderStatus(orderId, { status: "ready" }, tenantId);
```

### Menu (`lib/api/admin/menu.ts`)

```typescript
// Get menu with categories
getMenu(tenantId: string, categoryId?: string)
  → Returns: MenuItemsResponse with categories and items

// Get menu categories
getMenuCategories(tenantId: string)
  → Returns: { categories: MenuCategory[] }

// Get all menu items (with admin details)
getMenuItems(tenantId: string, category?: string, limit?: number, offset?: number)
  → Returns: MenuItem[]

// Get single menu item
getMenuItem(itemId: string, tenantId: string)
  → Returns: MenuItem

// Create menu item
createMenuItem(payload: CreateMenuItemPayload, tenantId: string)
  → Returns: MenuItem

// Update menu item
updateMenuItem(itemId: string, payload: UpdateMenuItemPayload, tenantId: string)
  → Returns: MenuItem

// Bulk update items (e.g., mark multiple as unavailable)
bulkUpdateMenuItems(payload: BulkUpdateMenuItemsPayload, tenantId: string)
  → Returns: { updated_count: number; message: string }

// Delete menu item
deleteMenuItem(itemId: string, tenantId: string)
  → Returns: { message: string }
```

**Usage Example**:
```typescript
import { getMenuItems, createMenuItem, updateMenuItem } from "@/lib/api/admin/menu.ts";

// Get menu items with pagination
const items = await getMenuItems(tenantId, "MAIN_COURSE", 50, 0);

// Create new item
const newItem = await createMenuItem({
  name: "Paneer Tikka",
  price: 280,
  category: "APPETIZERS",
  is_vegetarian: true
}, tenantId);

// Update item
await updateMenuItem(itemId, { price: 300 }, tenantId);
```

### Inventory (`lib/api/admin/inventory.ts`)

```typescript
// Get all inventory items
getInventoryItems(tenantId: string, category?: string, limit?: number, offset?: number)
  → Returns: InventoryItem[]

// Get single inventory item
getInventoryItem(itemId: string)
  → Returns: InventoryItem

// Create inventory item
createInventoryItem(payload: Partial<InventoryItem>, tenantId: string)
  → Returns: InventoryItem

// Update inventory item (quantity, reorder level, etc.)
updateInventoryItem(itemId: string, payload: Partial<InventoryItem>, tenantId: string)
  → Returns: InventoryItem

// Deduct inventory (when order is placed)
deductInventory(inventoryId: string, quantity: number, tenantId: string)
  → Returns: InventoryItem

// Adjust stock (in/out with reason)
adjustInventoryStock(inventoryId: string, adjustment: StockAdjustment, tenantId: string)
  → Returns: InventoryItem

// Get low stock alerts
getLowStockAlerts(tenantId: string)
  → Returns: { alerts: InventoryAlert[]; total_alerts: number; critical: number }

// Get inventory statistics
getInventoryStats(tenantId: string)
  → Returns: InventoryStats
```

### Staff (`lib/api/admin/staff.ts`)

```typescript
// Get all staff members with filters
getStaffList(tenantId: string, role?: string, search?: string, limit?: number, offset?: number)
  → Returns: StaffMember[]

// Get single staff member
getStaffMember(staffId: string, tenantId: string)
  → Returns: StaffMember

// Create staff member
createStaff(payload: CreateStaffPayload, tenantId: string)
  → Returns: StaffMember

// Update staff member
updateStaff(staffId: string, payload: UpdateStaffPayload, tenantId: string)
  → Returns: StaffMember

// Delete staff member (soft delete)
deleteStaff(staffId: string, tenantId: string)
  → Returns: { message: string }

// Change staff password
changeStaffPassword(staffId: string, payload: ChangePasswordPayload, tenantId: string)
  → Returns: { message: string }
```

### Analytics (`lib/api/admin/analytics.ts`)

```typescript
// Get dashboard summary (key metrics)
getDashboardSummary(tenantId: string, period?: "day" | "week" | "month" | "year")
  → Returns: DashboardSummary with all key KPIs

// Get daily metrics
getDailyMetrics(tenantId: string, date?: string)
  → Returns: Daily revenue, orders, discounts, tax

// Get order trends over time
getOrderTrends(tenantId: string, period?: "day" | "week" | "month" | "year")
  → Returns: Orders and revenue by date

// Get top selling items
getTopItems(tenantId: string, limit?: number)
  → Returns: PopularItem[] with sales and revenue

// Get hourly revenue (for charts)
getHourlyRevenue(tenantId: string, date: string)
  → Returns: Revenue breakdown by hour

// Get top customers
getTopCustomers(tenantId: string, limit?: number, period?: "day" | "week" | "month" | "year")
  → Returns: TopCustomer[] with spending and order count

// Get payment method breakdown
getPaymentMethodBreakdown(tenantId: string, dateFrom?: string, dateTo?: string)
  → Returns: PaymentMethodBreakdown[] with totals and percentages
```

### Discounts (`lib/api/admin/discounts.ts`)

```typescript
// Get all discounts with filters
getDiscounts(tenantId: string, status?: string, type?: string, limit?: number, offset?: number)
  → Returns: Discount[]

// Get single discount
getDiscount(discountId: string, tenantId: string)
  → Returns: Discount

// Create discount
createDiscount(payload: CreateDiscountPayload, tenantId: string)
  → Returns: Discount

// Update discount
updateDiscount(discountId: string, payload: UpdateDiscountPayload, tenantId: string)
  → Returns: Discount

// Delete discount
deleteDiscount(discountId: string, tenantId: string)
  → Returns: { message: string }

// Get discount statistics
getDiscountStats(tenantId: string, period?: "day" | "week" | "month" | "year")
  → Returns: DiscountStats with usage, savings, top types
```

### Notifications (`lib/api/admin/notifications.ts`)

```typescript
// Get notifications
getNotifications(tenantId: string, status?: "unread" | "read" | "all", limit?: number, offset?: number)
  → Returns: Notification[]

// Mark single notification as read
markNotificationAsRead(notificationId: string, tenantId: string)
  → Returns: { message: string }

// Mark all notifications as read
markAllNotificationsAsRead(tenantId: string)
  → Returns: { message: string }

// Delete notification
deleteNotification(notificationId: string, tenantId: string)
  → Returns: { message: string }
```

---

## 🎯 Integration Strategy

### Phase 1: Quick Wins (Orders Page)

**File to Update**: `frontend/app/admin/orders/page.tsx`

**Current State**: Using `MOCK_ORDERS`  
**Target**: Real API calls

```typescript
import { getOrders, updateOrderStatus } from "@/lib/api/admin/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const tenantId = localStorage.getItem("current_tenant_id")!;
        const response = await getOrders(tenantId, {
          status: statusFilter !== "all" ? statusFilter : undefined,
          payment_method: paymentFilter !== "all" ? paymentFilter : undefined,
          limit: 20,
          offset: 0
        });
        
        if (response.success && response.data?.orders) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [statusFilter, paymentFilter]);
  
  // Handle status update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const tenantId = localStorage.getItem("current_tenant_id")!;
      const response = await updateOrderStatus(orderId, { status: newStatus }, tenantId);
      
      if (response.success) {
        setOrders(orders.map(o => o.id === orderId ? response.data! : o));
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };
}
```

### Phase 2: Menu Management

**File to Update**: `frontend/app/admin/menu/page.tsx`

Replace `MOCK_MENU_ITEMS` with API calls to `getMenuItems()`, `createMenuItem()`, `updateMenuItem()`, `deleteMenuItem()`.

### Phase 3: Inventory & Analytics

**Files**: 
- `frontend/app/admin/inventory/page.tsx`
- `frontend/app/admin/analytics/page.tsx`

Replace mock data with corresponding API functions.

### Phase 4: Staff & Discounts

**Files**:
- `frontend/app/admin/staff/page.tsx`
- `frontend/app/admin/discounts/page.tsx`

Implement full CRUD operations using staff and discount API functions.

---

## 🧪 Testing Checklist

### Before Integration
- [ ] Backend has implemented all endpoints in `MISSING_ENDPOINTS.md`
- [ ] All endpoints return proper response format matching API_REFERENCE.md
- [ ] Authentication works (JWT token validation)
- [ ] Tenant isolation is enforced (queries scoped by tenant_id)

### Integration Testing
- [ ] Orders: List → View → Update Status → Complete
- [ ] Menu: List → Create → Update → Delete
- [ ] Inventory: List → Adjust Stock → View Alerts
- [ ] Staff: List → Add → Edit → Delete
- [ ] Analytics: Dashboard loads → Trends render → Exports work
- [ ] Discounts: List → Create → Apply to Orders → Statistics

### Edge Cases
- [ ] Empty data handling (no orders, no menu items, etc.)
- [ ] Pagination (test limit/offset)
- [ ] Filtering (status, category, role, etc.)
- [ ] Error handling (API failures, network errors)
- [ ] Loading states (show spinners while fetching)
- [ ] Optimistic updates (update UI before API response)

---

## 🔗 Related Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **MISSING_ENDPOINTS.md** | Backend implementation spec | `DOCUMENTATION/MISSING_ENDPOINTS.md` |
| **API_REFERENCE.md** | Complete API documentation | `API_REFERENCE.md` |
| **Architecture** | System design & flows | `DOCUMENTATION/ARCHITECTURE_AT_A_GLANCE.md` |
| **Workflows** | Business process flows | `DOCUMENTATION/workflows/` |

---

## 🚀 Quick Start for Developers

### 1. Review Backend Endpoints
```bash
# Read the specification
cat MISSING_ENDPOINTS.md

# Priority services:
# 1. Staff Management
# 2. Order updates
# 3. Menu CRUD
# 4. Analytics
# 5. Discounts
```

### 2. Implement Backend Endpoints
Follow the exact specifications in `MISSING_ENDPOINTS.md` for:
- Request/response formats
- Error handling
- Pagination support
- Filtering options

### 3. Test API with Postman/curl
```bash
# Example: Get staff members
curl -X GET "http://localhost:3100/api/staff?tenant_id=11111111-1111-1111-1111-111111111111&limit=20" \
  -H "Authorization: Bearer {staff_jwt}" \
  -H "X-Tenant-ID: 11111111-1111-1111-1111-111111111111"
```

### 4. Integrate Frontend
1. Open admin page file in `frontend/app/admin/{section}/page.tsx`
2. Remove MOCK data imports
3. Import real API functions from `lib/api/admin/{service}.ts`
4. Replace data fetching logic with API calls
5. Test locally: `npm run dev`

### 5. Deploy
```bash
# Ensure both backend and frontend are running
npm run build
npm start
```

---

## 📞 Support & Contact

**Frontend Lead**: [Frontend Team]  
**Backend Lead**: [Backend Team - @jntbatra]  
**Questions?** Check `MISSING_ENDPOINTS.md` or `API_REFERENCE.md`

---

## 📈 Progress Tracking

### Completed ✅
- [x] Type definitions for all admin services
- [x] API service functions created
- [x] Missing endpoints documented
- [x] Integration strategy defined

### In Progress 🔄
- [ ] Backend API implementation

### Blocked ⏸️
- [ ] Frontend integration (waiting for backend)

### Future Enhancements 🔮
- [ ] Real-time updates via WebSockets
- [ ] Bulk export (CSV/PDF)
- [ ] Advanced filtering & search
- [ ] Mobile admin app

---

**Document Version**: 1.0  
**Last Updated**: November 11, 2025  
**Status**: 🟢 Ready for Backend Implementation
