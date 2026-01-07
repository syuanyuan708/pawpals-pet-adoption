
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MESSAGES } from '../constants';
import type { Message } from '../types';
import { getMessages, markAsRead, markAllAsRead, getUnreadCount } from '../src/services/messages.service';
import { useAuth } from '../src/contexts/AuthContext';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        setMessages(MOCK_MESSAGES);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getMessages();
        setMessages(data.length > 0 ? data : MOCK_MESSAGES);
      } catch (err) {
        console.error('加载消息失败:', err);
        setMessages(MOCK_MESSAGES);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;

    try {
      await markAllAsRead();
      setMessages(prev => prev.map(msg => ({ ...msg, isUnread: false })));
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  };

  const handleMessageClick = async (msg: Message) => {
    if (!user || !msg.isUnread) return;

    try {
      await markAsRead(msg.id);
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, isUnread: false } : m
      ));
    } catch (err) {
      console.error('标记已读失败:', err);
    }
  };

  // 未登录状态
  if (!user) {
    return (
      <div className="flex flex-col flex-1 pb-24 bg-background-light dark:bg-background-dark min-h-screen">
        <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200/50 flex items-center px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="mr-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-main dark:text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-bold tracking-tight text-text-main dark:text-white flex-1">消息中心</h2>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <span className="material-symbols-outlined text-6xl text-text-muted mb-4">mail</span>
          <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">登录查看消息</h3>
          <p className="text-text-muted text-center mb-6">登录后可查看领养申请进度和系统通知</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-primary text-primary-content font-bold rounded-2xl"
          >
            立即登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-24 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200/50 flex items-center px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-main dark:text-white"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight text-text-main dark:text-white flex-1">消息中心</h2>
        <button
          onClick={handleMarkAllRead}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-text-main dark:text-white"
          title="全部标为已读"
        >
          <span className="material-symbols-outlined text-2xl">done_all</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
            <p className="font-medium">暂无消息</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleMessageClick(msg)}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer ${msg.isUnread ? 'bg-primary/5 border border-primary/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className={`w-14 h-14 rounded-2xl object-cover ${msg.type === 'system' ? 'p-2 bg-gray-100 dark:bg-slate-800' : ''}`}
                  />
                  {msg.isUnread && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-base font-bold truncate ${msg.isUnread ? 'text-text-main dark:text-white' : 'text-text-muted dark:text-gray-300'}`}>
                      {msg.senderName}
                    </h3>
                    <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{msg.time}</span>
                  </div>
                  <p className={`text-sm line-clamp-2 leading-relaxed ${msg.isUnread ? 'text-text-main dark:text-white font-medium' : 'text-text-muted dark:text-gray-400'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Empty state mockup for other categories */}
            <div className="pt-10 flex flex-col items-center justify-center opacity-40">
              <span className="material-symbols-outlined text-6xl mb-4">forum</span>
              <p className="text-sm font-medium">没有更多消息了</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
