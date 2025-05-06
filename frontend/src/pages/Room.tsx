import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

const Room = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState("// Start coding here...");
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // This would be replaced with actual user data from your backend
  const [users, setUsers] = useState([
    { id: "1", username: "You", isActive: true },
    { id: "2", username: "Alex", isActive: true },
    { id: "3", username: "Sam", isActive: false },
  ]);

  const handleRun = async () => {
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
    } catch (err) {
      console.error(err);
      setOutput("Error executing code.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLanguageChange = (newLanguage: string, newLanguageId: number) => {
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
          minSize={5}
          maxSize={30}
          className="bg-secondary"
        >
          <UsersList users={users} isCollapsed={sidebarCollapsed} />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={85}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <header className="py-4 px-4 border-b border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold">
                    <span className="text-code-blue">Collab</span>
                    <span className="text-white">Code</span>
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
                      onChange={setCode}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={15}>
                  <div className="h-full bg-secondary rounded-md border border-border p-4 overflow-auto">
                    <h2 className="text-sm font-bold mb-2 text-muted-foreground">
                      Output
                    </h2>
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
