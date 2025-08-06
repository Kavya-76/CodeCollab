import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.js";
import { Textarea } from "@/components/ui/textarea.js";
import { ScrollArea } from "@/components/ui/scroll-area.js";

interface OutputPanelProps {
  output: string;
  input: string;
  onInputChange: (value: string) => void;
  isCollapsed: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  output,
  input,
  onInputChange,
  isCollapsed,
}) => {
  return (
    <div className="w-full h-full bg-card border-t border-border flex flex-col">
      <Tabs defaultValue="output" className="h-full flex flex-col w-full">
        <div className="flex-shrink-0 border-b border-border w-full">
          <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="input"
              className="rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Input
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Output
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-hidden w-full flex flex-col">
          <TabsContent value="input" className="h-full m-0 p-4 w-full flex flex-col">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Standard Input (stdin)
            </label>

            <Textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter input for your program..."
              className="flex-grow resize-none font-mono text-sm w-full min-h-0"
            />
          </TabsContent>

          <TabsContent value="output" className="h-full m-0 p-4 w-full flex flex-col">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Program Output
            </label>

            <ScrollArea className="flex-grow rounded-md border bg-secondary/50 w-full min-h-0">
              <div className="p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap text-foreground break-words">
                  {output || "No output yet. Run your code to see results here."}
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default OutputPanel;
