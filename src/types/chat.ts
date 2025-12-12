export interface Thread {
    id: number; // Changed from threadId match backend response if needed, but docs say "id" in ThreadResponse and "threadId" in InboxItemDto. Let's use InboxItemDto structure for list.
    // Actually, let's look at the docs again. 
    // 1.1 Create/Get Thread -> returns ThreadResponse { id, resourceType, resourceId, lastMessageAt }
    // 1.2 Get Inbox -> returns List<InboxItemDto> { threadId, resourceType, resourceId, lastMessagePreview, lastMessageAt, unreadCount }
    // Let's create a unified type or separate them.
}

export interface InboxItem {
    threadId: number;
    resourceType: string;
    resourceId: number;
    lastMessagePreview?: string;
    lastMessageAt?: string;
    unreadCount: number;
    // Helper for UI - maybe populated with other user details later?
    otherUser?: {
        id: number;
        name: string;
        avatar?: string;
    }
}

export interface Message {
    id: number;
    threadId: number;
    senderId: number;
    content: string;
    createdAt: string;
    // Add status for UI (sending, sent, error)
    status?: 'sending' | 'sent' | 'error';
}

export interface CreateThreadRequest {
    targetUserId: number;
    resourceType: string;
    resourceId: number;
}

export interface SendMessageRequest {
    threadId: number;
    content: string;
}

export interface ReadReceiptRequest {
    threadId: number;
    messageId: number;
}

// WebSocket Event Payload
export interface ChatEventPayload {
    eventType: 'MESSAGE' | 'READ_RECEIPT';
    destinationType?: 'THREAD' | 'USER'; // Optional in docs sample but good to have
    destinationId?: number;
    threadId: number;
    messageId?: number;
    senderId?: number;
    content?: string;
    lastReadMessageId?: number;
    createdAt: string;
    participantIds?: number[];
}
