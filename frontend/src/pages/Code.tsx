import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import OutputPanel from "@/components/OutputPanel.js";
import CodeEditor from "@/components/CodeEditor.js";
import { Play, LogOut, Menu, X, ChevronRight } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector.js";
import { Button } from "@/components/ui/button.js";
import { toast } from "sonner";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable.js";

interface User {
  id: string; // socketId
  username: string;
  userId?: string;
  avatar?: string;
  isActive?: boolean;
  isGuest?: boolean;
  joinedAt: Date;
}

const Code = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { roomId } = useParams();
//   const userId = location.state?.userId;
//   const username = location.state?.username;
//   const isGuest = location.state?.isGuest;
//   const avatar = location.state?.avatar;

  const [code, setCode] = useState("// Start coding here...");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "X-RapidAPI-Key": import.meta.env.VITE_XRapidAPIKey,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    }),
    []
  );

  const handleRun = async () => {
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
    } catch (err) {
      console.error(err);

      const errorText = `Error executing code\n${err}`;
      setOutput(errorText);
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
  const handlePanelResize = (sizes: number[]) => {
    // Auto-collapse output panel when it gets too small (less than 15% of total height)
    const outputPanelSize = sizes[1];
    setOutputCollapsed(outputPanelSize < 15);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar - Sticky */}
      <header className="sticky top-0 z-50 h-16 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left section with room info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">
                <span className="text-code-blue">Code</span>
                <span className="text-foreground">Collab</span>
              </h1>
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
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">

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

export default Code;
