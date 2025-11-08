"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { MenuItem } from "@/lib/api/admin/menu";

interface MenuTableProps {
  items: MenuItem[];
  onDelete: (itemId: string) => Promise<void>;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => Promise<void>;
  isDeleting?: boolean;
  isToggling?: boolean;
}

export function MenuTable({
  items,
  onDelete,
  onToggleAvailability,
  isDeleting = false,
  isToggling = false,
}: MenuTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAvailability = async (
    itemId: string,
    currentStatus: boolean
  ) => {
    try {
      setTogglingId(itemId);
      await onToggleAvailability(itemId, !currentStatus);
    } finally {
      setTogglingId(null);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No menu items found</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Time (min)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell className="font-semibold">₹{item.price}</TableCell>
                <TableCell>{item.preparation_time_minutes}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.is_vegetarian ? "default" : "secondary"}
                    className={
                      item.is_vegetarian
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {item.is_vegetarian ? "🥗 Veg" : "🍗 Non-Veg"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.is_available ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      ✓ Available
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      ✗ Out of Stock
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/menu/${item.id}/edit`}>
                          <Edit2 size={14} className="mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleAvailability(item.id, item.is_available)
                        }
                        disabled={togglingId === item.id || isToggling}
                      >
                        {item.is_available ? (
                          <>
                            <EyeOff size={14} className="mr-2" />
                            Mark Out of Stock
                          </>
                        ) : (
                          <>
                            <Eye size={14} className="mr-2" />
                            Mark Available
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item? This action cannot
              be undone and may affect existing orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
