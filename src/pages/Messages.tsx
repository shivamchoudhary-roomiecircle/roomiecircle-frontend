import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ThreadList } from "@/components/chat/ThreadList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { InboxItem } from "@/types/chat";
import Navbar from "@/components/Navbar";

const Messages = () => {
    const [selectedThread, setSelectedThread] = useState<InboxItem | null>(null);
    const [refreshInboxTrigger, setRefreshInboxTrigger] = useState(0);
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.thread) {
            setSelectedThread(location.state.thread);
        }
    }, [location.state]);

    const handleMessagesRead = () => {
        // Increment trigger to reload sidebar (update unread counts)
        setRefreshInboxTrigger(prev => prev + 1);
    };

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <Navbar />

            <div className="container mx-auto max-w-6xl flex-1 flex flex-col md:flex-row overflow-hidden w-full">
                {/* Thread List Sidebar */}
                <div className={`
                    w-full md:w-1/3 border-r bg-background flex flex-col
                    ${selectedThread ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="p-4 border-b font-bold text-lg flex-none">Messages</div>
                    <ThreadList
                        selectedThreadId={selectedThread?.threadId || null}
                        onSelectThread={setSelectedThread}
                        refreshTrigger={refreshInboxTrigger}
                    />
                </div>

                {/* Chat Window Area */}
                <div className={`
                    flex-1 flex flex-col bg-muted/20 overflow-hidden
                    ${!selectedThread ? 'hidden md:flex' : 'flex'}
                `}>
                    {selectedThread ? (
                        <>
                            {/* Mobile Header to go back */}
                            <div className="md:hidden p-4 border-b bg-background flex items-center flex-none z-10">
                                <button
                                    onClick={() => setSelectedThread(null)}
                                    className="mr-3 text-sm font-medium text-blue-600"
                                >
                                    &larr; Back
                                </button>
                                <span className="font-semibold">Chat</span>
                            </div>
                            <ChatWindow
                                thread={selectedThread}
                                onMessagesRead={handleMessagesRead}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Welcome to Messages</h3>
                                <p>Select a conversation to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
