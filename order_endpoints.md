1 - /api/orders?tenant_id={{tenant_id}}&limit=10&offset=0&include_items=true

only status works as a query param do client side filter for rest

eg reply-

{
    "data": {
        "data": [
            {
                "id": "a5d1e1dc-1128-461d-8876-052d0d4f3a2f",
                "order_number": 88,
                "table_id": "5",
                "customer_id": "fa458c0f-a675-4fa9-80e1-b9bf9275234c",
                "status": "PREPARING",
                "payment_method": "CASH",
                "subtotal": 560,
                "discount_amount": 99.12,
                "discount_reason": "Lunch Special",
                "tax_amount": 100.8,
                "total": 561.68,
                "created_at": "2025-11-11T13:20:38.223Z",
                "estimated_ready_at": "2025-11-12T14:01:24.981Z",
                "items": [
                    {
                        "id": "6b36fa8c-bdac-4caf-999e-58413beb75d3",
                        "menu_item_id": "item_001",
                        "menu_item_name": "Paneer Tikka",
                        "quantity": 2,
                        "unit_price": "280",
                        "subtotal": "560",
                        "special_requests": null
                    }
                ]
            },
            {
                "id": "128456a9-5065-46ea-96dd-7b981c4a645e",
                "order_number": 84,
                "table_id": "1",
                "customer_id": "8d5cecc1-22f0-4925-b6e0-9968803bcfa7",
                "status": "PREPARING",
                "payment_method": "CASH",
                "subtotal": 630,
                "discount_amount": 0,
                "discount_reason": "",
                "tax_amount": 113.4,
                "total": 743.4,
                "created_at": "2025-11-09T18:57:25.993Z",
                "estimated_ready_at": "2025-11-12T14:01:24.981Z",
                "items": [
                    {
                        "id": "45912004-bfed-4aae-b8f5-751fd0f533a8",
                        "menu_item_id": "item_004",
                        "menu_item_name": "Butter Chicken",
                        "quantity": 1,
                        "unit_price": "380",
                        "subtotal": "380",
                        "special_requests": null
                    },
                    {
                        "id": "71172b98-89e9-42de-949e-1624880ab7c5",
                        "menu_item_id": "item_003",
                        "menu_item_name": "Dal Makhani",
                        "quantity": 1,
                        "unit_price": "250",
                        "subtotal": "250",
                        "special_requests": null
                    }
                ]
            },

2- /api/orders/a5d1e1dc-1128-461d-8876-052d0d4f3a2f|

{
    "data": {
        "id": "a5d1e1dc-1128-461d-8876-052d0d4f3a2f",
        "order_number": 88,
        "tenant_id": "11111111-1111-1111-1111-111111111111",
        "table_id": "5",
        "customer_id": "fa458c0f-a675-4fa9-80e1-b9bf9275234c",
        "status": "PENDING",
        "items": [
            {
                "id": "6b36fa8c-bdac-4caf-999e-58413beb75d3",
                "order_id": "a5d1e1dc-1128-461d-8876-052d0d4f3a2f",
                "menu_item_id": "item_001",
                "menu_item_name": "Paneer Tikka",
                "quantity": 2,
                "price_at_order": 280,
                "subtotal": 560,
                "special_instructions": null,
                "created_at": "2025-11-12T13:38:44.942Z"
            }
        ],
        "subtotal": 560,
        "discount_amount": 99.12,
        "discount_reason": "Lunch Special",
        "tax_amount": 100.8,
        "delivery_charge": 0,
        "total": 561.68,
        "payment_method": "cash",
        "payment_status": "pending",
        "special_instructions": "",
        "created_at": "2025-11-11T13:20:38.223Z",
        "estimated_prep_time": 15,
        "estimated_ready_at": "2025-11-12T13:38:44.942Z",
        "notes": ""
    },
    "meta": {
        "timestamp": "2025-11-12T13:38:44.943Z",
        "correlationId": "d60b060b-78c2-4725-bb55-f7771c3a5838",
        "tenantId": "11111111-1111-1111-1111-111111111111"
    }
}

3- PATCH {{base_url}}/api/orders/a5d1e1dc-1128-461d-8876-052d0d4f3a2f/status with req

{
  "status": "PREPARING" # or something else
}

4-/api/orders/0dc8e636-9e0c-4c36-83f7-81ace7a95cd7/cancel PATCH

cancel order

{
  "reason": "Customer requested cancellation"
}

5- dont use this one
 

