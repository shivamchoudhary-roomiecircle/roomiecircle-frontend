import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import { ChatEventPayload } from '@/types/chat';

interface ChatContextType {
    client: Client | null;
    isConnected: boolean;
    sendMessage: (destination: string, body: object) => void;
    subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    // Initialize STOMP client
    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setClient(null);
                setIsConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${API_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                if (import.meta.env.DEV) {
                    console.log('[STOMP]', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                // Subscribe to global user notifications
                stompClient.subscribe('/user/queue/messages', (message) => {
                    try {
                        const payload: ChatEventPayload = JSON.parse(message.body);
                        // Dispatch a global event or handle it via a global store/toast
                        // For now, we'll dispatch a custom event that components can listen to
                        window.dispatchEvent(new CustomEvent('chat:global-message', { detail: payload }));
                    } catch (e) {
                        console.error('Error parsing global message:', e);
                    }
                });
            },
            onDisconnect: () => {
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;
        setClient(stompClient);

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [isAuthenticated, user]);

    const sendMessage = useCallback((destination: string, body: object) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
        }
    }, []);

    const subscribe = useCallback((destination: string, callback: (message: IMessage) => void) => {
        if (clientRef.current && clientRef.current.connected) {
            return clientRef.current.subscribe(destination, callback);
        }
        return null;
    }, []);

    return (
        <ChatContext.Provider value={{ client, isConnected, sendMessage, subscribe }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
