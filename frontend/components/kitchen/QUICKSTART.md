# Kitchen Order Display - Quick Start Guide

## 🚀 What Was Built

A complete, production-ready Kitchen Order Display System (KDS) for restaurant chains with:

- **Three-column order management** (New, Preparing, Ready)
- **Real-time auto-refresh** (every 15 seconds)
- **One-click status updates** with instant UI refresh
- **Beautiful, responsive UI** with color-coded status indicators
- **Error handling** with retry options
- **Toast notifications** for all user actions

## 📁 Files Created

### Components

```
components/kitchen/
├── KitchenOrderBoard.tsx      # Main orchestrator (3-column layout)
├── OrderColumn.tsx             # Column container for each status
├── OrderCard.tsx               # Individual order card with details
├── index.ts                    # Barrel exports
└── README.md                   # Detailed documentation
```

### Hooks & API

```
hooks/
└── use-kitchen-orders.ts       # Custom React Query hook for orders

lib/api/
└── kitchen.ts                  # Kitchen API endpoints
```

### Pages

```
app/kitchen/
└── page.tsx                    # Kitchen page with tenant setup
```

## 🎯 How to Use

### 1. Navigate to Kitchen Page

```
Visit: http://localhost:3001/kitchen
```

The page will automatically load orders for your tenant (from localStorage).

### 2. Status Flow

```
PENDING (Yellow) → PREPARING (Blue) → READY (Green) → [Completed]
```

Click the action button on any card to move it to the next status.

### 3. Controls

- **Refresh**: Manual refresh button
- **Pause/Resume**: Toggle auto-refresh (default: every 15s)
- **Order Count Badge**: Shows number of orders in each column

## 🔧 Configuration

### Change Auto-Refresh Interval

Edit `hooks/use-kitchen-orders.ts`:

```typescript
const AUTO_REFRESH_INTERVAL = 15000; // milliseconds (default: 15s)
```

### Customize Colors

Edit `components/kitchen/OrderColumn.tsx`:

```typescript
const colorClasses = {
  yellow: {
    /* yellow theme */
  },
  blue: {
    /* blue theme */
  },
  green: {
    /* green theme */
  },
};
```

### API Configuration

Ensure `.env.local` has:

```
NEXT_PUBLIC_API_URL=http://your-api-url
```

## 📊 Data Structure

The system displays orders with:

- Order number & table number
- Items list (with quantities & special instructions)
- Subtotal, tax, total
- Time elapsed since order creation
- Special notes/instructions
- Payment method (if available)

## 🔄 How It Works

1. **Auto-Fetch**: Every 15 seconds, the hook refetches orders via API
2. **Group by Status**: Orders automatically sorted into 3 columns
3. **Status Update**: Clicking a button sends PATCH to `/api/orders/{id}/status`
4. **Optimistic Update**: UI updates immediately while API is processing
5. **Error Handling**: Toast shows if update fails, can retry

## 🎨 Visual Design

- **Yellow Column**: New orders (PENDING) - requires attention
- **Blue Column**: Preparing orders - being cooked
- **Green Column**: Ready orders - waiting for pickup
- **Large readable fonts**: Visible from distance
- **Color-coded badges**: Order status at a glance
- **Scrollable columns**: Handle unlimited orders per status

## 🚨 Error States

If API fails:

- Error message displayed with retry button
- Toast notifications for mutation failures
- Automatic retry on network errors (up to 3 times)
- Graceful fallback UI

## 📱 Responsive Design

- Desktop: 3-column grid layout
- Tablet: Responsive grid
- Mobile: Stacked layout (configure as needed)

## 🔐 Authentication

The system uses:

- JWT token from `localStorage.getItem("auth_token")`
- Tenant ID from `localStorage.getItem("current_tenant_id")`
- Both automatically included in API headers

## 🧪 Testing

### Manual Testing Checklist

- [ ] Orders display in correct status columns
- [ ] Click action button → order moves to next column
- [ ] Order counts update in header
- [ ] Auto-refresh works (watch orders update)
- [ ] Pause/Resume auto-refresh works
- [ ] Manual refresh works
- [ ] Time elapsed updates
- [ ] Special instructions visible
- [ ] Notes display correctly
- [ ] Responsive on mobile

### With Mock Data

The system works with mock data from `lib/constants/mockOrders.ts`:

- Update `lib/api/kitchen.ts` to use mock in development
- Or set API endpoint to return mock responses

## ⚡ Performance Tips

1. **Memoization**: Components use React.memo to prevent re-renders
2. **Query Caching**: React Query caches orders for 5 seconds
3. **Optimistic Updates**: UI updates before API response
4. **Scrollable Areas**: Virtualized scrolling for many orders

## 🔮 Future Enhancements

Optional features you can add:

- [ ] Drag-and-drop between columns (use `react-beautiful-dnd`)
- [ ] Sound alerts for new orders
- [ ] Browser push notifications
- [ ] Keyboard shortcuts (R for refresh, P for pause)
- [ ] Priority/VIP order badges
- [ ] Estimated prep time countdown
- [ ] Kitchen section filtering (Pizza, Dessert, etc.)
- [ ] Analytics dashboard
- [ ] Multi-display support

## 🆘 Troubleshooting

### Orders not loading?

1. Check `NEXT_PUBLIC_API_URL` environment variable
2. Verify JWT token in localStorage
3. Check browser console for API errors
4. Verify tenant ID is set

### Auto-refresh not working?

1. Check browser console for errors
2. Verify API endpoint is responding
3. Check if token has expired
4. Try manual refresh

### Button not updating status?

1. Look for red toast error message
2. Check API response in Network tab
3. Verify order ID is correct
4. Check for permission issues

## 📚 Additional Files

### Documentation

- `README.md` - Full system documentation
- `INTEGRATION_GUIDE.tsx` - Code examples for customization

### Optional Advanced Version

- `KitchenOrderBoard.draggable.tsx` - Drag-and-drop variant
  (Requires: `npm install react-beautiful-dnd`)

## 📞 Support

For issues or customization:

1. Check component README.md
2. Review hook implementation in `use-kitchen-orders.ts`
3. Check API calls in `lib/api/kitchen.ts`
4. Review component props interfaces

---

**Ready to use!** 🎉 The system is production-ready and fully functional with your existing infrastructure.
