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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { MenuItem } from "@/lib/api/admin/menu";

interface MenuItemFormProps {
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<MenuItem>;
  mode?: "add" | "edit";
  categories?: string[];
}

export interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  category: string;
  is_vegetarian: boolean;
  preparation_time_minutes: number;
  image_url?: string;
  allergens?: string[];
  tags?: string[];
}

const ALLERGEN_OPTIONS = [
  "dairy",
  "gluten",
  "peanuts",
  "tree_nuts",
  "soy",
  "fish",
  "shellfish",
  "eggs",
];

const TAG_OPTIONS = ["spicy", "popular", "bestseller", "new", "vegan"];

const DEFAULT_CATEGORIES = [
  "APPETIZERS",
  "MAIN_COURSE",
  "BREADS",
  "DESSERTS",
  "BEVERAGES",
];

export function MenuItemForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
  categories = DEFAULT_CATEGORIES,
}: MenuItemFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    initialData?.allergens || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags || []
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      category: initialData?.category || "MAIN_COURSE",
      is_vegetarian: initialData?.is_vegetarian ?? false,
      preparation_time_minutes: initialData?.preparation_time_minutes || 15,
      image_url: initialData?.image_url || "",
    },
  });

  const isVegetarian = watch("is_vegetarian");

  const onSubmitHandler = async (data: MenuItemFormData) => {
    setError(null);
    try {
      await onSubmit({
        ...data,
        allergens: selectedAllergens,
        tags: selectedTags,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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

      {/* Item Name */}
      <div>
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Butter Chicken"
          {...register("name", {
            required: "Item name is required",
            minLength: {
              value: 3,
              message: "Item name must be at least 3 characters",
            },
          })}
          disabled={isLoading}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          placeholder="Describe the dish..."
          {...register("description")}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Price and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g., 280"
            step="0.01"
            {...register("price", {
              required: "Price is required",
              min: { value: 0, message: "Price must be greater than 0" },
            })}
            disabled={isLoading}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            defaultValue={initialData?.category || "MAIN_COURSE"}
            onValueChange={(value) => {
              register("category").onChange({
                target: { value },
              });
            }}
          >
            <SelectTrigger disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Preparation Time and Vegetarian */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prep_time">Preparation Time (minutes) *</Label>
          <Input
            id="prep_time"
            type="number"
            placeholder="e.g., 15"
            {...register("preparation_time_minutes", {
              required: "Preparation time is required",
              min: { value: 1, message: "Must be at least 1 minute" },
            })}
            disabled={isLoading}
            className={errors.preparation_time_minutes ? "border-red-500" : ""}
          />
          {errors.preparation_time_minutes && (
            <p className="text-sm text-red-600 mt-1">
              {errors.preparation_time_minutes.message}
            </p>
          )}
        </div>

        <div className="flex items-end pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vegetarian"
              {...register("is_vegetarian")}
              defaultChecked={initialData?.is_vegetarian}
            />
            <Label htmlFor="vegetarian" className="cursor-pointer">
              {isVegetarian ? "🥗 Vegetarian" : "🍗 Non-Vegetarian"}
            </Label>
          </div>
        </div>
      </div>

      {/* Image URL */}
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://example.com/image.jpg"
          {...register("image_url")}
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500 mt-1">
          Provide a URL to an image of the dish
        </p>
      </div>

      {/* Allergens */}
      <div>
        <Label>Allergens</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {ALLERGEN_OPTIONS.map((allergen) => (
            <div key={allergen} className="flex items-center space-x-2">
              <Checkbox
                id={`allergen-${allergen}`}
                checked={selectedAllergens.includes(allergen)}
                onCheckedChange={() => toggleAllergen(allergen)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`allergen-${allergen}`}
                className="cursor-pointer text-sm capitalize"
              >
                {allergen.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {TAG_OPTIONS.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag}`}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`tag-${tag}`}
                className="cursor-pointer text-sm capitalize"
              >
                {tag.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold">
        {isLoading
          ? "Saving..."
          : mode === "add"
            ? "Add Menu Item"
            : "Update Menu Item"}
      </Button>
    </form>
  );
}
