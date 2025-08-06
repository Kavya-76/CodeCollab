import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import OutputPanel from "@/components/OutputPanel.js";
import CodeEditor from "@/components/CodeEditor.js";
import UsersSidebar from "@/components/UsersSidebar.js";
import { Play, LogOut, Menu, X, ChevronRight } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector.js";
import { Button } from "@/components/ui/button.js";
import { toast } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable.js";
import socket from "@/utils/socket.js";

interface User {
  id: string; // socketId
  username: string;
  userId?: string;
  avatar?: string;
  isActive?: boolean;
  isGuest?: boolean;
  joinedAt: Date;
}

const Room = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { roomId } = useParams();
  const userId = location.state?.userId;
  const username = location.state?.username;
  const isGuest = location.state?.isGuest;
  const avatar = location.state?.avatar;

  const [code, setCode] = useState("// Start coding here...");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);

  const [users, setUsers] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);

  // no username found
  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  // to handle the user join event
  useEffect(() => {
    if (!userId || !roomId) return;
    socket.emit("join-room", { roomId, userId, username, avatar, isGuest });

    socket.on("user-list", (usersPresent) => {
      setUsers(usersPresent);
    });

    socket.on("user-joined", (newUser) => {
      console.log(`${newUser.username} joined the room`);
    });

    socket.on("user-left", (leftUser) => {
      console.log(`${leftUser.username} left the room`);
    });

    socket.on("code-change", (newCode) => {
      setCode(newCode);
    });

    socket.on("input-change", (newInput) => {
      setInput(newInput);
    });

    socket.on("output-result", (result) => {
      setOutput(result);
    });

    socket.on("language-change", ({ newLanguage, newLanguageId }) => {
      setLanguage(newLanguage);
      setLanguageId(newLanguageId);
    });

    socket.on("execution-locked", ({ username }) => {
      setIsExecuting(true);
      toast(`${username} is running the code...`);
    });

    socket.on("execution-unlocked", () => {
      setIsExecuting(false);
    });

    // Handle is user active or not
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      socket.emit("user-activity", {
        roomId,
        userId,
        isActive,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();

    const handleUnload = () => {
      socket.emit("leave-room", { roomId, userId });
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      socket.emit("leave-room", { roomId, userId });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);

      socket.off("user-list");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("code-change");
      socket.off("input-change");
      socket.off("output-result");
      socket.off("language-change");
      socket.off("execution-locked");
      socket.off("execution-unlocked");
    };
  }, [roomId, userId]);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "X-RapidAPI-Key": import.meta.env.VITE_XRapidAPIKey,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    }),
    []
  );

  const handleRun = async () => {
    if (!roomId || !username) return;

    socket.emit("start-execution", { roomId, username });

    setIsExecuting(true);
    setOutput("");

    const encodedCode = btoa(code);

    try {
      const submissionRes = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            source_code: encodedCode,
            language_id: languageId,
            stdin: btoa(input), // or pass actual input
          }),
        }
      );

      const { token } = await submissionRes.json();

      let result = null;

      while (true) {
        const res = await fetch(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
          {
            method: "GET",
            headers, // use same headers here
          }
        );

        result = await res.json();

        if (result.status?.id <= 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }

      const outputText =
        atob(result.stdout || "") ||
        atob(result.compile_output || "") ||
        atob(result.stderr || "") ||
        "No output";

      setOutput(outputText);
      socket.emit("output-result", { roomId, output: outputText });
    } catch (err) {
      console.error(err);

      const errorText = `Error executing code\n${err}`;
      setOutput(errorText);
      socket.emit("output-result", { roomId, output: errorText });
    } finally {
      setIsExecuting(false);
      socket.emit("end-execution", { roomId });
    }
  };

  const handleLanguageChange = (newLanguage: string, newLanguageId: number) => {
    socket.emit("language-change", {
      roomId,
      language: newLanguage,
      languageId: newLanguageId,
    });
    setLanguage(newLanguage);
    setLanguageId(newLanguageId);
    toast(`Language changed to ${newLanguage}`);
  };

  const toggleSidebar = () => {
    if (sidebarCollapsed) {
      // From collapsed to expanded
      setSidebarCollapsed(false);
      setSidebarMinimized(false);
    } else if (!sidebarMinimized) {
      // From expanded to minimized
      setSidebarMinimized(true);
    } else {
      // From minimized to collapsed
      setSidebarCollapsed(true);
    }
  };

  // Handle sidebar collapse
  const handlePanelResize = (sizes: number[]) => {
    // Auto-collapse output panel when it gets too small (less than 15% of total height)
    const outputPanelSize = sizes[1];
    setOutputCollapsed(outputPanelSize < 15);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", {
      roomId,
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar - Sticky */}
      <header className="sticky top-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left section with room info */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              {sidebarCollapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">
                <span className="text-code-blue">Collab</span>
                <span className="text-foreground">Code</span>
              </h1>
              <div className="hidden sm:block bg-muted px-3 py-1.5 rounded-full text-sm font-medium">
                Room: <span className="text-primary">{roomId}</span>
              </div>
            </div>
          </div>

          {/* Right section with controls */}
          <div className="flex items-center gap-3">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
            <Button
              onClick={handleRun}
              disabled={isExecuting}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting ? "Running..." : "Run Code"}
            </Button>
            <Button
              onClick={handleLeaveRoom}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Leave Room
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - only show when not collapsed */}
        {!sidebarCollapsed && (
          <UsersSidebar
            currentUserId={userId}
            users={users}
            collapsed={sidebarCollapsed}
            minimized={sidebarMinimized}
            onToggle={toggleSidebar}
          />
        )}

        {/* Floating toggle button when sidebar is collapsed */}
        {sidebarCollapsed && (
          <div className="fixed top-20 left-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="bg-card border border-border shadow-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          <ResizablePanelGroup
            direction="vertical"
            className="h-full"
            onLayout={handlePanelResize}
          >
            {/* Code Editor */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full border-r border-border">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={(newCode) => {
                    setCode(newCode);
                    socket.emit("code-change", { roomId, code: newCode });
                  }}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Output Panel with Tabs */}
            <ResizablePanel defaultSize={40} minSize={10}>
              <OutputPanel
                output={output}
                input={input}
                onInputChange={(newInput) => {
                    setInput(newInput);
                    socket.emit("input-change", { roomId, input: newInput });
                  }}
                isCollapsed={outputCollapsed}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
};

export default Room;
