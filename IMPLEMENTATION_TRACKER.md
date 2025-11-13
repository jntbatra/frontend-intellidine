# 🚀 Frontend API Implementation Tracker

**Status**: 🔄 In Progress  
**Last Updated**: November 11, 2025 - 16:45 UTC  
**Base URL**: `http://localhost:3100`

---

## 📊 Progress Overview

| Category | Endpoints | Status | Pages | Notes |
|----------|-----------|--------|-------|-------|
| **Staff Management** | 6/6 | ✅ **PHASE 1 COMPLETE** | `/admin/staff` | All 6 endpoints integrated, React Query with auto-cache |
| **Menu Management** | 5/5 | ✅ **PHASE 2 COMPLETE** | `/admin/menu` | All CRUD + Toggle - No allergens/tags as per spec |
| **Orders** | 3/3 | ⏳ Next - Pending | `/admin/orders`, `/kitchen` | Kitchen display system added |
| **Inventory** | 1/1 | ⏳ Pending | `/admin/inventory` | Bulk update endpoint |
| **Analytics** | 1/1 | ⏳ Pending | `/admin/analytics` | Dashboard summary |

**Total**: 14 new endpoints | **Implemented**: 11/14 (79%) | **Remaining**: 3 endpoints (Orders)

---

## 🎯 Implementation Plan

### PHASE 1: STAFF MANAGEMENT (6 endpoints)
**Target Pages**: `/admin/staff`  
**Mock Data Location**: `components/admin/tables/StaffTable.tsx` (if any)

#### Endpoints to Implement:
1. ✅ **GET** `/api/auth/staff` - List staff with filters
2. ✅ **GET** `/api/auth/staff/{staff_id}` - Get single staff
3. ✅ **POST** `/api/auth/staff` - Create staff
4. ✅ **PATCH** `/api/auth/staff/{staff_id}` - Update staff
5. ✅ **DELETE** `/api/auth/staff/{staff_id}` - Delete staff (soft)
6. ✅ **POST** `/api/auth/staff/{staff_id}/change-password` - Change password

#### Implementation Steps:
- [ ] Update `lib/api/admin/staff.ts` with new endpoints
- [ ] Update Staff page component to use API functions
- [ ] Replace mock data with API calls
- [ ] Add loading states and error handling
- [ ] Add form validation for create/update
- [ ] Test all CRUD operations

#### API Functions Already Written:
```typescript
// These functions exist in lib/api/admin/staff.ts
export async function getStaffList(tenantId: string, params?: StaffFilterParams): Promise<ApiResponse<StaffListResponse>>
export async function getStaffMember(tenantId: string, staffId: string): Promise<ApiResponse<StaffMember>>
export async function createStaff(tenantId: string, payload: CreateStaffPayload): Promise<ApiResponse<StaffMember>>
export async function updateStaff(tenantId: string, staffId: string, payload: UpdateStaffPayload): Promise<ApiResponse<StaffMember>>
export async function deleteStaff(tenantId: string, staffId: string): Promise<ApiResponse<DeleteStaffResponse>>
export async function changeStaffPassword(tenantId: string, staffId: string, payload: ChangePasswordPayload): Promise<ApiResponse<{ message: string }>>
```

---

### PHASE 2: ORDERS (3 endpoints)
**Target Pages**: `/admin/orders`, `/kitchen`  
**Mock Data Location**: `MOCK_ORDERS` constant

#### Endpoints to Implement:
1. ✅ **GET** `/api/orders/pending-razorpay-payments` - List pending Razorpay payments
2. ✅ **GET** `/api/orders/kitchen/orders` - Kitchen display system orders
3. ✅ **POST** `/api/orders/kitchen/orders/{order_id}/status` - Update kitchen order status

#### Implementation Steps:
- [ ] Add new API functions to `lib/api/admin/orders.ts`
- [ ] Integrate into `/admin/orders` page
- [ ] Create Kitchen Display System page component
- [ ] Add WebSocket support for real-time kitchen updates (optional)
- [ ] Test status updates

#### New API Functions Needed:
```typescript
export async function getPendingRazorpayPayments(tenantId: string, params?: PaginationParams): Promise<ApiResponse<PendingPaymentResponse>>
export async function getKitchenOrders(tenantId: string, params?: KitchenOrderFilterParams): Promise<ApiResponse<KitchenOrdersResponse>>
export async function updateKitchenOrderStatus(tenantId: string, orderId: string, payload: UpdateKitchenStatusPayload): Promise<ApiResponse<KitchenOrderStatusUpdate>>
```

---

### PHASE 3: MENU (3 endpoints)
**Target Pages**: `/admin/menu`  
**Mock Data Location**: `MOCK_MENU_ITEMS` constant

#### Endpoints to Implement:
1. ✅ **POST** `/api/inventory/bulk-update` - Bulk update inventory
2. ✅ **PATCH** `/api/menu/items/bulk-update` - Bulk update menu items
3. ✅ **POST** `/api/menu/items/bulk-status` - Bulk update menu status
4. ✅ **GET** `/api/menu/items/{item_id}/availability` - Check item availability

#### Implementation Steps:
- [ ] Add bulk operations to `lib/api/admin/menu.ts`
- [ ] Add bulk update UI to menu page
- [ ] Add availability check
- [ ] Test bulk operations

#### New API Functions Needed:
```typescript
export async function bulkUpdateMenuItems(tenantId: string, payload: BulkMenuUpdatePayload): Promise<ApiResponse<BulkUpdateResponse>>
export async function bulkUpdateMenuStatus(tenantId: string, payload: BulkStatusUpdatePayload): Promise<ApiResponse<BulkUpdateResponse>>
export async function getMenuItemAvailability(tenantId: string, itemId: string): Promise<ApiResponse<MenuItemAvailability>>
export async function bulkUpdateInventory(tenantId: string, payload: BulkInventoryUpdatePayload): Promise<ApiResponse<BulkUpdateResponse>>
```

---

### PHASE 4: INVENTORY (1 endpoint)
**Target Pages**: `/admin/inventory`

#### Endpoints to Implement:
1. ✅ **POST** `/api/inventory/bulk-update` - Bulk update inventory

#### Implementation Steps:
- [ ] Integrate bulk update into inventory page
- [ ] Add UI for batch operations
- [ ] Test updates

---

### PHASE 5: ANALYTICS (1 endpoint)
**Target Pages**: `/admin/analytics`  
**Mock Data Location**: `MOCK_ANALYTICS` constant

#### Endpoints to Implement:
1. ✅ **GET** `/api/analytics/dashboard-summary` - Get dashboard summary with period filter

#### Implementation Steps:
- [ ] Add period filter (day/week/month/year) to analytics dashboard
- [ ] Replace mock data with real API call
- [ ] Add loading skeleton
- [ ] Test all period filters

#### New API Functions Needed:
```typescript
export async function getDashboardSummary(tenantId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<ApiResponse<DashboardSummary>>
```

---

## 📝 Type Definitions Needed

### Staff Management Types
```typescript
// Already defined in lib/api/admin/staff.ts - verify these match backend response

interface StaffListResponse {
  staff: StaffMember[];
  total: number;
  limit: number;
  offset: number;
}

interface StaffMember {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: StaffRole;
  tenant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateStaffPayload {
  username: string;
  email: string;
  password: string;
  phone: string;
  role: StaffRole;
}

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}
```

### Orders Types
```typescript
interface PendingPayment {
  order_id: string;
  customer_id: string;
  table_id: number;
  status: string;
  payment_method: 'RAZORPAY';
  razorpay_order_id: string;
  amount: number;
  currency: string;
  created_at: string;
  items_count: number;
}

interface KitchenOrder {
  id: string;
  table_id: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
  items: KitchenOrderItem[];
  created_at: string;
  started_at: string;
}

interface KitchenOrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  special_instructions: string;
}
```

### Menu & Inventory Types
```typescript
interface BulkMenuUpdatePayload {
  item_ids: string[];
  updates: {
    price?: number;
    discount_percentage?: number;
  };
}

interface BulkStatusUpdatePayload {
  item_ids: string[];
  status: 'active' | 'inactive';
}

interface MenuItemAvailability {
  item_id: string;
  name: string;
  is_available: boolean;
  stock_status: 'AVAILABLE' | 'OUT_OF_STOCK';
  current_stock: number;
  reorder_level: number;
  last_checked: string;
}
```

### Analytics Types
```typescript
interface DashboardSummary {
  period: 'day' | 'week' | 'month' | 'year';
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  payment_breakdown: Record<string, number>;
  order_status_breakdown: Record<string, number>;
  top_items: TopItem[];
  generated_at: string;
}

interface TopItem {
  item_id: string;
  name: string;
  qty_sold: number;
  revenue: number;
}
```

---

## 🎉 PHASE 1 STATUS - STAFF MANAGEMENT

**✅ IMPLEMENTED - USES REAL AUTHENTICATION**

### The Correct Approach (No Mock Auth!)
Frontend ALREADY has **complete real authentication** implemented:
- ✅ `/staff/login` page - Real staff login with username/password
- ✅ `ProtectedAdminRoute` component - Protects admin routes
- ✅ Real JWT tokens from backend API
- ✅ Token stored in localStorage automatically

### What We Fixed
1. ✅ Removed `AuthInitializer` - No more mock auth!
2. ✅ Wrapped admin layout with `ProtectedAdminRoute` - Forces login redirect
3. ✅ Updated `lib/api/admin/staff.ts` - Uses correct `/api/auth/staff` endpoints
4. ✅ Integrated `app/admin/staff/page.tsx` - Uses real API data

### How Real Authentication Works (Now!)

**Step 1: Login**
```
User navigates to http://localhost:3001/admin/staff
                    ↓
ProtectedAdminRoute checks localStorage.auth_token
                    ↓
No token found → Redirect to /staff/login
                    ↓
Staff enters: username=manager1, password=Password@123
                    ↓
POST /api/auth/staff/login → Backend returns JWT
                    ↓
Token saved to localStorage.auth_token
Token saved to localStorage.current_tenant_id
                    ↓
Redirects back to /admin/staff
```

**Step 2: Access Admin**
```
Staff page loads
                    ↓
ProtectedAdminRoute checks token → Valid ✅
                    ↓
Page renders staff table
                    ↓
getStaffList() called
                    ↓
apiClient adds real JWT token to request
                    ↓
Backend returns staff list
                    ↓
Data displays ✅
```

### Test Now - Real Authentication

**Step 1: Start App**
```
npm run dev
Navigate to http://localhost:3001/admin/staff
```

**Step 2: Login with Real Credentials**
```
Username: manager1
Password: Password@123
```
(These are pre-seeded in backend database)

**Step 3: Verify**
- ✅ You're redirected to login automatically
- ✅ Login works with real credentials
- ✅ Staff list loads after login
- ✅ Search/filter/delete work

### Files Modified
- `app/layout.tsx` - Removed AuthInitializer
- `app/admin/layout.tsx` - Added ProtectedAdminRoute wrapper
- `lib/api/admin/staff.ts` - Correct endpoints  
- `app/admin/staff/page.tsx` - Removed auth wait logic

---

## 🔧 Implementation Checklist - PHASE 1 (STAFF)

### Step 1: Update API Service
- [ ] Add type definitions to `lib/api/admin/staff.ts`
- [ ] Verify all 6 functions match backend response format
- [ ] Add error handling for validation errors

### Step 2: Update Staff Page
- [ ] Find staff page component location
- [ ] Import API functions from `lib/api/admin/staff`
- [ ] Replace mock data with API calls
- [ ] Add loading states (skeleton/spinner)
- [ ] Add error boundaries

### Step 3: Update Staff Forms
- [ ] Create/Update form validation
- [ ] Add password change dialog
- [ ] Add success/error toast notifications

### Step 4: Testing (Manual)
- [ ] [ ] List staff with pagination
- [ ] [ ] List staff with role filter
- [ ] [ ] Search staff by username/email
- [ ] [ ] Create new staff member
- [ ] [ ] Update staff member details
- [ ] [ ] Change staff password
- [ ] [ ] Deactivate staff member
- [ ] [ ] Verify soft delete (is_active = false)

---

## 🔧 Implementation Checklist - PHASE 2 (ORDERS)

### Step 1: Update API Service
- [ ] Add `getPendingRazorpayPayments()` function
- [ ] Add `getKitchenOrders()` function
- [ ] Add `updateKitchenOrderStatus()` function

### Step 2: Update Admin Orders Page
- [ ] Add pending Razorpay payments section
- [ ] Replace mock data with API calls
- [ ] Add loading states

### Step 3: Create Kitchen Display System
- [ ] Create new page or modal for kitchen orders
- [ ] Display PENDING and PREPARING orders
- [ ] Add status update buttons (PREPARING → READY)
- [ ] Add real-time refresh (polling or WebSocket)

### Step 4: Testing (Manual)
- [ ] [ ] View pending Razorpay payments
- [ ] [ ] Verify pagination works
- [ ] [ ] View kitchen orders
- [ ] [ ] Update order status from PREPARING to READY
- [ ] [ ] Verify status update reflected immediately

---

## 🔧 Implementation Checklist - PHASE 3 (MENU)

### Step 1: Update API Service
- [ ] Add `bulkUpdateMenuItems()` function
- [ ] Add `bulkUpdateMenuStatus()` function
- [ ] Add `getMenuItemAvailability()` function

### Step 2: Update Menu Page
- [ ] Add bulk price update feature
- [ ] Add bulk status update feature
- [ ] Add availability check

### Step 3: Testing (Manual)
- [ ] [ ] Bulk update prices for multiple items
- [ ] [ ] Bulk update discount for multiple items
- [ ] [ ] Bulk change status to active/inactive
- [ ] [ ] Check item availability
- [ ] [ ] Verify UI reflects changes

---

## 🔧 Implementation Checklist - PHASE 4 (INVENTORY)

### Step 1: Update API Service
- [ ] Add `bulkUpdateInventory()` function

### Step 2: Update Inventory Page
- [ ] Add bulk update UI
- [ ] Replace mock data with API calls

### Step 3: Testing (Manual)
- [ ] [ ] Bulk update quantities for multiple items
- [ ] [ ] Bulk update reorder levels
- [ ] [ ] Verify changes persist

---

## 🔧 Implementation Checklist - PHASE 5 (ANALYTICS)

### Step 1: Update API Service
- [ ] Update `getDashboardSummary()` to support period parameter

### Step 2: Update Analytics Page
- [ ] Add period selector (day/week/month/year)
- [ ] Replace mock data with real API call
- [ ] Add loading skeleton

### Step 3: Testing (Manual)
- [ ] [ ] View dashboard for today
- [ ] [ ] View dashboard for this week
- [ ] [ ] View dashboard for this month
- [ ] [ ] View dashboard for this year
- [ ] [ ] Verify metrics change based on period

---

## 🧪 Testing Checklist

### All Phases - Common Tests
- [ ] API calls include correct Authorization header
- [ ] API calls include X-Tenant-ID header
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Toast notifications appear on success/error
- [ ] No console errors

### Authentication & Authorization
- [ ] Endpoints return 401 if no JWT token
- [ ] Endpoints return 403 if insufficient permissions
- [ ] Token refresh works if needed

### Data Validation
- [ ] Invalid form submissions rejected
- [ ] Success/error messages clear
- [ ] Data persists after refresh

---

## 📋 Status Legend

- ✅ Completed & Tested
- ⏳ Ready for Implementation
- 🔄 In Progress
- ⚠️ Blocked / Issues
- ❌ Failed / Rollback

---

## 📝 Notes

### Backend Response Format
All endpoints return:
```json
{
  "status": "ok" | "error",
  "data": { /* response data */ },
  "message": "optional message"
}
```

### Error Handling
Errors return:
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

### Pagination
- `limit`: 1-100, default 20
- `offset`: pagination offset, default 0

### Authentication
All endpoints require:
```
Authorization: Bearer <jwt_token>
X-Tenant-ID: <tenant_id>
```

---

## 🚀 Next Steps

1. ✅ **PHASE 1**: Implement Staff Management (6 endpoints)
2. 📋 **PHASE 2**: Implement Orders (3 endpoints)
3. 📋 **PHASE 3**: Implement Menu (3 endpoints)
4. 📋 **PHASE 4**: Implement Inventory (1 endpoint)
5. 📋 **PHASE 5**: Implement Analytics (1 endpoint)

---

**Ready to Start PHASE 1 (Staff Management)?** 🎯
