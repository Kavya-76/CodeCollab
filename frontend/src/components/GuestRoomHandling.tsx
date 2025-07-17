import React, { useState } from "react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { toast } from "sonner";
import { UserRound, KeyRound, ArrowLeft } from "lucide-react";
import { createRoom } from "@/utils/createRoom.js";

interface GuestRoomHandlingProps {
  onSubmit: (roomId: string, username: string, isNewRoom: boolean) => void;
  onBack?: () => void;
  isGuestMode?: boolean;
}

const GuestRoomHandling: React.FC<GuestRoomHandlingProps> = ({
  onSubmit,
  onBack,
  isGuestMode = false,
}) => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isNewRoom: boolean) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }

    if (!isNewRoom && !roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    let finalRoomId = roomId;

    if (isNewRoom) {
      try {
        finalRoomId = await createRoom();
      } catch (err) {
        toast.error("Failed to create room");
        return;
      }
    }

    onSubmit(finalRoomId, username, isNewRoom);
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-border/60">
      <CardHeader>
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit mb-2 -mt-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <CardTitle className="text-center">
          {isGuestMode && "Guest Mode - "}
          {isCreating
            ? "Create a New Coding Room"
            : "Join Existing Coding Room"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => handleSubmit(e, isCreating)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {!isCreating && (
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {isCreating ? "Create Room" : "Join Room"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          onClick={() => setIsCreating(!isCreating)}
          className="w-full text-sm"
        >
          {isCreating
            ? "Join an existing room instead"
            : "Create a new room instead"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuestRoomHandling;
