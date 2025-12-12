import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Message } from "@/types/chat";
import { useAuth } from "@/contexts/AuthContext";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
    return (
        <div className={cn("flex w-full mt-2 space-x-3 max-w-xs", isOwn ? "ml-auto justify-end" : "")}>
            <div>
                <div
                    className={cn(
                        "p-3 rounded-r-lg rounded-bl-lg",
                        isOwn
                            ? "bg-blue-600 text-white rounded-br-none rounded-l-lg"
                            : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
                    )}
                >
                    <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 leading-none block mt-1">
                    {format(new Date(message.createdAt), "h:mm a")}
                </span>
            </div>
        </div>
    );
};
