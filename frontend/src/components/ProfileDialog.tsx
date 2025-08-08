import React, { useState } from "react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.js";
import { Badge } from "@/components/ui/badge.js";
import { toast } from "sonner";
import { Upload, Github, Mail, User } from "lucide-react";
import axios from "axios";
import { auth } from "@/firebase.js";

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  provider: string;
}

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const [name, setName] = useState<string>(user.displayName || "");
  const [avatar, setAvatar] = useState<string>(user.photoURL || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();

      await axios.put(
        `${backendUrl}/api/user/updateDisplayName`,
        { displayName: name },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setName(name);
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user info:", error);
      toast.error("Failed to update user data");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar || undefined} />
                <AvatarFallback className="text-lg">
                  {name
                    ? name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Github className="h-3 w-3" />
              Connected via {user.provider === "github" ? "GitHub" : "Google"}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email}
                  className="pl-10 bg-muted"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed as it's linked to your{" "}
                {user.provider === "github" ? "GitHub" : "Google"} account
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
