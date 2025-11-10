# Debugging: Cancelled Orders Not Displaying

## Issue

Cancelled orders are not showing on the `/kitchen/cancelled` and `/server/cancelled` pages.

## Troubleshooting Steps

### 1. Check Browser Console Logs

When you navigate to the cancelled page, check the browser console for these debug logs:

```
📦 Fetched orders: [number of orders]
🗑️ Cancelled orders: [number of cancelled orders]
Sample order status: [the actual status value]
```

**What to look for:**

- If "📦 Fetched orders: 0" → No orders returned from API
- If "🗑️ Cancelled orders: 0" → Orders returned but none are cancelled
- Check the "Sample order status" to see what status values are being returned

### 2. API Request Being Sent

The pages now send a status filter parameter. Open DevTools Network tab and check:

```
GET /api/orders?tenant_id=xxx&limit=100&offset=0&status=CANCELLED&include_items=true
```

**Check if:**

- Status parameter is being sent as `CANCELLED` (uppercase)
- Tenant ID is correct
- Request is successful (200 status code)

### 3. API Response Format

Check the response from `/api/orders` endpoint in DevTools:

**Expected Response Shapes:**

```javascript
// Shape 1: Direct array
[
  { id: "123", order_number: 55, status: "cancelled", ... },
  { id: "124", order_number: 56, status: "cancelled", ... }
]

// Shape 2: Wrapped in data
{
  data: [
    { id: "123", order_number: 55, status: "cancelled", ... },
    { id: "124", order_number: 56, status: "cancelled", ... }
  ]
}
```

### 4. Order Status Value

The code filters for `status === "cancelled"` (lowercase).

**Check in API response:**

- Does order have `status: "cancelled"` (lowercase)?
- Or `status: "CANCELLED"` (uppercase)?
- Or something else like `status: "Cancelled"`?

If the API returns uppercase or mixed case, the page will need to handle it.

### 5. Test with Direct Filter

Try modifying the fetch to use all orders and check what statuses exist:

In browser console, manually cancel an order from KDS/Server, then:

1. Go to `/kitchen/cancelled`
2. Open DevTools → Console
3. Look for the debug logs output

### 6. Manual Testing Steps

**Step 1: Create and Cancel an Order**

1. Navigate to `/kitchen`
2. Click "Cancel Order" on any order
3. Enter reason: "Test cancellation"
4. Click "Confirm Cancel"
5. Toast shows "Order cancelled"

**Step 2: Check if Order Disappeared**

- Order should disappear from the kitchen columns
- Should move to cancelled queue

**Step 3: Navigate to Cancelled Page**

- Click "Cancelled Orders" button
- Should see the cancelled order

**Step 4: Check Console**

- Open DevTools console
- Look for debug logs showing how many cancelled orders found

## Common Issues & Fixes

### Issue: Backend Returns Uppercase Status

**Problem:** API returns `status: "CANCELLED"` but code filters for `"cancelled"`
**Fix:** Update filter to check both cases or normalize the response

### Issue: Status Parameter Not Supported

**Problem:** API doesn't recognize `status=CANCELLED` parameter
**Fix:** Remove status filter parameter, fetch all orders and filter client-side

### Issue: Wrong Tenant ID

**Problem:** Cancelled orders exist but for different tenant
**Fix:** Check localStorage has correct `current_tenant_id`

### Issue: API Returns Paginated Response

**Problem:** Response has data wrapped differently
**Fix:** Code already handles `data.data` array structure

## Required API Changes (If Needed)

The backend `/api/orders` endpoint should:

1. **Accept status filter:**

   ```
   GET /api/orders?status=CANCELLED
   ```

2. **Handle cancelled status query:**

   ```
   // Returns orders where status = 'CANCELLED'
   ```

3. **Return consistent structure:**

   ```javascript
   {
     data: [ { status: "cancelled", ... } ],
     total: 5,
     page: 1,
     limit: 100
   }
   ```

4. **When order is cancelled:**
   ```javascript
   PATCH /api/orders/{id}/cancel
   Request: { reason: "Customer requested" }
   Response: { status: "cancelled", reason: "Customer requested", ... }
   ```

## Quick Debug Checklist

- [ ] Navigate to `/kitchen/cancelled`
- [ ] Open DevTools Console (F12)
- [ ] Check for "📦 Fetched orders: X" log
- [ ] Check for "🗑️ Cancelled orders: Y" log
- [ ] If Y = 0, check Network tab for API response
- [ ] Check API response for status values
- [ ] Cancel an order on KDS, then refresh cancelled page
- [ ] Verify order appears in list
- [ ] Check that order.status === "cancelled"

## Contact Backend Team

If cancelled orders still don't appear after these checks:

1. Provide the console logs showing:

   - Number of fetched orders
   - Number of cancelled orders
   - Sample order status value

2. Provide API response sample:

   - Show the full JSON from `/api/orders` response
   - Show what status value is in response

3. Confirm that:
   - Orders are actually being cancelled (disappear from kitchen)
   - Same tenant is used for both creation and filtering
   - Backend accepts the status filter parameter
