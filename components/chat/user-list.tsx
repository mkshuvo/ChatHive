"use client";

import { User } from "@/server/types/chat";
import { useChatStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  const { setActiveChat, activeChat } = useChatStore();

  return (
    <div className="w-80 border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setActiveChat(user.id)}
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
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}