import React, { useState } from 'react';
import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.js';
import {toast} from "sonner"
import { UserRound, KeyRound } from 'lucide-react';

interface JoinSessionFormProps {
  onSubmit: (roomId: string, username: string, isNewRoom: boolean) => void;
}

const JoinSessionForm: React.FC<JoinSessionFormProps> = ({ onSubmit }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent, isNewRoom: boolean) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }
    
    if (!isNewRoom && !roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    
    const finalRoomId = isNewRoom ? `room_${Math.floor(100000 + Math.random() * 900000).toString()}` : roomId;
    onSubmit(finalRoomId, username, isNewRoom);
  };
  
  return (
    <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-border/60">
      <CardHeader>
        <CardTitle className="text-center">
          {isCreating ? "Create a New Coding Room" : "Join Existing Coding Room"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e, isCreating)} className="space-y-4">
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
            {isCreating ? "Create & Join Room" : "Join Room"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          variant="link" 
          onClick={() => setIsCreating(!isCreating)}
          className="w-full text-sm"
        >
          {isCreating ? "Join an existing room instead" : "Create a new room instead"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JoinSessionForm;