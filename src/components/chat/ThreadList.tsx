import { useEffect, useState } from "react";
import { chatApi } from "@/lib/api/chat";
import { InboxItem } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ThreadListProps {
    selectedThreadId: number | null;
    onSelectThread: (thread: InboxItem) => void;
    refreshTrigger?: number;
}

export const ThreadList = ({ selectedThreadId, onSelectThread, refreshTrigger = 0 }: ThreadListProps) => {
    const [threads, setThreads] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadThreads();
    }, [refreshTrigger]);

    const loadThreads = async () => {
        setLoading(true);
        try {
            const data = await chatApi.getInbox();
            if (data && Array.isArray(data)) {
                setThreads(data);
            }
        } catch (error) {
            console.error("Failed to load threads", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading conversations...</div>;
    }

    if (threads.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto min-h-0">
            {threads.map((thread) => (
                <div
                    key={thread.threadId}
                    onClick={() => onSelectThread(thread)}
                    className={cn(
                        "flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b",
                        selectedThreadId === thread.threadId ? "bg-muted" : ""
                    )}
                >
                    <Avatar className="h-10 w-10 mr-3">
                        {/* Placeholder for now, later we can fetch other user details */}
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-semibold text-sm truncate">
                                {/* Use resource type/id or user name if available */}
                                {thread.resourceType === 'ROOM_LISTING' ? 'Room Inquiry' : 'Chat'}
                            </h4>
                            {thread.lastMessageAt && (
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                                </span>
                            )}
                        </div>
                        <p className={cn("text-sm truncate", thread.unreadCount > 0 ? "font-bold text-foreground" : "text-muted-foreground")}>
                            {thread.lastMessagePreview || "No messages yet"}
                        </p>
                    </div>
                    {thread.unreadCount > 0 && (
                        <div className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {thread.unreadCount}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
