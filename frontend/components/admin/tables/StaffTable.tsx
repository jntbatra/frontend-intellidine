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
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { StaffMember } from "@/lib/api/admin/staff";

interface StaffTableProps {
  staff: StaffMember[];
  onDelete: (staffId: string) => Promise<void>;
  isDeleting?: boolean;
}

const roleColors: Record<string, string> = {
  MANAGER: "bg-purple-100 text-purple-800",
  KITCHEN_STAFF: "bg-orange-100 text-orange-800",
  WAITER: "bg-blue-100 text-blue-800",
  STAFF: "bg-slate-100 text-slate-800",
};

export function StaffTable({
  staff,
  onDelete,
  isDeleting = false,
}: StaffTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  if (!staff || staff.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No staff members found</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{member.username}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone || "-"}</TableCell>
                <TableCell>
                  <Badge
                    className={roleColors[member.role] || "bg-gray-100"}
                    variant="secondary"
                  >
                    {member.role.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.is_active ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      ✗ Inactive
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
                        <Link href={`/admin/staff/${member.id}/edit`}>
                          <Edit2 size={14} className="mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(member.id)}
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
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => {
        if (!open) setDeleteId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
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
