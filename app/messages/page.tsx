'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { media } from '@/utils/seedData';

function MessagesContent() {
  const searchParams = useSearchParams();
  const { chats, sendMessage, setProposalModalTargetId, posts } = useApp();

  const chatKeys = Object.keys(chats);
  const [activeChatId, setActiveChatId] = useState<string>(chatKeys[0] || 'arun');
  const [inputText, setInputText] = useState('');
  const [showMobileList, setShowMobileList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If query params are provided from post detail (e.g. ?user=Kavya&post=Camera)
  useEffect(() => {
    const userParam = searchParams.get('user');
    const postParam = searchParams.get('post');
    if (userParam) {
      const key = userParam.toLowerCase().split(' ')[0];
      if (!chats[key]) {
        chats[key] = {
          name: userParam,
          avatar: media[key as keyof typeof media] || media.arun,
          city: 'Tamil Nadu',
          post: postParam || 'Exchange item',
          messages: [
            {
              mine: false,
              text: `Hi! I’m open to discussing an exchange for ${postParam || 'the item'}.`,
              time: 'Just now',
            },
          ],
        };
      }
      setActiveChatId(key);
      setShowMobileList(false);
    }
  }, [searchParams, chats]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId]);

  const activeChat = chats[activeChatId] || chats[chatKeys[0]];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeChatId, inputText);
    setInputText('');
  };

  const handleProposeFromChat = () => {
    const targetPost =
      posts.find((p) => p.owner === activeChat?.name && p.title === activeChat?.post) ||
      posts.find((p) => p.owner === activeChat?.name) ||
      posts[0];

    if (targetPost) {
      setProposalModalTargetId(targetPost.id);
    }
  };

  return (
    <div className="message-layout">
      {/* Conversation list */}
      <aside
        className={`conversation-list ${!showMobileList ? 'mobile-hide' : ''}`}
        style={{ display: showMobileList ? 'block' : undefined }}
      >
        <h2>Messages</h2>
        {chatKeys.map((id) => {
          const c = chats[id];
          const lastMessage = c.messages[c.messages.length - 1];
          return (
            <button
              key={id}
              type="button"
              className={`convo ${activeChatId === id ? 'active' : ''}`}
              onClick={() => {
                setActiveChatId(id);
                setShowMobileList(false);
              }}
            >
              <img className="avatar" src={c.avatar} alt={c.name} />
              <div className="convo-copy">
                <b>
                  <span>{c.name}</span>
                  <small>{lastMessage?.time}</small>
                </b>
                <span>{lastMessage?.text}</span>
              </div>
            </button>
          );
        })}
      </aside>

      {/* Chat window */}
      {activeChat && (
        <section
          className={`chat ${showMobileList ? 'mobile-hide' : ''}`}
          style={{ display: showMobileList ? 'none' : undefined }}
        >
          <header className="chat-head">
            <button
              type="button"
              className="btn btn-quiet btn-small"
              style={{ marginRight: 6 }}
              onClick={() => setShowMobileList(true)}
              aria-label="View all conversations"
            >
              ← Chats
            </button>
            <img className="avatar" src={activeChat.avatar} alt={activeChat.name} />
            <div>
              <b>{activeChat.name}</b>
              <small>
                ⌖ {activeChat.city} · discussing {activeChat.post}
              </small>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={handleProposeFromChat}
            >
              Propose exchange
            </button>
          </header>

          <div className="messages" id="message-scroll">
            {activeChat.messages.map((m, idx) => (
              <div key={idx} className={`bubble ${m.mine ? 'mine' : ''}`}>
                {m.text}
                <small>
                  {m.time}
                  {m.mine ? ' · Delivered' : ''}
                </small>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              name="message"
              autoComplete="off"
              placeholder="Write a message…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" aria-label="Send message">
              ↑
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <main className="shell">
      <Suspense fallback={<div className="empty">Loading conversations…</div>}>
        <MessagesContent />
      </Suspense>
    </main>
  );
}
