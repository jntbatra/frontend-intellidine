# Kitchen Order Display System

A real-time kitchen display system (KDS) for restaurant chains inspired by Domino's and McDonald's. This system displays orders in three distinct status columns and allows kitchen staff to manage order preparation efficiently.

## Features

✅ **Three-Column Order Management**

- **New Orders (Yellow)** - PENDING orders just received
- **Preparing (Blue)** - IN_PREPARATION orders being cooked
- **Ready for Pickup (Green)** - READY orders waiting for pickup

✅ **Real-Time Updates**

- Auto-refresh every 15 seconds (configurable)
- Pause/Resume auto-refresh
- Manual refresh button
- Live order count badges

✅ **Order Status Transitions**

- One-click status updates: PENDING → PREPARING → READY
- API-driven state management
- Instant UI updates after status change

✅ **Order Information Display**

- Order number and table number
- List of items with quantities and special instructions
- Subtotal, tax, and total amounts
- Time elapsed since order creation
- Special notes and customer information

✅ **Responsive & Accessible**

- Three-column layout on desktop (collapsible on mobile)
- Scrollable order columns
- Color-coded status indicators
- Large, readable fonts for kitchen display
- Touch-friendly buttons

✅ **Error Handling**

- Graceful error states with retry option
- Toast notifications for status updates
- Network timeout handling

## Architecture

### Components

```
components/kitchen/
├── KitchenOrderBoard.tsx      # Main orchestrator component
├── OrderColumn.tsx             # Column container for status groups
├── OrderCard.tsx               # Individual order card
└── index.ts                    # Barrel export
```

### Hooks

```
hooks/
└── use-kitchen-orders.ts       # Custom hook for order management
    ├── useKitchenOrders()      # Main hook with auto-refresh
    ├── groupOrdersByStatus()   # Order grouping utility
    ├── getTimeElapsed()        # Time formatting utility
    └── getTableNumber()        # Table extraction utility
```

### API Integration

```
lib/api/
└── kitchen.ts                  # Kitchen API endpoints
    ├── fetchKitchenOrders()    # GET orders
    ├── updateOrderStatus()     # PATCH order status
    ├── prepareOrder()          # Transition to preparing
    ├── readyOrder()            # Transition to ready
    └── completeOrder()         # Mark as completed
```

## API Endpoints Used

### List Orders

```
GET /api/orders?tenant_id={{tenant_id}}&limit=10&offset=0&include_items=true

Headers:
- Authorization: Bearer {{jwt_token}}
- X-Tenant-ID: {{tenant_id}}

Response:
{
  success: boolean,
  data: Order[]
}
```

### Update Order Status

```
PATCH /api/orders/{order_id}/status

Headers:
- Authorization: Bearer {{jwt_token}}
- X-Tenant-ID: {{tenant_id}}
- Content-Type: application/json

Body:
{
  "status": "PREPARING" | "READY" | "COMPLETED"
}

Response:
{
  success: boolean,
  data: Order
}
```

## Order Status Flow

```
PENDING (Yellow)
    ↓ [Start Preparing]
IN_PREPARATION (Blue)
    ↓ [Mark Ready]
READY (Green)
    ↓ [Completed]
COMPLETED (Removed from display)
```

## Data Structure

### Order Object

```typescript
interface Order {
  id: string;
  tenant_id: string;
  table_id: string;
  customer_name: string;
  order_number: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total_amount: number;
  status: "pending" | "in_preparation" | "ready" | "completed" | "cancelled";
  payment_method: "cash" | "card" | "upi" | "wallet";
  notes?: string;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  special_instructions?: string;
}
```

## Usage

### Basic Implementation

```tsx
import { KitchenOrderBoard } from "@/components/kitchen";

export default function KitchenPage() {
  const tenantId = "your-tenant-id";

  return <KitchenOrderBoard tenantId={tenantId} />;
}
```

### Using the Hook Directly

```tsx
import {
  useKitchenOrders,
  groupOrdersByStatus,
} from "@/hooks/use-kitchen-orders";

export function MyKitchenComponent() {
  const {
    orders,
    isLoading,
    isError,
    updateOrderStatus,
    autoRefresh,
    toggleAutoRefresh,
    manualRefresh,
  } = useKitchenOrders("tenant-123");

  const grouped = groupOrdersByStatus(orders);

  return (
    <div>
      <button onClick={toggleAutoRefresh}>
        {autoRefresh ? "Pause" : "Resume"} Auto-Refresh
      </button>

      <div>
        <h3>New Orders: {grouped.pending.length}</h3>
        <h3>Preparing: {grouped.preparing.length}</h3>
        <h3>Ready: {grouped.ready.length}</h3>
      </div>
    </div>
  );
}
```

## Customization

### Change Auto-Refresh Interval

In `hooks/use-kitchen-orders.ts`:

```typescript
const AUTO_REFRESH_INTERVAL = 15000; // Change to desired milliseconds
```

### Customize Colors

In `components/kitchen/OrderColumn.tsx`:

```typescript
const colorClasses = {
  yellow: {
    /* Customize yellow theme */
  },
  blue: {
    /* Customize blue theme */
  },
  green: {
    /* Customize green theme */
  },
};
```

### Modify Order Card Layout

Edit `components/kitchen/OrderCard.tsx` to:

- Add/remove fields
- Change typography
- Add badges or icons
- Modify color schemes

## State Management

The system uses **TanStack React Query** for:

- **Queries**: Fetching orders with auto-refresh
- **Mutations**: Updating order status
- **Cache**: Optimistic updates on status change
- **Invalidation**: Automatic refetch after mutation

## Performance Optimizations

1. **Auto-refresh**: Configurable polling every 15 seconds
2. **Stale Time**: Orders considered stale after 5 seconds
3. **Cache**: 10-minute garbage collection
4. **Scroll Areas**: Virtualized scrolling for large order lists
5. **Memoization**: Components prevent unnecessary re-renders

## Error Handling

- **Network Errors**: Automatic retry (up to 3 times for GET)
- **4xx Errors**: No retry, show error message
- **Timeout**: 10-second request timeout
- **Failed Mutations**: No retry, show toast error

## Dependencies

- `@tanstack/react-query`: ^5.90.7
- `lucide-react`: ^0.553.0 (Icons)
- `sonner`: ^2.0.7 (Toast notifications)
- `tailwindcss`: ^4 (Styling)
- `shadcn/ui`: UI components

## Testing Tips

### Mock Data

The system works with mock orders from `lib/constants/mockOrders.ts`. To test:

1. Update `lib/api/kitchen.ts` to use mock data in development
2. Or set `NEXT_PUBLIC_API_URL` environment variable

### Manual Testing Checklist

- [ ] Load the kitchen page
- [ ] Verify orders display in correct columns by status
- [ ] Click "Start Preparing" - order moves to Preparing column
- [ ] Click "Mark Ready" - order moves to Ready column
- [ ] Verify order counts update in header
- [ ] Toggle auto-refresh on/off
- [ ] Manual refresh works
- [ ] Responsive on mobile/tablet
- [ ] Special instructions display correctly
- [ ] Notes display in blue box
- [ ] Time elapsed updates (or refreshes)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 12+)
- Mobile browsers: ✅ Responsive design

## Keyboard Shortcuts (Future Enhancement)

Could add:

- `R` - Refresh orders
- `P` - Pause/Resume auto-refresh
- `↑/↓` - Navigate between orders
- `Enter` - Update status

## Common Issues

### Orders not loading

- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify JWT token in localStorage
- Check network tab for API errors

### Auto-refresh not working

- Verify tenant ID is set correctly
- Check browser console for errors
- Ensure auth token hasn't expired

### Status updates not reflecting

- Check if mutation is pending (button shows "Updating...")
- Look for toast error messages
- Verify API endpoint is responding

## Future Enhancements

- 🎯 Drag-and-drop between columns
- 📊 Kitchen analytics dashboard
- 🔔 Audio/visual alerts for new orders
- 📱 Mobile staff app
- 🎨 Customizable themes per restaurant
- 🏷️ Priority/VIP order indicators
- ⏱️ Estimated prep time countdown
- 📝 Order notes/special handling
- 🔐 Role-based permissions
- 📈 Performance metrics

## File Locations

- **Page**: `/app/kitchen/page.tsx`
- **Components**: `/components/kitchen/`
- **Hooks**: `/hooks/use-kitchen-orders.ts`
- **API**: `/lib/api/kitchen.ts`
- **Types**: `/lib/api/admin/orders.ts`
