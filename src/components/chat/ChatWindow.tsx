import { useEffect, useRef, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { chatApi } from "@/lib/api/chat";
import { InboxItem, Message, ChatEventPayload } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatWindowProps {
    thread: InboxItem;
    onMessagesRead?: () => void;
}

export const ChatWindow = ({ thread, onMessagesRead }: ChatWindowProps) => {
    const { user } = useAuth();
    const { sendMessage, subscribe, isConnected } = useChat();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            setLoading(true);
            try {
                const data = await chatApi.getMessages(thread.threadId);
                // The API returns paginated data (last page first usually for chat? need to verify sort order)
                // Assuming standard "recent last" or we need to reverse.
                // Docs say "Get History". Usually standard Pageable returns page 0.
                // Let's assume content is chronological or reverse chronological. 
                // We'll append for now.
                // Ideally backend returns newest first for page 0? or oldest first? 
                // Let's assume standard sorting (usually oldest first for chat history unless inverted)
                // If it's standard Spring Data REST, it's configurable.
                // We will assume array order is correct to display top-to-bottom.
                if (data && data.content) {
                    // Start: FIX Issue-1: Message Append Order
                    // Ensure messages are sorted by creation time (oldest first) so they appear top-to-bottom
                    const sorted = [...data.content].sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                    setMessages(sorted);

                    // Mark last message as read if it's from others
                    if (sorted.length > 0) {
                        const lastMsg = sorted[sorted.length - 1];
                        if (user && lastMsg.senderId !== Number(user.id)) {
                            markAsRead(lastMsg.id);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load messages", error);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [thread.threadId]);

    const markAsRead = async (messageId: number) => {
        if (!user) return;
        try {
            // We can use REST or WS. Using REST as per plan, but WS is also fine.
            // Plan said: "Call chatApi.markRead when new messages arrive or thread opens."
            await chatApi.markRead({
                threadId: thread.threadId,
                messageId: messageId
            });
            if (onMessagesRead) onMessagesRead();
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    // Subscribe to WebSocket updates
    useEffect(() => {
        if (!thread.threadId || !isConnected) return;

        console.log(`Subscribing to /topic/thread.${thread.threadId}`);
        const subscription = subscribe(`/topic/thread.${thread.threadId}`, (message) => {
            try {
                const payload: ChatEventPayload = JSON.parse(message.body);
                if (payload.eventType === 'MESSAGE') {
                    // Check if message is already in list (optimistic UI)
                    // If we have a temp ID or checking by content/timestamp, handle dedup.
                    // For now, simpler append.
                    setMessages((prev) => {
                        const newMessage: Message = {
                            id: payload.messageId!,
                            threadId: payload.threadId,
                            senderId: payload.senderId!,
                            content: payload.content!,
                            createdAt: payload.createdAt
                        };

                        // Avoid duplicates
                        if (prev.some(m => m.id === newMessage.id)) return prev;

                        const newMessages = [...prev, newMessage];
                        return newMessages.sort((a, b) =>
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        );
                    });

                    // If message is from other user, mark it as read immediately if we are viewing this thread
                    if (user && payload.senderId !== Number(user.id)) {
                        if (payload.messageId) markAsRead(payload.messageId);
                    }

                    scrollToBottom();
                }
            } catch (e) {
                console.error("Error parsing message", e);
            }
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [thread.threadId, isConnected, subscribe]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || !user) return;

        const content = inputValue.trim();
        const tempId = Date.now();

        // Optimistic update
        // const tempMessage: Message = {
        //     id: tempId,
        //     threadId: thread.threadId,
        //     senderId: user.id,
        //     content: content,
        //     createdAt: new Date().toISOString(),
        //     status: 'sending'
        // };
        // setMessages(prev => [...prev, tempMessage]);

        setInputValue("");

        // Publish to WS
        sendMessage('/app/chat.send', {
            threadId: thread.threadId,
            content: content
        });
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
                {loading && <div className="text-center text-sm text-gray-500">Loading messages...</div>}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id || msg.createdAt}
                        message={msg}
                        // Start: FIX Issue-2: Message Styling
                        // Ensure strict comparison by casting to Number. 
                        // msg.senderId comes from API/WS (number), user.id might be string or number.
                        isOwn={Number(msg.senderId) === Number(user?.id)}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background flex-none">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};
