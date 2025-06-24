"use client";

import { useChatStore, User } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  const { setActiveChat, activeChat, clearMessages } = useChatStore();

  const handleUserSelect = (userId: string) => {
    clearMessages(); // Clear previous chat messages
    setActiveChat(userId);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            className={`w-full flex items-center space-x-4 p-3 rounded-lg transition-colors ${
              activeChat === user.id
                ? "bg-accent"
                : "hover:bg-accent/50"
            }`}
          >
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </button>
        ))}
        
        {users.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No users available to chat with
          </div>
        )}
      </div>
    </ScrollArea>
  );
}