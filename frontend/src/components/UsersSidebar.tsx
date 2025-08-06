import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.js';
import { Button } from '@/components/ui/button.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string; // socketId
  username: string;
  userId?: string;
  avatar?: string;
  isActive?: boolean;
  isGuest?: boolean;
  joinedAt: Date;
}

interface UsersSidebarProps {
  currentUserId: String;
  users: User[];
  collapsed: boolean;
  minimized: boolean;
  onToggle: () => void;
}

const UsersSidebar: React.FC<UsersSidebarProps> = ({ 
  currentUserId, 
  users, 
  collapsed, 
  minimized, 
  onToggle 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-code-blue text-primary-foreground',
      'bg-code-purple text-primary-foreground',
      'bg-code-green text-primary-foreground',
      'bg-code-yellow text-primary-foreground',
      'bg-code-red text-primary-foreground',
    ];
    
    const hash = username.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  if (collapsed) {
    return (
      <div className="fixed top-16 left-0 z-40 lg:relative lg:top-0 lg:w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="m-2 bg-card border border-border shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const sidebarWidth = minimized ? 'w-16' : 'w-64';

  return (
    <aside className={`${sidebarWidth} bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!minimized && (
          <h2 className="text-sm font-semibold text-muted-foreground">Room Members</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="ml-auto"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Users list */}
      <div className="flex-1 p-2 space-y-2">
        {users.map(user => (
          <div 
            key={user.id}
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors ${
              minimized ? 'justify-center' : ''
            }`}
            title={minimized ? user.username : undefined}
          >
            <div className="relative flex-shrink-0">
              <Avatar className={`h-8 w-8 ${getAvatarColor(user.username)}`}>
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.username} />
                ):(
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(user.username)}
                </AvatarFallback>)}
              </Avatar>
              {/* Status indicator */}
              <span 
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                  user.isActive ? 'bg-code-green' : 'bg-muted-foreground'
                }`}
              />
            </div>
            
            {!minimized && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  user.userId === currentUserId ? 'text-primary' : 'text-foreground'
                }`}>
                  {user.username}
                  {user.userId === currentUserId && ' (You)'}
                </p>
                <p className={`text-xs ${
                  user.isActive ? 'text-code-green' : 'text-muted-foreground'
                }`}>
                  {user.isActive ? 'Active' : 'Away'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default UsersSidebar;