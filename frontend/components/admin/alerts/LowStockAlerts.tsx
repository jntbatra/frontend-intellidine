"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface LowStockAlertsProps {
  alerts: any[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

const ALERT_TYPE_COLORS: Record<string, string> = {
  low_stock: "bg-red-100 text-red-800 border-red-300",
  overstock: "bg-orange-100 text-orange-800 border-orange-300",
  expired_soon: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  low_stock: "Low Stock Alert",
  overstock: "Overstock Alert",
  expired_soon: "Expiring Soon",
};

const STATUS_BADGES: Record<string, string> = {
  active: "bg-red-100 text-red-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export function LowStockAlerts({
  alerts,
  onAcknowledge,
  onResolve,
}: LowStockAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  const visibleAlerts = alerts.filter(
    (alert) => !dismissedAlerts.has(alert.id)
  );

  const handleDismiss = (alertId: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(alertId);
    setDismissedAlerts(newDismissed);
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <CardTitle className="text-red-900">
              Active Inventory Alerts
            </CardTitle>
          </div>
          <Badge className="bg-red-600 text-white">
            {visibleAlerts.length} Alert{visibleAlerts.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription className="text-red-800">
          Attention required for these inventory items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg flex items-start justify-between ${
                ALERT_TYPE_COLORS[alert.alert_type]
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{alert.menu_item_name}</span>
                  <Badge
                    className={STATUS_BADGES[alert.status]}
                    variant="outline"
                  >
                    {alert.status.charAt(0).toUpperCase() +
                      alert.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mb-2">
                  {ALERT_TYPE_LABELS[alert.alert_type]}
                </p>
                <p className="text-sm">
                  Current Stock:{" "}
                  <span className="font-semibold">{alert.current_stock}</span> •
                  Minimum:{" "}
                  <span className="font-semibold">
                    {alert.minimum_threshold}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {alert.status === "active" && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-xs opacity-80 hover:opacity-100"
                      onClick={() => onAcknowledge?.(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-xs opacity-80 hover:opacity-100"
                      onClick={() => onResolve?.(alert.id)}
                    >
                      Resolve
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                  onClick={() => handleDismiss(alert.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
