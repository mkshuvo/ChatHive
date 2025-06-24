"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useChatStore, Message } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatWindowProps {
  socket: Socket;
}

export function ChatWindow({ socket }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { messages, activeChat, setMessages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history when activeChat changes
  useEffect(() => {
    if (activeChat) {
      loadChatHistory();
      // Join the chat room
      socket.emit("join_chat", activeChat);
    }
  }, [activeChat, socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    if (!activeChat) return;
    
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/chat/messages/${activeChat}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const chatHistory = await response.json();
        setMessages(chatHistory);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat || loading) return;

    setLoading(true);
    
    try {
      // Send via socket for real-time delivery
      socket.emit("send_message", {
        receiverId: activeChat,
        content: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Filter messages for current chat
  const chatMessages = messages.filter(
    (msg) =>
      (msg.sender?.id === currentUserId && msg.receiver?.id === activeChat) ||
      (msg.sender?.id === activeChat && msg.receiver?.id === currentUserId)
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b bg-card">
        <h3 className="text-lg font-semibold">
          {/* Display username of active chat user */}
          Chat
        </h3>
      </div>
      
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
      >
        <div className="space-y-4">
          {chatMessages.map((message) => {
            const isOwnMessage = message.sender?.id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}