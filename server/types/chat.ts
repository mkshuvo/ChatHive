export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  mediaUrl?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}