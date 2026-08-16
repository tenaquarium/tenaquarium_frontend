import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, User, ArrowLeft } from 'lucide-react';

const Chats = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // 1. Fetch conversations
  const fetchConversations = async (autoSelectId = null) => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
      
      // Auto-select partner if specified
      if (autoSelectId) {
        const found = res.data.find(c => c.partner._id === autoSelectId);
        if (found) {
          setActivePartner(found.partner);
        } else {
          // If not in conversations list (first time), fetch their profile details
          try {
            const profileRes = await api.get(`/users/profile/${autoSelectId}`);
            setActivePartner(profileRes.data);
            
            // Add a temporary contact at the top
            setConversations(prev => [
              {
                partner: profileRes.data,
                lastMessage: { messageText: 'Start conversation...', createdAt: new Date() },
                unreadCount: 0
              },
              ...prev
            ]);
          } catch (err) {
            console.error('Failed to resolve target profile:', err);
          }
        }
      } else if (!activePartner && res.data.length > 0) {
        // Default to first conversation
        setActivePartner(res.data[0].partner);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  // 2. Initial load
  useEffect(() => {
    const targetUserId = location.state?.autoStartChatWith;
    fetchConversations(targetUserId);
    
    // Clear route state to prevent re-selection on refresh
    window.history.replaceState({}, document.title);
  }, []);

  // 3. Fetch messages for active partner & poll updates
  const fetchMessages = async (silent = false) => {
    if (!activePartner) return;
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await api.get(`/messages/${activePartner._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
    
    // Clear old polling interval
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    // Start polling messages every 3 seconds
    pollingRef.current = setInterval(() => {
      fetchMessages(true);
      // Also fetch conversations in the background to update unread counts and last messages
      api.get('/messages/conversations').then(res => setConversations(res.data)).catch(() => {});
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activePartner]);

  // 4. Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner) return;

    const messagePayload = {
      receiverId: activePartner._id,
      messageText: inputText.trim()
    };

    try {
      const res = await api.post('/messages', messagePayload);
      setMessages(prev => [...prev, res.data]);
      setInputText('');
      
      // Refresh conversations list to update order and last message
      fetchConversations(activePartner._id);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', maxWidth: '1200px', margin: '0 auto', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', background: 'var(--card-bg)', backdropFilter: 'blur(10px)', marginTop: '1rem', marginBottom: '1rem' }}>
      
      {/* Sidebar - Conversation List */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Chats</h2>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {loadingConvs ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No messages yet
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activePartner && activePartner._id === conv.partner._id;
              return (
                <div
                  key={conv.partner._id}
                  onClick={() => setActivePartner(conv.partner)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    transition: 'background 0.2s',
                    marginBottom: '0.25rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    <User size={18} />
                  </div>
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: isSelected ? '700' : '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.partner.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {conv.partner.role}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage?.messageText || 'Click to message'}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
        {activePartner ? (
          <>
            {/* Header info */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <User size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{activePartner.name}</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {activePartner.role} • {activePartner.email}
                  </span>
                </div>
              </div>

              {window.innerWidth <= 768 && (
                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {loadingMsgs ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="spinner"></div>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>Type a message to start chatting</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.senderId === user?._id;
                  return (
                    <div
                      key={msg._id}
                      style={{
                        alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSentByMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          background: isSentByMe ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                          color: isSentByMe ? 'white' : 'var(--text-main)',
                          padding: '0.6rem 0.9rem',
                          borderRadius: isSentByMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          fontSize: '0.82rem',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {msg.messageText}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.8rem', background: 'rgba(0,0,0,0.05)' }}>
              <input
                type="text"
                placeholder="Type your inquiry here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="form-control"
                style={{ flexGrow: 1, borderRadius: '8px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Send size={14} /> Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Your Inbox</h3>
            <p style={{ fontSize: '0.8rem' }}>Select a conversation from the sidebar to view chat logs</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chats;
