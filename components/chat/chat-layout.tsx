"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserList } from "./user-list";
import { ChatWindow } from "./chat-window";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "@/lib/store";
import { User } from "@/types/chat";
import { Button } from "@/components/ui/button";

let socket: Socket;

export function ChatLayout() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { addMessage, activeChat } = useChatStore();
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // Get current user info
    fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        if (!res.ok) throw new Error("Failed to get user info");
        return res.json();
      })
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/");
      });

    // Initialize socket connection
    socket = io(apiUrl, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("new_message", (message) => {
      addMessage(message);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Real-time online status tracking
    socket.on("user_online", (userId: string) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("user_offline", (userId: string) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
    });

    // Fetch users (exclude current user)
    fetch(`${apiUrl}/api/chat/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(console.error);

    return () => {
      socket.disconnect();
    };
  }, [addMessage, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (socket) socket.disconnect();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Chats</h2>
            {currentUser && (
              <p className="text-sm text-muted-foreground">
                Logged in as: {currentUser.username}
              </p>
            )}
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
        <UserList users={users} />
      </div>

      {activeChat ? (
        <ChatWindow socket={socket} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
}