"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useChatStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatWindowProps {
  socket: Socket;
}

export function ChatWindow({ socket }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const { messages, activeChat } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return;

    socket.emit("private-message", {
      receiverId: activeChat,
      content: newMessage,
    });

    setNewMessage("");
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.senderId === activeChat) ||
      (msg.receiverId === activeChat)
  );

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
      >
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === activeChat ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  message.senderId === activeChat
                    ? "bg-accent"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
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
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}