# Kitchen Order Display Reorganization

## Changes Made

### 1. Kitchen Page (`/kitchen`)

- **Displays**: New Orders (PENDING) + Preparing Orders (IN_PREPARATION)
- **Removed**: Ready for Pickup column
- **Grid**: Changed from 3-column to 2-column layout
- **Updated**: Status bar now shows only "New" and "Preparing" counts
- **File**: `components/kitchen/KitchenOrderBoard.tsx`

### 2. Server Page (`/server`) - NEW

- **Purpose**: Display ready and available orders for server staff
- **Displays**: Ready for Pickup orders (READY status)
- **Grid**: Single column layout focused on ready orders
- **Status Bar**: Shows only ready orders count
- **Files Created**:
  - `app/server/page.tsx` - Page component
  - `components/server/ServerOrderBoard.tsx` - Main display component

## API Status Mapping Fixed

### Issue Resolved:

- **Frontend uses**: `pending`, `in_preparation`, `ready`, `completed`, `cancelled`
- **Backend API expects**: `PENDING`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`

### Solution Applied:

Added conversion functions in `lib/api/kitchen.ts`:

```typescript
mapBackendStatusToFrontend(backendStatus: string): OrderStatus
mapFrontendStatusToBackend(frontendStatus: OrderStatus): string
```

These ensure all status updates are correctly translated when communicating with the API.

## Data Flow

### Kitchen Staff Workflow:

1. Kitchen sees "New Orders" (yellow column)
2. Marks as "Preparing" (moves to blue column)
3. Marks as "Ready" (automatically moves to server page)

### Server Staff Workflow:

1. Server sees "Ready for Pickup" orders
2. Delivers to customer
3. Marks as "Completed"

## Files Modified

1. `components/kitchen/KitchenOrderBoard.tsx` - Removed ready column
2. `lib/api/kitchen.ts` - Added status mapping functions

## Files Created

1. `app/server/page.tsx` - Server page component
2. `components/server/ServerOrderBoard.tsx` - Server order board component
3. `components/server/` - New directory for server components

## Navigation

Both pages can be accessed at:

- `/kitchen` - Kitchen Display System
- `/server` - Server Display System

Both use the same tenant ID from localStorage and share the same order data via the API.
