"use client";

import { useEffect, useState } from "react";
import { UserList } from "./user-list";
import { ChatWindow } from "./chat-window";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "@/lib/store";
import { User } from "@/server/types/chat";

let socket: Socket;

export function ChatLayout() {
  const [users, setUsers] = useState<User[]>([]);
  const { addMessage, activeChat } = useChatStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    socket = io("http://localhost:4000", {
      auth: { token },
    });

    socket.on("new-message", (message) => {
      addMessage(message);
    });

    // Fetch users
    fetch("http://localhost:4000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data));

    return () => {
      socket.disconnect();
    };
  }, [addMessage]);

  return (
    <div className="flex h-screen bg-background">
      <UserList users={users} />
      {activeChat && <ChatWindow socket={socket} />}
    </div>
  );
}