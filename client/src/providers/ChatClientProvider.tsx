import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { ChatClientContext } from "../contexts/ChatClientContext";
import type { ChatMessage, ConnectionStatus } from "../contexts/ChatClientContext";
import { messagesReducer, initialMessagesState } from "../reducers/messagesReducer";
import type { MessagesAction } from "../reducers/messagesReducer";
import { ChatSettingsContext } from "../contexts/ChatSettingsContext";
import { DEFAULT_ROOM_ID } from "../lib/constants";

interface ChatClientProviderProps {
  children: ReactNode;
}

export const ChatClientProvider: React.FC<ChatClientProviderProps> = ({ children }) => {
  const settingsContext = useContext(ChatSettingsContext);
  if (!settingsContext) throw new Error("ChatClientProvider must be used within ChatSettingsProvider");

  const { roomId, rooms, userId, setUserId } = settingsContext;

  const [client, setClient] = useState<Socket | null>(null);
  const clientRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: "disconnected",
    message: "Not connected",
  });
  const [messages, dispatch] = useState(initialMessagesState);

  const roomStatesRef = useRef<Map<string, { messages: ChatMessage[] }>>(new Map());
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);

  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  const updateRoomMessages = useCallback((targetRoomId: string | undefined, action: MessagesAction) => {
    const key = targetRoomId || roomIdRef.current || DEFAULT_ROOM_ID;
    const rs = roomStatesRef.current.get(key) || { messages: [] };
    const next = messagesReducer(rs.messages, action);
    roomStatesRef.current.set(key, { messages: next });
    if (key === (roomIdRef.current || DEFAULT_ROOM_ID)) {
      dispatch(next);
    }
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!client || !messageText.trim()) return;
    const msgId = Date.now().toString();
    updateRoomMessages(roomIdRef.current, {
      type: "userMessage",
      payload: { id: msgId, content: messageText, userId: userIdRef.current ?? "" },
    });
    try {
      client.emit("message", {
        text: messageText,
        roomId: roomIdRef.current || DEFAULT_ROOM_ID,
        userId: userIdRef.current ?? "",
        ts: new Date().toISOString(),
      });
    } catch (err) {
      console.error("socket emit failed", err);
    }
  }, [client, updateRoomMessages]);

  const clearMessages = useCallback(() => {
    const key = roomIdRef.current || DEFAULT_ROOM_ID;
    roomStatesRef.current.set(key, { messages: [] });
    dispatch([]);
  }, []);

  // init socket
  useEffect(() => {
    const connectSocket = async () => {
      try {
        setConnectionStatus({ status: "connecting", message: "Connecting..." });
        const socket = io("http://localhost:4000", {
          path: "/socket.io",
          transports: ["websocket"],
          query: { roomId: roomIdRef.current || DEFAULT_ROOM_ID },
        });
        clientRef.current = socket;
        setClient(socket);

        socket.on("connect", () => {
          setConnectionStatus({ status: "connected", message: "Connected", connectionId: socket.id });
        });
        socket.on("disconnect", () => {
          setConnectionStatus({ status: "disconnected", message: "Disconnected" });
        });
        socket.on("connect_error", (err) => {
          setConnectionStatus({ status: "error", message: err.message });
        });
        socket.on("message", (payload: any) => {
          if (!payload?.text) return;
          updateRoomMessages(payload.roomId, {
            type: "addMessage",
            payload: {
              id: payload.id || Date.now().toString(),
              content: payload.text,
              sender: payload.userId || "anon",
              timestamp: payload.ts || new Date().toISOString(),
              isFromCurrentUser: payload.userId === userIdRef.current,
            },
          });
        });
        socket.on("typing", (payload: any) => {
          // optional typing indicator hook
          console.log("typing", payload);
        });
      } catch (err) {
        setConnectionStatus({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
      }
    };
    connectSocket();
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [updateRoomMessages]);

  // When room changes, swap cached messages
  useEffect(() => {
    const key = roomId || DEFAULT_ROOM_ID;
    const rs = roomStatesRef.current.get(key);
    dispatch(rs ? rs.messages : []);
    if (clientRef.current) {
      clientRef.current.emit("join", { roomId: key, userId: userIdRef.current ?? "" });
    }
  }, [roomId]);

  const isStreaming = useMemo(() => false, []);

  const value = useMemo(
    () => ({ client, connectionStatus, messages, isStreaming, sendMessage, clearMessages, uiNotice: undefined }),
    [client, connectionStatus, messages, isStreaming, sendMessage, clearMessages],
  );

  return <ChatClientContext.Provider value={value}>{children}</ChatClientContext.Provider>;
};
