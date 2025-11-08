"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface StaffFormProps {
  onSubmit: (data: StaffFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<StaffFormData>;
  mode?: "add" | "edit";
}

export interface StaffFormData {
  username: string;
  email: string;
  phone?: string;
  password?: string;
  role: "MANAGER" | "KITCHEN_STAFF" | "WAITER" | "STAFF";
  is_active?: boolean;
}

export function StaffForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}: StaffFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: {
      ...initialData,
      role: initialData?.role || "STAFF",
      is_active: initialData?.is_active ?? true,
    },
  });

  const password = watch("password");

  const onSubmitHandler = async (data: StaffFormData) => {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const passwordRules = {
    minLength: { value: 8, message: "Password must be at least 8 characters" },
    pattern: {
      value: /^(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain uppercase letter and number",
    },
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Username */}
      <div>
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          placeholder="e.g., raj_kitchen"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          })}
          disabled={isLoading}
          className={errors.username ? "border-red-500" : ""}
        />
        {errors.username && (
          <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g., raj@spiceroute.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          disabled={isLoading}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone (optional) */}
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="e.g., 9876543210"
          {...register("phone", {
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Phone must be 10 digits",
            },
          })}
          disabled={isLoading}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <Label htmlFor="role">Role *</Label>
        <Select
          defaultValue={initialData?.role || "STAFF"}
          onValueChange={(value) => {
            register("role").onChange({
              target: { value },
            });
          }}
        >
          <SelectTrigger disabled={isLoading}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="KITCHEN_STAFF">Kitchen Staff</SelectItem>
            <SelectItem value="WAITER">Waiter</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
        )}
      </div>

      {/* Password */}
      {mode === "add" && (
        <div>
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a strong password"
              {...register("password", {
                required: "Password is required",
                ...passwordRules,
              })}
              disabled={isLoading}
              className={errors.password ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-900"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            • Minimum 8 characters
            <br />• At least 1 uppercase letter
            <br />• At least 1 number
          </p>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Saving..." : mode === "add" ? "Add Staff Member" : "Update Staff Member"}
      </Button>
    </form>
  );
}
