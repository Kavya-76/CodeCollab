import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '@/components/CodeEditor.js';
import UsersList from '@/components/UserList.js';
import LanguageSelector from '@/components/LanguageSelector.js';
import { Button } from '@/components/ui/button.js';
import { Play, Languages, Code } from 'lucide-react';
import { toast } from 'sonner';

const Room = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [languageId, setLanguageId] = useState(0);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // This would be replaced with actual user data from your backend
  const [users, setUsers] = useState([
    { id: '1', username: 'You', isActive: true },
    { id: '2', username: 'Alex', isActive: true },
    { id: '3', username: 'Sam', isActive: false },
  ]);

  const handleRun = async () => {
    setIsExecuting(true);
    setOutput('');
  
    const encodedCode = btoa(code);
  
    const headers = {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': 'dbbc7c1697msh3edb93c2e96c5e7p1dffcejsn7ad0bfb10103', // use same key for both
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    };
  
    try {
      const submissionRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          source_code: encodedCode,
          language_id: languageId,
          stdin: btoa(''), // or pass actual input
        }),
      });
  
      const { token } = await submissionRes.json();
  
      let result = null;
  
      while (true) {
        const res = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`, {
          method: 'GET',
          headers, // use same headers here
        });
  
        result = await res.json();
  
        if (result.status?.id <= 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
  
      const outputText =
        atob(result.stdout || '') ||
        atob(result.compile_output || '') ||
        atob(result.stderr || '') ||
        'No output';
  
      setOutput(outputText);
    } catch (err) {
      console.error(err);
      setOutput('Error executing code.');
    } finally {
      setIsExecuting(false);
    }
  };
  
  

  const handleLanguageChange = (newLanguage: string, newLanguageId: number) => {
    setLanguage(newLanguage);
    setLanguageId(newLanguageId)
    toast(`Language changed to ${newLanguage}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto py-4 px-4 border-b border-border">
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
              <Play className="mr-1" />
              {isExecuting ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-secondary rounded-md border border-border h-[calc(100vh-12rem)]">
            <CodeEditor 
              language={language} 
              value={code} 
              onChange={setCode} 
            />
          </div>
          <div className="bg-secondary rounded-md border border-border p-4 h-40 overflow-auto">
            <h2 className="text-sm font-bold mb-2 text-muted-foreground">Output</h2>
            <pre className="text-sm font-mono">
              {output || 'Run your code to see output here...'}
            </pre>
          </div>
        </div>
        <div className="lg:col-span-1">
          <UsersList users={users} />
        </div>
      </main>
    </div>
  );
};

export default Room;