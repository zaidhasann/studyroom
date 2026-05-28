import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getSocket, disconnectSocket, socketEvents } from '../services/socket';
import { messageAPI } from '../services/api';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Initialize socket
  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    return () => {
      // Don't disconnect on unmount, keep connection active
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (data) => {
      setRoomUsers((prev) => {
        if (!prev.find((u) => u.userId === data.userId)) {
          return [...prev, { userId: data.userId, userName: data.userName }];
        }
        return prev;
      });
    };

    const handleUserLeft = (data) => {
      setRoomUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    const handleNewMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on(socketEvents.USER_JOINED, handleUserJoined);
    socket.on(socketEvents.USER_LEFT, handleUserLeft);
    socket.on(socketEvents.NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(socketEvents.USER_JOINED, handleUserJoined);
      socket.off(socketEvents.USER_LEFT, handleUserLeft);
      socket.off(socketEvents.NEW_MESSAGE, handleNewMessage);
    };
  }, [socket]);

  const joinRoom = useCallback(
    async (roomId) => {
      if (socket && isConnected) {
        socket.emit(socketEvents.JOIN_ROOM, roomId);
        setCurrentRoom(roomId);
        setRoomUsers([]);
        setMessages([]);
        
        // Fetch previous messages from database
        try {
          setLoadingMessages(true);
          const response = await messageAPI.getMessages(roomId, 100);
          if (response.data.messages) {
            setMessages(response.data.messages);
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      }
    },
    [socket, isConnected]
  );

  const leaveRoom = useCallback(
    (roomId) => {
      if (socket && isConnected) {
        socket.emit(socketEvents.LEAVE_ROOM, roomId);
        setCurrentRoom(null);
        setRoomUsers([]);
      }
    },
    [socket, isConnected]
  );

  const sendMessage = useCallback(
    (message) => {
      if (socket && isConnected && currentRoom) {
        socket.emit(socketEvents.SEND_MESSAGE, {
          roomId: currentRoom,
          message,
        });
      }
    },
    [socket, isConnected, currentRoom]
  );

  const emitSessionEvent = useCallback(
    (eventName, data) => {
      if (socket && isConnected) {
        socket.emit(eventName, data);
      }
    },
    [socket, isConnected]
  );

  const onSessionEvent = useCallback(
    (eventName, handler) => {
      if (socket) {
        socket.on(eventName, handler);
      }
    },
    [socket]
  );

  const offSessionEvent = useCallback(
    (eventName, handler) => {
      if (socket) {
        socket.off(eventName, handler);
      }
    },
    [socket]
  );

  const value = {
    socket,
    isConnected,
    currentRoom,
    roomUsers,
    messages,
    loadingMessages,
    joinRoom,
    leaveRoom,
    sendMessage,
    emitSessionEvent,
    onSessionEvent,
    offSessionEvent,
    setMessages,
    setRoomUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
