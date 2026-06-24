import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Messages() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (convId) => {
    try {
      const { data } = await api.get(`/messages/${convId}`);
      setMessages(data.data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (location.state?.openConversation) {
      setActiveConv(location.state.openConversation);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      pollRef.current = setInterval(() => fetchMessages(activeConv._id), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeConv]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', {
        conversationId: activeConv._id,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, data.data]);
      setNewMessage('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user?._id);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-5">{t('messages.inbox')}</h1>

      <div className="card overflow-hidden flex h-[calc(100vh-14rem)]">
        {/* Conversations List */}
        <div className={`${activeConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 border-r border-gray-100 shrink-0`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <LoadingSpinner size="sm" /> :
              conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <FiMessageSquare className="text-3xl mx-auto mb-2 text-gray-200" />
                  {t('messages.no_conversations')}
                </div>
              ) : conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const photoUrl = other?.profileId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.firstName || 'U')}&background=e91e8c&color=fff`;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${activeConv?._id === conv._id ? 'bg-primary-50' : ''}`}
                  >
                    <img src={photoUrl} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {other?.firstName} {other?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {conv.lastMessage ? 'Click to view messages' : 'Start a conversation'}
                      </p>
                    </div>
                    {conv.myUnreadCount > 0 && (
                      <span className="min-w-[20px] h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {conv.myUnreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            }
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${activeConv ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <FiMessageSquare className="text-5xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden text-gray-400 hover:text-gray-600 mr-1"
                >←</button>
                {(() => {
                  const other = getOtherParticipant(activeConv);
                  const photoUrl = other?.profileId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.firstName || 'U')}&background=e91e8c&color=fff`;
                  return (
                    <>
                      <img src={photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{other?.firstName} {other?.lastName}</p>
                        <p className="text-xs text-green-500">{t('messages.online')}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? 'bg-primary-gradient text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('messages.type_message')}
                  className="input-field flex-1 py-2.5 text-sm"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary px-4 py-2.5 rounded-xl disabled:opacity-50"
                >
                  <FiSend />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
