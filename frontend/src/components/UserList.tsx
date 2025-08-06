import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.js';

interface User {
  id: string;
  username: string;
  isActive: boolean;
}

interface UsersListProps {
  users: User[];
  sidebarState: 'hidden' | 'collapsed' | 'expanded';
}

const UsersList: React.FC<UsersListProps> = ({ users, sidebarState }) => {
  // Function to get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Function to generate a consistent color based on username
  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-code-blue text-primary-foreground',
      'bg-code-purple text-primary-foreground',
      'bg-code-green text-primary-foreground',
      'bg-code-yellow text-primary-foreground',
      'bg-code-red text-primary-foreground',
    ];
    
    // Simple hash function to pick a color
    const hash = username.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  if (sidebarState === 'hidden') {
    return null;
  }

  const isCollapsed = sidebarState === 'collapsed';

  return (
    <div className={`h-full ${isCollapsed ? 'px-1 py-2' : 'p-4'}`}>
      {!isCollapsed && (
        <h2 className="text-sm font-bold mb-4 text-muted-foreground">Room Members</h2>
      )}
      <div className="space-y-2">
        {users.map(user => (
          <div 
            key={user.id}
            className={`flex items-center ${
              isCollapsed 
                ? 'justify-center p-1' 
                : 'gap-3 p-2'
            } rounded-md hover:bg-accent/50 transition-colors`}
            title={isCollapsed ? user.username : undefined}
          >
            <div className="relative">
              <Avatar className={`h-8 w-8 ${getAvatarColor(user.username)}`}>
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              {user.isActive && (
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
              )}
            </div>
            {!isCollapsed && (
              <span className={`text-sm ${!user.isActive ? 'text-muted-foreground' : ''}`}>
                {user.username} {user.isActive ? '' : '(away)'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;