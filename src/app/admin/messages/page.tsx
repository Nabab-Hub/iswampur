'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth/authContext';
import { useLanguage } from '@/lib/i18n/context';
import { ContactMessage } from '@/types';
import {
  Mail,
  Search,
  RefreshCw,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MessageSquare,
  AlertCircle,
  X,
  Sparkles,
  Inbox,
  Filter,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const toast = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'unread' | 'replied'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Delete Confirm Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages from API
  const fetchMessages = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/contact-messages', {
        headers: {
          'x-user-email': user?.email || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (isManual) {
          toast.success(lang === 'bn' ? 'বার্তা তালিকা রিফ্রেশ হয়েছে' : 'Messages refreshed');
        }
      } else {
        toast.error('Failed to load contact messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Error connecting to messages service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Handle Send Reply
  const handleSendReply = async () => {
    if (!replyTarget || !replyText.trim()) {
      toast.error(lang === 'bn' ? 'অনুগ্রহ করে উত্তরের বার্তা লিখুন' : 'Please enter reply message');
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/admin/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({
          id: replyTarget.id,
          replyText: replyText.trim(),
          adminEmail: user?.email || 'admin@iswampur.org',
          adminName: user?.displayName || 'Iswampur Village Committee Desk',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(
          lang === 'bn'
            ? `উত্তর সফলভাবে ${replyTarget.email} এ পাঠানো হয়েছে!`
            : `Reply successfully sent to ${replyTarget.email}!`
        );
        // Update local list
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyTarget.id
              ? {
                  ...m,
                  status: 'replied',
                  replyText: replyText.trim(),
                  repliedAt: new Date().toISOString(),
                  repliedBy: user?.displayName || user?.email || 'Admin',
                }
              : m
          )
        );
        setReplyTarget(null);
        setReplyText('');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      toast.error('Error sending email reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Toggle Read / Unread Status
  const handleToggleStatus = async (msg: ContactMessage) => {
    const nextStatus = msg.status === 'unread' ? 'read' : 'unread';
    try {
      const res = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, status: nextStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m))
        );
      }
    } catch {
      toast.error('Failed to update message status');
    }
  };

  // Delete message
  const handleDeleteMessage = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/contact-messages?id=${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== deleteTargetId));
        toast.success(lang === 'bn' ? 'বার্তাটি মুছে ফেলা হয়েছে' : 'Message deleted');
        setDeleteTargetId(null);
      } else {
        toast.error('Failed to delete message');
      }
    } catch {
      toast.error('Error deleting message');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) {
      if (statusFilter === 'unread' && m.status !== 'unread') return false;
      if (statusFilter === 'replied' && m.status !== 'replied') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchPhone = m.phone?.toLowerCase().includes(q);
      const matchMsg = m.message?.toLowerCase().includes(q);
      const matchReply = m.replyText?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchMsg || matchReply;
    }
    return true;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-16 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd9ec] dark:border-[#1d3575] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#F26522] font-black text-xs uppercase tracking-widest">
              <Mail className="w-4 h-4" />
              <span>HELPDESK & CONTACT INBOX</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#08143A] dark:text-white mt-1">
              {lang === 'bn' ? 'যোগাযোগ বার্তা ও ইনবক্স' : 'Contact Messages & Inquiries'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'পাবলিক কন্টাক্ট ফর্ম থেকে আসা সকল প্রশ্ন, অভিযোগ ও বার্তা। অ্যাডমিন থেকে সরাসরি প্রেরকের ইমেইলে উত্তর দিন।'
                : 'All questions, suggestions & inquiries submitted via contact form. Reply directly to user email from here.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMessages(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] text-[#08143A] dark:text-white text-xs font-bold shadow-xs hover:border-[#F26522] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F26522] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Stats Pills Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? 'মোট বার্তা' : 'Total Inquiries'}
              </p>
              <h3 className="text-2xl font-black text-[#08143A] dark:text-white mt-0.5">{messages.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                {lang === 'bn' ? 'অপঠিত বার্তা' : 'Unread Inquiries'}
              </p>
              <h3 className="text-2xl font-black text-amber-500 mt-0.5">{unreadCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                {lang === 'bn' ? 'উত্তর প্রদানকৃত' : 'Replied'}
              </p>
              <h3 className="text-2xl font-black text-emerald-500 mt-0.5">{repliedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-gradient-to-r from-[#19398A] to-[#1e4bb8] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#0c1a40] text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'সকল বার্তা' : 'All'} ({messages.length})
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'unread'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#0c1a40] text-slate-600 dark:text-slate-300 hover:text-amber-500'
              }`}
            >
              {lang === 'bn' ? 'অপঠিত' : 'Unread'} ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('replied')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'replied'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#0c1a40] text-slate-600 dark:text-slate-300 hover:text-emerald-500'
              }`}
            >
              {lang === 'bn' ? 'উত্তরকৃত' : 'Replied'} ({repliedCount})
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'নাম, ইমেইল বা বিষয় দিয়ে খুঁজুন...' : 'Search name, email, query...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-xs font-bold text-[#08143A] dark:text-white focus:outline-hidden focus:border-[#F26522]"
            />
          </div>
        </div>

        {/* Message List */}
        {loading ? (
          <div className="p-16 text-center space-y-3 bg-white dark:bg-[#071333] rounded-3xl border border-[#cbd9ec] dark:border-[#1d3575]">
            <div className="w-10 h-10 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">
              {lang === 'bn' ? 'বার্তাগুলো লোড হচ্ছে...' : 'Loading messages...'}
            </p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center space-y-4 bg-white dark:bg-[#071333] rounded-3xl border border-[#cbd9ec] dark:border-[#1d3575]">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#0c1a40] flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-black text-[#08143A] dark:text-white">
                {lang === 'bn' ? 'কোনো বার্তা পাওয়া যায়নি' : 'No Messages Found'}
              </h3>
              <p className="text-xs text-slate-400">
                {searchQuery || statusFilter !== 'ALL'
                  ? lang === 'bn'
                    ? 'আপনার ফিল্টারের সাথে কোনো বার্তা মিলছে না।'
                    : 'No messages match your selected search or filter.'
                  : lang === 'bn'
                  ? 'ওয়েবসাইটের যোগাযোগ ফর্মের মাধ্যমে কোনো বার্তা আসলে এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।'
                  : 'Messages submitted via public contact form will appear here automatically.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => {
              const isUnread = msg.status === 'unread';
              const isReplied = msg.status === 'replied';

              return (
                <div
                  key={msg.id}
                  className={`rounded-3xl p-5 sm:p-6 transition-all border ${
                    isUnread
                      ? 'bg-amber-50/40 dark:bg-[#0c1a40] border-amber-300 dark:border-amber-500/40 shadow-sm'
                      : 'bg-white dark:bg-[#071333] border-[#cbd9ec] dark:border-[#1d3575]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Sender Identity */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#19398A] to-[#1e4bb8] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {msg.name ? msg.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-base text-[#08143A] dark:text-white leading-tight">
                            {msg.name}
                          </h3>

                          {/* Status Badge */}
                          {isUnread && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              <span>{lang === 'bn' ? 'নতুন বার্তা' : 'New Unread'}</span>
                            </span>
                          )}

                          {isReplied && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'উত্তর দেওয়া হয়েছে' : 'Replied via Email'}</span>
                            </span>
                          )}

                          {!isUnread && !isReplied && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {lang === 'bn' ? 'পঠিত' : 'Read'}
                            </span>
                          )}
                        </div>

                        {/* Contact Meta */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                          <a
                            href={`mailto:${msg.email}`}
                            className="hover:text-[#F26522] transition-colors inline-flex items-center gap-1 font-mono"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{msg.email}</span>
                          </a>

                          {msg.phone && (
                            <a
                              href={`tel:${msg.phone}`}
                              className="hover:text-[#F26522] transition-colors inline-flex items-center gap-1 font-mono"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{msg.phone}</span>
                            </a>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button
                        onClick={() => {
                          setReplyTarget(msg);
                          setReplyText(msg.replyText ? `\n\n---\nপূর্বের উত্তর:\n${msg.replyText}` : '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isReplied ? (lang === 'bn' ? 'পুনরায় উত্তর' : 'Reply Again') : (lang === 'bn' ? 'উত্তর দিন' : 'Reply Email')}</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(msg)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#0c1a40] hover:bg-slate-200 dark:hover:bg-[#142654] text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                        title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(msg.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-500 transition-colors cursor-pointer"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1a40]/60 border border-slate-100 dark:border-[#142654] text-sm text-[#273656] dark:text-[#CBD5E1] whitespace-pre-wrap leading-relaxed font-medium">
                    {msg.message}
                  </div>

                  {/* If Replied, show previous response */}
                  {msg.replyText && (
                    <div className="mt-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 font-black">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'অ্যাডমিন উত্তর (ইমেলে প্রেরিত)' : 'Admin Reply (Dispatched to Email)'}</span>
                        </span>
                        {msg.repliedAt && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            {new Date(msg.repliedAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap leading-relaxed">
                        {msg.replyText}
                      </p>
                      {msg.repliedBy && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                          — {msg.repliedBy}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reply Modal */}
        {replyTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#071333] border border-[#cbd9ec] dark:border-[#1d3575] shadow-2xl p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-[#cbd9ec] dark:border-[#1d3575] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F26522]/15 text-[#F26522] flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#08143A] dark:text-white leading-tight">
                      {lang === 'bn' ? 'ইমেলে উত্তর প্রেরণ' : 'Send Email Reply'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      To: <span className="font-bold text-[#F26522]">{replyTarget.email}</span> ({replyTarget.name})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReplyTarget(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0c1a40] text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Original Message Quote */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-slate-200 dark:border-[#142654] text-xs text-slate-500 dark:text-slate-300 max-h-28 overflow-y-auto">
                <p className="font-black text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  {lang === 'bn' ? 'গ্রাহকের মূল বার্তা:' : 'User Original Query:'}
                </p>
                <p className="italic font-medium">&quot;{replyTarget.message}&quot;</p>
              </div>

              {/* Quick Template Replies */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400">
                  {lang === 'bn' ? 'দ্রুত টেমপ্লেট উত্তর:' : 'Quick Response Snippets:'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      setReplyText(
                        lang === 'bn'
                          ? `নমস্কার ${replyTarget.name},\nঈশ্বমপুর গ্রাম পোর্টালে যোগাযোগ করার জন্য ধন্যবাদ। আপনার বার্তাটি আমরা গুরুত্বের সাথে গ্রহণ করেছি। এই বিষয়ে দ্রুত ব্যবস্থা গ্রহণ করা হচ্ছে।`
                          : `Hello ${replyTarget.name},\nThank you for reaching out to the Iswampur Village Committee. We have received your query and are looking into it promptly.`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-[#0c1a40] hover:bg-[#F26522]/10 hover:text-[#F26522] transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    + {lang === 'bn' ? 'ধন্যবাদ ও প্রাপ্তিস্বীকার' : 'General Acknowledgement'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyText(
                        lang === 'bn'
                          ? `নমস্কার ${replyTarget.name},\nঈশ্বমপুর প্রিমিয়ার লীগ (IPL 2026) সংক্রান্ত আপনার জিজ্ঞাসার প্রেক্ষিতে জানানো যাচ্ছে যে, ওয়েবসাইট থেকে সরাসরি দল নিবন্ধন ও ডিজিটাল কিউআর পাস ডাউনলোড করা যাবে। যেকোনো প্রয়োজনে আমাদের হটলাইন নম্বরেও যোগাযোগ করতে পারেন।`
                          : `Hello ${replyTarget.name},\nRegarding your IPL 2026 cricket inquiry, team registrations and official digital QR passes are available directly on our portal. Feel free to contact our desk for further assistance.`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-[#0c1a40] hover:bg-[#F26522]/10 hover:text-[#F26522] transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    + {lang === 'bn' ? 'আইপিএল তথ্য' : 'IPL Tournament Info'}
                  </button>
                </div>
              </div>

              {/* Reply Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#08143A] dark:text-white block">
                  {lang === 'bn' ? 'আপনার উত্তর লিখুন:' : 'Your Official Reply Message:'}
                </label>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'এখানে আপনার বিস্তারিত উত্তর লিখুন... (এটি প্রেরকের ইমেইলে আনুষ্ঠানিকভাবে পাঠানো হবে)'
                      : 'Type your detailed reply here... (This will be formatted and emailed directly to the user)'
                  }
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] text-xs sm:text-sm font-medium text-[#08143A] dark:text-white focus:outline-hidden focus:border-[#F26522] leading-relaxed resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  disabled={isSendingReply}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0c1a40] transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:brightness-110 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isSendingReply ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'bn' ? 'ইমেল পাঠানো হচ্ছে...' : 'Sending Email...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'ইমেলে উত্তর প্রেরণ করুন' : 'Dispatch Email Reply'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={Boolean(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={handleDeleteMessage}
          isLoading={isDeleting}
          title={lang === 'bn' ? 'বার্তাটি মুছে ফেলতে চান?' : 'Delete Contact Message?'}
          message={
            lang === 'bn'
              ? 'আপনি কি নিশ্চিত যে এই বার্তাটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।'
              : 'Are you sure you want to permanently delete this contact inquiry? This action cannot be undone.'
          }
          confirmText={lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Delete'}
          isDestructive={true}
        />
      </div>
    </AdminLayout>
  );
}
