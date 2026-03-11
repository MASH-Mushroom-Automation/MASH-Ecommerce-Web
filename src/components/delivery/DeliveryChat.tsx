/**
 * Delivery Chat Component
 * Real-time messaging via Firestore onSnapshot
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Phone, AlertCircle, Loader2 } from 'lucide-react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase/config';

const db = getFirestore(firebaseApp);

interface ChatMessage {
  id: string;
  sender: 'customer' | 'driver' | 'system';
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface DeliveryChatProps {
  orderId: string;
  driverPhone?: string;
  driverName?: string;
  customerName?: string;
}

export default function DeliveryChat({
  orderId,
  driverPhone,
  driverName = 'Driver',
  customerName = 'You',
}: DeliveryChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "I'm here at the lobby",
    "Running 5 minutes late",
    "Please call me when you arrive",
    "Thank you!",
  ];

  // Real-time Firestore subscription for chat messages
  useEffect(() => {
    if (!orderId) return;

    const messagesRef = collection(db, 'orders', orderId, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            sender: data.sender,
            message: data.message,
            timestamp:
              data.timestamp instanceof Timestamp
                ? data.timestamp.toDate().toISOString()
                : data.timestamp || new Date().toISOString(),
            status: data.status || 'sent',
          };
        });
        setMessages(msgs);
      },
      (err) => {
        console.error('[Chat] Firestore subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/lalamove/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          message: message.trim(),
          driverPhone: driverPhone || '',
          customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Message will appear via onSnapshot — no manual state push needed
      setNewMessage('');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send message';
      console.error('[Chat] Error:', err);
      setError(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    sendMessage(newMessage);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // If no driver phone, show call-only message
  if (!driverPhone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Driver Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Chat will be available once a driver is assigned
            </p>
            <p className="text-sm text-muted-foreground">
              You'll be able to message the driver directly
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with {driverName}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={`tel:${driverPhone}`}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Messages sent via SMS • Standard rates may apply
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'customer' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender === 'customer'
                      ? 'bg-primary text-primary-foreground'
                      : msg.sender === 'system'
                      ? 'bg-muted text-muted-foreground text-center w-full'
                      : 'bg-muted'
                  }`}
                >
                  {msg.sender !== 'system' && (
                    <div className="text-xs opacity-70 mb-1">
                      {msg.sender === 'customer' ? customerName : driverName}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs opacity-70">
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.sender === 'customer' && (
                      <Badge
                        variant="outline"
                        className="text-xs py-0 px-1 h-4"
                      >
                        {msg.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No messages yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Send a message to your driver
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Replies */}
        <div className="border-t p-2">
          <div className="flex gap-2 flex-wrap">
            {quickReplies.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                disabled={isSending}
                className="text-xs"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border-t bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message (max 160 characters)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 160))}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isSending}
              maxLength={160}
            />
            <Button
              onClick={handleSend}
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {newMessage.length}/160 characters •{' '}
            {newMessage.length > 160 ? 'Multiple SMS will be sent' : 'Single SMS'}
          </p>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 p-3 text-xs text-blue-600 border-t">
          ℹ Messages are sent via Firestore. In sandbox mode, an auto-reply
          arrives after 3 seconds.
        </div>
      </CardContent>
    </Card>
  );
}
