"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarSelector } from "@/components/admin/avatars/AvatarSelector";
import Link from "next/link";

interface ManagerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "admin";
  restaurant_name: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface ProfileSettings {
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
  two_factor_enabled: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // Mock profile data
  const [profile, setProfile] = useState<ManagerProfile>({
    id: "manager-001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@intellidine.com",
    phone: "+91-9876543210",
    role: "manager",
    restaurant_name: "IntelliDine - Mumbai",
    bio: "Restaurant Manager with 10+ years of experience in food service",
    address: "123 Restaurant Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh",
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-11-09T15:45:00Z",
    is_active: true,
  });

  const [settings, setSettings] = useState<ProfileSettings>({
    notification_email: true,
    notification_sms: true,
    notification_push: true,
    two_factor_enabled: false,
    theme: "light",
    language: "en",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleProfileChange = (field: keyof ManagerProfile, value: any) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleSettingsChange = (field: keyof ProfileSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfile(editedProfile);
      setIsEditing(false);
      setSuccessMessage("✅ Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      console.log("✅ Profile saved:", editedProfile);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccessMessage("✅ Settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      console.log("✅ Settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!passwordForm.current_password) {
      errors.current_password = "Current password is required";
    }
    if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
      errors.new_password = "New password must be at least 8 characters";
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordErrors({});
      setSuccessMessage("✅ Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      console.log("✅ Password changed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profile Settings
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your account and preferences
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {successMessage}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">👤 Profile</TabsTrigger>
          <TabsTrigger value="security">🔐 Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar & Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full mb-3 border-2 border-slate-200"
                  />
                  <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                  <p className="text-sm text-slate-600">{profile.role.toUpperCase()}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <AvatarSelector
                  currentAvatar={profile.avatar_url || ""}
                  onSelect={(newAvatarUrl) => {
                    setProfile({ ...profile, avatar_url: newAvatarUrl });
                    setEditedProfile({ ...editedProfile, avatar_url: newAvatarUrl });
                  }}
                  isLoading={isSaving}
                />
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setEditedProfile(profile);
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  {isEditing ? "Cancel" : "✏️ Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => handleProfileChange("name", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      disabled
                      className="mt-1 bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant">Restaurant Name</Label>
                    <Input
                      id="restaurant"
                      value={editedProfile.restaurant_name}
                      disabled
                      className="mt-1 bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Cannot be changed</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editedProfile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editedProfile.address}
                      onChange={(e) => handleProfileChange("address", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editedProfile.city}
                      onChange={(e) => handleProfileChange("city", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editedProfile.state}
                      onChange={(e) => handleProfileChange("state", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={editedProfile.pincode}
                      onChange={(e) => handleProfileChange("pincode", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-white hover:bg-amber-400 border border-slate-200 text-slate-900 font-semibold transition-colors"
                  >
                    {isSaving ? "Saving..." : "💾 Save Changes"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current_password: e.target.value,
                      })
                    }
                    className={`mt-1 ${
                      passwordErrors.current_password ? "border-red-500" : ""
                    }`}
                    disabled={isSaving}
                  />
                  {passwordErrors.current_password && (
                    <p className="text-xs text-red-600 mt-1">
                      {passwordErrors.current_password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        new_password: e.target.value,
                      })
                    }
                    className={`mt-1 ${
                      passwordErrors.new_password ? "border-red-500" : ""
                    }`}
                    disabled={isSaving}
                    placeholder="At least 8 characters"
                  />
                  {passwordErrors.new_password && (
                    <p className="text-xs text-red-600 mt-1">
                      {passwordErrors.new_password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm_password: e.target.value,
                      })
                    }
                    className={`mt-1 ${
                      passwordErrors.confirm_password ? "border-red-500" : ""
                    }`}
                    disabled={isSaving}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-xs text-red-600 mt-1">
                      {passwordErrors.confirm_password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-white hover:bg-amber-400 border border-slate-200 text-slate-900 font-semibold transition-colors"
                >
                  {isSaving ? "Updating..." : "🔐 Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">
                    Enable Two-Factor Authentication
                  </p>
                  <p className="text-sm text-slate-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Checkbox
                  checked={settings.two_factor_enabled}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("two_factor_enabled", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-white hover:bg-amber-400 border border-slate-200 text-slate-900 font-semibold transition-colors"
          >
            {isSaving ? "Saving..." : "💾 Save Security Settings"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
