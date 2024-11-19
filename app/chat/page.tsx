"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatLayout } from "@/components/chat/chat-layout";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return <ChatLayout />;
}