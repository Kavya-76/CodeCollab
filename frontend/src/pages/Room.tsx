import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CodeEditor from "@/components/CodeEditor.js";
import UsersList from "@/components/UserList.js";
import LanguageSelector from "@/components/LanguageSelector.js";
import { Button } from "@/components/ui/button.js";
import { Play } from "lucide-react";
import { toast } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable.js";
import socket from "@/utils/socket.js";

const Room = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { roomId } = useParams();
  const username = location.state?.username;

  const [code, setCode] = useState("// Start coding here...");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);

  // no username found
  useEffect(() => {
    if (!username) navigate("/");
  }, [username]);

  // to handle the user join event
  useEffect(() => {
    if (!username || !roomId) return;

    socket.emit("join-room", { roomId, username });

    socket.on("user-list", (usersPresent) => {
      console.log(usersPresent);
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
        userId: socket.id,
        isActive,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    handleVisibilityChange();

    // automatically leaves the room if page is refreshed or closed
    return () => {
      socket.emit("leave-room", { roomId, username });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [roomId, username]);

  const handleRun = async () => {
    if (!roomId || !username) return;

    socket.emit("start-execution", { roomId, username });

    setIsExecuting(true);
    setOutput("");

    const encodedCode = btoa(code);

    const headers = {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": import.meta.env.VITE_XRapidAPIKey, // use same key for both
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    };

    try {
      const submissionRes = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            source_code: encodedCode,
            language_id: languageId,
            stdin: btoa(""), // or pass actual input
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

  // Handle sidebar collapse
  const handleSidebarResize = (sizes: number[]) => {
    setSidebarCollapsed(sizes[0] < 10);
  };

  return (
    <div className="min-h-screen flex w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full"
        onLayout={handleSidebarResize}
      >
        {/* Users Sidebar */}
        <ResizablePanel
          defaultSize={15}
          // minSize={5}
          maxSize={30}
          className="bg-secondary"
        >
          <UsersList users={users} isCollapsed={sidebarCollapsed} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={85}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <header className="py-4 px-4 border-b border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1
                    className="text-xl font-bold cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    <span className="text-code-blue">Code</span>
                    <span className="text-white">Collab</span>
                  </h1>
                  <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                    Room: {roomId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSelector
                    currentLanguage={language}
                    onLanguageChange={handleLanguageChange}
                  />
                  <Button onClick={handleRun} disabled={isExecuting}>
                    <Play className="mr-1 h-4 w-4" />
                    {isExecuting ? "Running..." : "Run"}
                  </Button>
                </div>
              </div>
            </header>

            {/* Editor and Output */}
            <div className="flex-1 p-4">
              <ResizablePanelGroup
                direction="vertical"
                className="min-h-[calc(100vh-7rem)]"
              >
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full bg-secondary rounded-md border border-border">
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
                <ResizablePanel defaultSize={30} minSize={5} className="mt-2">
                  <div className="h-full bg-secondary rounded-md border border-border overflow-auto ">
                    <div className="h-8.5 border-b-blue-950 border-2 flex items-center">
                      <h2 className="font-bold text-muted-foreground ml-2">
                        Output
                      </h2>
                    </div>
                    <pre className="text-sm font-mono">
                      {output || "Run your code to see output here..."}
                    </pre>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Room;
