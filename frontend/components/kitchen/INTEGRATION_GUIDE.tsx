/**
 * INTEGRATION GUIDE: Kitchen Order Display System
 *
 * This file provides examples of how to integrate and customize the Kitchen Order Display
 * NOTE: These are code examples - see README.md for detailed documentation
 */

// ============================================================
// EXAMPLE 1: Basic Kitchen Page Setup
// ============================================================
// File: app/kitchen/page.tsx
//
// import { KitchenOrderBoard } from "@/components/kitchen";
// import { useEffect, useState } from "react";
//
// export default function KitchenPage() {
//   const [tenantId, setTenantId] = useState<string>("");
//
//   useEffect(() => {
//     const storedTenantId = localStorage.getItem("current_tenant_id");
//     if (storedTenantId) {
//       setTenantId(storedTenantId);
//     }
//   }, []);
//
//   if (!tenantId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             Kitchen Display System
//           </h1>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
//
//   return <KitchenOrderBoard tenantId={tenantId} />;
// }

// ============================================================
// EXAMPLE 2: Using the Hook for Custom UI
// ============================================================
//
// import { useKitchenOrders, groupOrdersByStatus } from "@/hooks/use-kitchen-orders";
//
// export function CustomKitchenDashboard() {
//   const {
//     orders,
//     isLoading,
//     isError,
//     updateOrderStatus,
//     autoRefresh,
//     toggleAutoRefresh,
//     manualRefresh,
//   } = useKitchenOrders("tenant-123");
//
//   const grouped = groupOrdersByStatus(orders);
//
//   return (
//     <div className="p-4">
//       <button onClick={toggleAutoRefresh}>
//         {autoRefresh ? "Pause" : "Resume"} Auto-Refresh
//       </button>
//
//       {isLoading && <p>Loading orders...</p>}
//       {isError && <p>Error loading orders</p>}
//
//       <div className="grid grid-cols-3 gap-4">
//         <div>
//           <h2>New ({grouped.pending.length})</h2>
//           {/* Render pending orders */}
//         </div>
//         <div>
//           <h2>Preparing ({grouped.preparing.length})</h2>
//           {/* Render preparing orders */}
//         </div>
//         <div>
//           <h2>Ready ({grouped.ready.length})</h2>
//           {/* Render ready orders */}
//         </div>
//       </div>
//     </div>
//   );
// }

// ============================================================
// EXAMPLE 3: Adding Sound/Visual Alerts
// ============================================================
//
// import { useKitchenOrders } from "@/hooks/use-kitchen-orders";
// import { useEffect, useRef } from "react";
//
// export function KitchenWithAlerts() {
//   const { orders } = useKitchenOrders("tenant-123");
//   const previousCountRef = useRef(0);
//
//   useEffect(() => {
//     const pendingCount = orders.filter(o => o.status === "pending").length;
//
//     if (previousCountRef.current < pendingCount) {
//       // New order arrived!
//
//       // Option 1: Play sound
//       const audio = new Audio("/sounds/new-order.mp3");
//       audio.play().catch(err => console.error("Failed to play sound:", err));
//
//       // Option 2: Show browser notification
//       if ("Notification" in window && Notification.permission === "granted") {
//         new Notification("New Order", {
//           body: `Order #${orders[0]?.order_number} received`,
//           icon: "/kitchen-icon.png",
//         });
//       }
//     }
//
//     previousCountRef.current = pendingCount;
//   }, [orders]);
//
//   return <KitchenOrderBoard tenantId="tenant-123" />;
// }

// ============================================================
// EXAMPLE 4: Multiple Kitchen Displays
// ============================================================
//
// For different sections (Pizza, Dessert, Beverages):
//
// export function SectionKitchenDisplays() {
//   return (
//     <div className="grid grid-cols-3 gap-4">
//       <KitchenOrderBoard tenantId="pizza-section" />
//       <KitchenOrderBoard tenantId="dessert-section" />
//       <KitchenOrderBoard tenantId="beverage-section" />
//     </div>
//   );
// }

// ============================================================
// EXAMPLE 5: Keyboard Controls
// ============================================================
//
// Add keyboard shortcuts for common actions:
//
// import { useEffect } from "react";
//
// export function KitchenWithShortcuts() {
//   const { toggleAutoRefresh, manualRefresh } = useKitchenOrders("tenant-123");
//
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.key === "r" || e.key === "R") {
//         manualRefresh();
//       }
//       if (e.key === "p" || e.key === "P") {
//         toggleAutoRefresh();
//       }
//     };
//
//     window.addEventListener("keydown", handleKeyPress);
//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, [toggleAutoRefresh, manualRefresh]);
//
//   return <KitchenOrderBoard tenantId="tenant-123" />;
// }

// ============================================================
// CUSTOMIZATION TIPS
// ============================================================
//
// 1. Change Auto-Refresh Interval:
//    hooks/use-kitchen-orders.ts - Update AUTO_REFRESH_INTERVAL
//
// 2. Customize Colors:
//    components/kitchen/OrderColumn.tsx - Modify colorClasses object
//
// 3. Modify Order Card Layout:
//    components/kitchen/OrderCard.tsx - Add/remove fields
//
// 4. Add Drag-and-Drop:
//    npm install react-beautiful-dnd @types/react-beautiful-dnd
//    Use KitchenOrderBoard.draggable.tsx instead
//
// 5. Environment Configuration in .env.local:
//    NEXT_PUBLIC_API_URL=http://localhost:3001
//    NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=15000

export const INTEGRATION_GUIDE = "See comments above for integration examples";
