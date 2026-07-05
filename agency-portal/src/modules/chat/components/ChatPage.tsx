import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatRoom } from '../../../shared/types';
import { RootState } from '../../../store';

const formatTime = (isoString: string | null) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDate = (isoString: string | null) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return formatTime(isoString);
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const ChatPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Rooms on Mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const data = await chatService.getRooms();
        setRooms(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chat rooms');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();

    return () => {
      chatService.dispose();
    };
  }, []);

  // Fetch Messages & Join Socket Room when Active Room changes
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);
        const data = await chatService.getMessages(activeRoom.id);
        setMessages(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Join room websocket channel
    chatService.joinRoom(activeRoom.id, {
      onMessage: (message: ChatMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Update rooms list with latest message preview
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === message.roomId
              ? {
                  ...room,
                  latestMessagePreview: message.content,
                  latestMessageAt: message.createdAt,
                }
              : room
          )
        );
      },
      onError: (errMsg: string) => {
        setError(errMsg);
      },
    });

    return () => {
      chatService.leaveRoom(activeRoom.id);
    };
  }, [activeRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeRoom || !inputMessage.trim()) return;

    chatService.sendMessage(activeRoom.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.latestMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      {/* Rooms Sidebar List */}
      <div className="flex w-80 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel)]">
        {/* Search */}
        <div className="p-4">
          <h1 className="text-lg font-bold tracking-tight text-[var(--text)] mb-3">Chats</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-soft)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {loadingRooms ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)]">
              Loading conversations...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-[var(--text-soft)] p-4 text-center">
              No conversations found
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                    isActive
                      ? 'bg-[var(--panel-subtle)] border-l-4 border-[var(--primary)]'
                      : 'hover:bg-[var(--panel-subtle)]/50'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary)]">
                    {room.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate text-sm font-semibold text-[var(--text)]">
                        {room.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-[var(--text-soft)]">
                        {formatDate(room.latestMessageAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--text-soft)]">
                      {room.latestMessagePreview || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex flex-1 flex-col bg-[var(--panel-subtle)]/10">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-semibold text-[var(--primary)]">
                  {activeRoom.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)]">{activeRoom.title}</h2>
                  <p className="text-[10px] text-[var(--text-soft)]">
                    {activeRoom.participantCount || activeRoom.participants?.length || 2} participants
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 text-red-500 text-xs px-4 py-2 border-b border-red-500/20 text-center">
                {error}
              </div>
            )}

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center text-sm text-[var(--text-soft)]">
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm text-[var(--text-soft)]">No messages yet</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isSelf =
                    message.senderType === 'AGENCY' && message.senderId === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-[var(--text-soft)]">
                          {isSelf ? 'You' : message.senderName}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isSelf
                            ? 'bg-[var(--primary)] text-white rounded-tr-none'
                            : 'bg-[var(--panel)] text-[var(--text)] border border-[var(--border)] rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-[var(--border)] bg-[var(--panel)] p-4"
            >
              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[40px] resize-none rounded-xl border border-[var(--border)] bg-[var(--panel-subtle)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-soft)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55 transition-opacity"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4.5 w-4.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6">
            <div className="rounded-2xl bg-[var(--panel)] p-4 border border-[var(--border)]">
              <svg
                className="h-10 w-10 text-[var(--text-soft)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">No conversation selected</h3>
            <p className="mt-1 text-xs text-[var(--text-soft)]">
              Choose a conversation from the sidebar list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
