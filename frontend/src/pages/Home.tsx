import React from 'react';
import {toast} from "sonner"
import JoinSessionForm from '@/components/JoinSessionForm.js';
import CodeSnippet from '@/components/CodeSnippet.js';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleJoinSession = (roomId: string, username: string, isNewRoom: boolean) => {
    // This is where you would handle the logic to join/create a room
    // For now, we'll just show a toast notification
    if (isNewRoom) {
      toast.success(`Created new room ${roomId}. Welcome, ${username}!`);
    } else {
      toast.success(`Joining room ${roomId}. Welcome, ${username}!`);
    }
    
    console.log({ roomId, username, isNewRoom });
    // Future implementation: Navigate to the actual coding room
    navigate(`/room/${roomId}`, {
      state: {
        username,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-code-blue">Code</span>
            <span className="text-white">Collab</span>
          </h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center justify-items-center">
          <div className="flex flex-col space-y-6 max-w-md">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Code Together.
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-code-blue to-code-purple">
                  In Real-Time.
                </span>
              </h2>
              <p className="text-muted-foreground mb-2">
                Collaborate with your team on code projects with real-time synchronization. 
                Create a room or join an existing one to start coding together instantly.
              </p>
            </div>
            <div className="w-full">
              <JoinSessionForm onSubmit={handleJoinSession} />
            </div>
          </div>
          
          <div className="w-full flex justify-center items-center order-first md:order-last">
            <div className="animate-pulse-blue rounded-lg p-1">
              <CodeSnippet />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
        <p>CodeCollab &copy; {new Date().getFullYear()} - Write better code together.</p>
      </footer>
    </div>
  );
}

export default Home
