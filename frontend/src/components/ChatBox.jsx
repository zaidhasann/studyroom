import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { socketEvents } from '../services/socket';
import { formatDatetime } from '../utils/formatters';

const ChatBox = ({ roomId }) => {
  const { messages, loadingMessages, sendMessage, onSessionEvent } = useSocket();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleUserTyping = (data) => {
      setTypingUsers((prev) => new Set([...prev, data.userName]));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userName);
          return newSet;
        });
      }, 2000);
    };

    onSessionEvent(socketEvents.USER_TYPING, handleUserTyping);

    return () => {
      // Cleanup if needed
    };
  }, [onSessionEvent]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend();
      e.preventDefault();
    }
  };

  const isOwnMessage = (senderName) => senderName === user?.name;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages && (
          <div className="text-center text-gray-400 py-8">
            Loading messages...
          </div>
        )}
        {!loadingMessages && messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No messages yet. Start chatting!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = isOwnMessage(msg.senderName);
            const msgTimestamp = msg.timestamp || msg.createdAt;
            return (
              <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs`}>
                  {!isOwn && (
                    <div className="text-xs text-gray-600 font-semibold mb-1 px-2">
                      {msg.senderName}
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 text-sm break-words ${
                      isOwn
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatDatetime(msgTimestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.size > 0 && (
          <div className="text-xs text-gray-400 italic px-2">
            {Array.from(typingUsers).join(', ')} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={2}
            className="input-field flex-1 resize-none"
          />
          <button
            onClick={handleSend}
            className="btn-primary self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
