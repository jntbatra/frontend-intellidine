# Cancel Order Flow Documentation

## Overview
The cancel order feature is fully implemented to send only the cancellation reason to the API endpoint.

## API Request Format

When a staff member cancels an order, the system sends:

```http
PATCH /api/orders/{orderId}/cancel
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

The API endpoint automatically sets the order status to `cancelled` based on the reason provided.

## Implementation Flow

### 1. **User Interface (OrderCard Component)**
```tsx
// User enters cancellation reason in textarea
<textarea
  value={cancelReason}
  placeholder="Enter reason (optional)"
/>

// On confirm, calls the cancel handler with reason only
onCancel?.(cancelReason || "No reason provided");
```

### 2. **OrderColumn Component**
```tsx
// Passes cancel handler to OrderCard
onCancel={(reason) => onCancelOrder?.(order.id, reason)}

// OrderColumn calls this with orderId and reason
onCancelOrder?.(order.id, reason)
```

### 3. **Board Component (KitchenOrderBoard or ServerOrderBoard)**
```tsx
// Handler prepares the mutation call
const handleCancelOrder = (orderId: string, reason: string) => {
  cancelOrder({ orderId, reason });
};

// Passes to OrderColumn
<OrderColumn
  onCancelOrder={handleCancelOrder}
  // ... other props
/>
```

### 4. **Custom Hook (use-kitchen-orders.ts)**
```tsx
// Mutation calls API with orderId and reason
const cancelOrderMutation = useMutation({
  mutationFn: async ({
    orderId,
    reason,
  }: {
    orderId: string;
    reason: string;
  }) => cancelOrder(orderId, reason),
  
  onSuccess: () => {
    ordersQuery.refetch();
    toast.success("Order cancelled");
  },
});
```

### 5. **API Call (lib/api/kitchen.ts)**
```tsx
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<ApiResponse<Order>> {
  try {
    const response = await apiClient.patch<Order>(
      `/api/orders/${orderId}/cancel`,
      { reason }  // ← Only reason is sent!
    );
    return response;
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
}
```

## Features

✅ **Simple Format**: Only `{ reason }` is sent
✅ **No Status Update**: Client doesn't send status, only reason
✅ **Optional Reason**: Default message if staff skips it
✅ **Auto-Refetch**: Orders list updates after cancellation
✅ **Toast Feedback**: Success/error notifications
✅ **Loading State**: Button shows "Cancelling..." during request

## Cancelled Order Pages

After cancellation, orders appear on:
- **Kitchen**: `/kitchen/cancelled`
- **Server**: `/server/cancelled`

Both pages show cancelled orders with:
- Order number and table
- All items with quantities
- Pricing breakdown
- Cancellation badge

## User Workflow

### Kitchen Staff
1. Click **"Cancel Order"** button on any order card
2. Optional: Enter cancellation reason
3. Click **"Confirm Cancel"** to submit
4. API receives: `PATCH /api/orders/{id}/cancel` with `{ reason }`
5. Order disappears from active queues
6. Order appears on cancelled page
7. Toast shows: "Order cancelled"

### Server Staff
1. Same workflow from Server Display System
2. Click **"Cancelled Orders"** button to view all cancelled orders

## Error Handling

- **Network Error**: Toast shows error message, order remains active
- **API Error**: Toast shows API error, order remains active
- **Validation**: Asks for confirmation if reason is empty

## Testing

To test the flow:
1. Navigate to `/kitchen` or `/server`
2. Click any "Cancel Order" button
3. Enter reason (e.g., "Out of stock")
4. Click "Confirm Cancel"
5. Check browser console for API call payload
6. Verify order moves to cancelled page
7. Check `/kitchen/cancelled` or `/server/cancelled`

## API Endpoint Requirements

The backend `/api/orders/{id}/cancel` endpoint should:
- ✅ Accept `{ reason: string }` in request body
- ✅ Automatically set `status` to `"cancelled"`
- ✅ Store the cancellation reason
- ✅ Return updated order with `status: "cancelled"`
- ✅ Remove from active order queues

No status parameter is needed from the client!
