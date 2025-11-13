"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AvatarStyle {
  name: string;
  id: string;
  icon: string;
}

const AVATAR_STYLES: AvatarStyle[] = [
  { name: "Avataaars", id: "avataaars", icon: "👤" },
  { name: "Pixel Art", id: "pixel-art", icon: "🎮" },
  { name: "Lorelei", id: "lorelei", icon: "🧜‍♀️" },
  { name: "Micah", id: "micah", icon: "🎨" },
  { name: "Bottts", id: "bottts", icon: "🤖" },
  { name: "Croodles", id: "croodles", icon: "🎭" },
  { name: "Fun Emoji", id: "fun-emoji", icon: "😄" },
  { name: "Identicons", id: "identicons", icon: "🟦" },
];

const SEED_OPTIONS = [
  "rajesh",
  "priya",
  "amit",
  "anjali",
  "vikram",
  "neha",
  "arjun",
  "meera",
  "rohan",
  "disha",
  "karan",
  "pooja",
];

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
  isLoading?: boolean;
}

export function AvatarSelector({
  currentAvatar,
  onSelect,
  isLoading = false,
}: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("avataaars");
  const [previewAvatars, setPreviewAvatars] = useState<string[]>([]);

  const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
    // Generate preview avatars for the selected style
    const previews = SEED_OPTIONS.slice(0, 6).map((seed) =>
      generateAvatarUrl(styleId, seed)
    );
    setPreviewAvatars(previews);
  };

  const handleSelectAvatar = (seed: string) => {
    const avatarUrl = generateAvatarUrl(selectedStyle, seed);
    onSelect(avatarUrl);
    setIsOpen(false);
  };

  // Initialize previews on first open
  if (isOpen && previewAvatars.length === 0) {
    const previews = SEED_OPTIONS.slice(0, 6).map((seed) =>
      generateAvatarUrl(selectedStyle, seed)
    );
    setPreviewAvatars(previews);
  }

  return (
    <>
      <Button
        className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold"
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
      >
        📸 Change Avatar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select an avatar style and then pick a design you like
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar Styles */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                Avatar Styles
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleChange(style.id)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedStyle === style.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{style.icon}</span>
                    <span className="text-xs font-medium text-slate-600">
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Previews */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                Select Design
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {previewAvatars.map((avatarUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAvatar(SEED_OPTIONS[index])}
                    className="group flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-all hover:bg-blue-50"
                  >
                    <img
                      src={avatarUrl}
                      alt={`Avatar ${index + 1}`}
                      className="w-20 h-20 rounded-full"
                    />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600">
                      {SEED_OPTIONS[index]}
                    </span>
                    <Badge className="text-xs bg-blue-100 text-blue-800">
                      Select
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Avatar Preview */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-600 mb-2">
                Current Avatar
              </p>
              <img
                src={currentAvatar}
                alt="Current Avatar"
                className="w-16 h-16 rounded-full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
