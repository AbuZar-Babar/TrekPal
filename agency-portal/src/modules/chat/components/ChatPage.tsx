import { FormEvent, useEffect, useMemo, useState } from 'react';

import { formatDate } from '../../../shared/utils/formatters';
import { ChatMessage, ChatRoom } from '../../../shared/types';
import { chatService } from '../services/chatService';

const ChatPage = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedRooms = useMemo(
    () =>
      [...rooms].sort((left, right) => {
        const rightTime = right.latestMessageAt ? new Date(right.latestMessageAt).getTime() : 0;
        const leftTime = left.latestMessageAt ? new Date(left.latestMessageAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [rooms],
  );

  useEffect(() => {
    void loadRooms();

    return () => {
      if (selectedRoom) {
        chatService.leaveRoom(selectedRoom.id);
      }
      chatService.dispose();
    };
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextRooms = await chatService.getRooms();
      setRooms(nextRooms);

      if (nextRooms.length > 0) {
        await openRoom(nextRooms[0].id);
      } else {
        setSelectedRoom(null);
        setMessages([]);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const openRoom = async (roomId: string) => {
    setRoomLoading(true);
    setError(null);

    try {
      if (selectedRoom && selectedRoom.id !== roomId) {
        chatService.leaveRoom(selectedRoom.id);
      }

      const [room, roomMessages] = await Promise.all([
        chatService.getRoom(roomId),
        chatService.getMessages(roomId),
      ]);

      setSelectedRoom(room);
      setMessages(roomMessages);
      setRooms((currentRooms) =>
        currentRooms.map((item) => (item.id === room.id ? room : item)),
      );

      chatService.joinRoom(room.id, {
        onMessage: (message) => {
          setMessages((currentMessages) => {
            const existingIndex = currentMessages.findIndex((item) => item.id === message.id);
            if (existingIndex === -1) {
              return [...currentMessages, message];
            }

            const nextMessages = [...currentMessages];
            nextMessages[existingIndex] = message;
            return nextMessages;
          });

          setRooms((currentRooms) =>
            currentRooms.map((item) =>
              item.id === room.id
                ? {
                    ...item,
                    latestMessagePreview: message.content,
                    latestMessageAt: message.createdAt,
                  }
                : item,
            ),
          );
        },
        onError: (message) => {
          setError(message);
        },
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to open chat');
    } finally {
      setRoomLoading(false);
    }
  };

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRoom || !composer.trim()) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      chatService.sendMessage(selectedRoom.id, composer.trim());
      setComposer('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="page-hero">
        <div className="space-y-3">
          <span className="app-pill app-pill-neutral">Offer chat</span>
          <h1 className="page-title">Simple communication around confirmed work</h1>
          <p className="page-copy max-w-3xl">
            Keep traveler conversations attached to active offers so questions, confirmations, and
            operational updates stay in one place.
          </p>
        </div>
        <div className="page-stats-grid">
          <article className="stat-card">
            <span>Active rooms</span>
            <strong>{rooms.length}</strong>
            <p>Conversations currently available to the agency</p>
          </article>
          <article className="stat-card">
            <span>Selected room</span>
            <strong>{selectedRoom?.participantCount || 0}</strong>
            <p>Travelers in the currently open conversation</p>
          </article>
          <article className="stat-card">
            <span>Messages loaded</span>
            <strong>{messages.length}</strong>
            <p>Visible thread history in the active room</p>
          </article>
          <article className="stat-card">
            <span>Status</span>
            <strong>{roomLoading ? 'Syncing' : 'Live'}</strong>
            <p>Room updates are streamed in real time</p>
          </article>
        </div>
      </section>

      {error && (
        <div className="rounded-[22px] border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
        <section className="surface overflow-hidden">
          <div className="surface-header">
            <div>
              <h2>Conversations</h2>
              <p>Recent offer rooms, ordered by latest message.</p>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
              <p className="mt-4 text-sm text-[var(--text-muted)]">Loading chats...</p>
            </div>
          ) : sortedRooms.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="text-lg font-semibold tracking-tight text-[var(--text)]">No chats yet</div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Offer chat opens after you confirm at least one traveler request for an offer.
              </p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-3">
              {sortedRooms.map((room) => {
                const isActive = room.id === selectedRoom?.id;

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => void openRoom(room.id)}
                    className={`mb-2 w-full rounded-[20px] border px-4 py-4 text-left transition ${
                      isActive
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                        : 'border-transparent bg-[var(--panel-subtle)] hover:border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--text)]">
                          {room.title}
                        </div>
                        <div className="mt-1 text-xs text-[var(--text-soft)]">
                          {room.participantCount} traveler{room.participantCount === 1 ? '' : 's'}
                        </div>
                        <div className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">
                          {room.latestMessagePreview || 'Start the conversation'}
                        </div>
                      </div>
                      <span className="app-pill app-pill-neutral shrink-0">{room.agencyName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="surface flex min-h-[70vh] flex-col overflow-hidden">
          {selectedRoom ? (
            <>
              <div className="surface-header">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <h2>{selectedRoom.title}</h2>
                    <p>
                      {selectedRoom.participantCount} traveler
                      {selectedRoom.participantCount === 1 ? '' : 's'} in this offer
                    </p>
                  </div>
                  <span className="app-pill app-pill-success">{selectedRoom.agencyName}</span>
                </div>
              </div>

              {roomLoading ? (
                <div className="flex flex-1 items-center justify-center px-6">
                  <div className="text-sm text-[var(--text-muted)]">Opening chat...</div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-6">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
                            Start the conversation
                          </div>
                          <p className="mt-2 text-sm text-[var(--text-muted)]">
                            Ask travelers questions or confirm trip details here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isAgency = message.senderType === 'AGENCY';

                        return (
                          <div
                            key={message.id}
                            className={`max-w-full rounded-[22px] px-4 py-3 md:max-w-[520px] ${
                              isAgency
                                ? 'ml-auto bg-[var(--primary)] text-white'
                                : 'bg-[var(--panel-strong)] text-[var(--text)]'
                            }`}
                          >
                            <div
                              className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                                isAgency ? 'text-white/70' : 'text-[var(--text-soft)]'
                              }`}
                            >
                              {isAgency ? 'Agency' : message.senderName}
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-sm leading-6">
                              {message.content}
                            </div>
                            <div
                              className={`mt-3 text-xs ${
                                isAgency ? 'text-white/70' : 'text-[var(--text-soft)]'
                              }`}
                            >
                              {formatDate(message.createdAt, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSend} className="border-t border-[var(--border)] px-4 py-4 md:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={composer}
                        onChange={(event) => setComposer(event.target.value)}
                        placeholder="Write a message"
                        className="app-field"
                      />
                      <button
                        type="submit"
                        disabled={sending || !composer.trim()}
                        className="app-btn-primary h-12 shrink-0 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div>
                <div className="text-lg font-semibold tracking-tight text-[var(--text)]">
                  Pick an offer chat
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Open any joined-offer room to talk to travelers in real time.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
