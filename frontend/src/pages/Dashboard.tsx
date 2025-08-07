import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.js";
import { Badge } from "@/components/ui/badge.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Code,
  Clock,
  Users,
  Settings,
  LogOut,
  Github,
} from "lucide-react";
import JoinRoomDialog from "@/components/JoinRoomDialog.js";
import ProfileDialog from "@/components/ProfileDialog.js";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import axios from "axios";
import { createRoom } from "@/utils/createRoom.js";

interface CodeData {
  _id?: string;
  content: string;
  language: string;
  savedAt: string;
}

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  provider: string;
  savedCodes: CodeData[];
}

// Mock previous codes data
const mockPreviousCodes = [
  {
    id: "1",
    name: "React Calculator",
    language: "JavaScript",
    content: "",
    savedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Todo App",
    lastModified: "1 day ago",
    collaborators: 1,
    language: "TypeScript",
  },
  {
    id: "3",
    name: "Weather Dashboard",
    lastModified: "3 days ago",
    collaborators: 2,
    language: "React",
  },
  {
    id: "4",
    name: "API Integration",
    lastModified: "1 week ago",
    collaborators: 4,
    language: "Node.js",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [codes, setCodes] = useState<CodeData[]>([]);

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();

          const res = await axios.get("http://localhost:5000/api/user/getInfo", {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          setUser(res.data);
          setCodes(res.data.savedCodes || []);
        } catch (error) {
          console.error("Error fetching user info:", error);
          toast.error("Failed to load user data");
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateRoom = async () => {
    const username = user?.displayName;
    const {userId, roomId} = await createRoom();
    toast.success(`Created new room ${roomId}!`);
    navigate(`/room/${roomId}`, {
      state: {
        userId,
        username,
        isGuest: false,
        avatar: user?.photoURL
      },
    });
  };

  const handleJoinRoom = (roomId: string) => {
    const username = user?.displayName;
    const userId = user?.uid;
    toast.success(`Joining room ${roomId}!`);
    navigate(`/room/${roomId}`, {
      state: {
        username,
        userId
      },
    });
  };

  const handleOpenCode = (codeId: string, codeName: string) => {
    // In real app, this would load the actual room/session
    toast.success(`Opening ${codeName}...`);
    navigate(`/code/${codeId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                <span className="text-code-blue">Code</span>
                <span className="text-white">Collab</span>
              </h1>
              <Badge variant="secondary" className="hidden sm:flex">
                Dashboard
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileDialog(true)}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL} />
                  <AvatarFallback>
                    {user?.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block">{user?.displayName}</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.displayName.split(" ")[0]}! 👋
              </h2>
              <p className="text-muted-foreground">
                Ready to code together? Create a new room or continue working on
                your projects.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateRoom}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Room
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowJoinDialog(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Join Room
              </Button>
            </div>
          </div>

          {/* Previous Codes Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-code-blue" />
                Recent Projects
              </h3>
              <Badge variant="outline">
                {mockPreviousCodes.length}/5 recent
              </Badge>
            </div>

            {mockPreviousCodes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockPreviousCodes.map((code) => (
                  <Card
                    key={code.id}
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenCode(code.id, code.name)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{code.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {code.language}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {code.lastModified}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {code.collaborators}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium mb-2">
                    No recent projects
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Start coding by creating your first collaborative room.
                  </p>
                  <Button onClick={handleCreateRoom}>
                    Create Your First Room
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold">
                      {mockPreviousCodes.length}
                    </p>
                  </div>
                  <Code className="h-8 w-8 text-code-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Collaborations
                    </p>
                    <p className="text-2xl font-bold">
                      0
                      {/* {mockPreviousCodes.reduce(
                        (acc, code) => acc + code.collaborators,
                        0
                      )} */}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-code-purple" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Account Type
                    </p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      {user?.provider === "github" ? "GitHub" : "Google"}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL} />
                    <AvatarFallback>
                      {user?.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <JoinRoomDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoinRoom={handleJoinRoom}
      />

      {user && (
        <ProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          user={user}
        />
      )}
    </div>
  );
};

export default Dashboard;
