'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    } catch (err) {
      console.error('Contact error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4fa] dark:bg-[#050d24] transition-colors">
      <Navbar />
      <main className="flex-1 py-10 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#08143A] dark:text-white">
              {lang === 'bn' ? 'যোগাযোগ ও জিজ্ঞাসা' : 'Contact Us & Enquiries'}
            </h1>
            <p className="text-sm sm:text-base text-[#273656] dark:text-[#CBD5E1] font-semibold">
              {lang === 'bn'
                ? 'ঈশ্বমপুর গ্রাম ডিজিটাল কমিটি বা টুর্নামেন্ট পরিচালনা দলের সাথে যেকোনো প্রয়োজনে যোগাযোগ করুন।'
                : 'Reach out to the Iswampur Village Digital Committee or tournament organizers for any questions.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Info Cards */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-3 shadow-sm">
                <MapPin className="w-6 h-6 text-[#F26522]" />
                <h3 className="font-black text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'গ্রামের ঠিকানা' : 'Village Address'}
                </h3>
                <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] font-medium">
                  {lang === 'bn'
                    ? 'ঈশ্বমপুর গ্রাম, পোস্ট: ঈশ্বমপুর, থানা এলাকা, পশ্চিমবঙ্গ, ভারত'
                    : 'Iswampur Village, PO: Iswampur, West Bengal, India'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-3 shadow-sm">
                <Phone className="w-6 h-6 text-[#19398A] dark:text-[#00A3E0]" />
                <h3 className="font-black text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'হটলাইন ও হোয়াটসঅ্যাপ' : 'Hotline & WhatsApp'}
                </h3>
                <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] font-medium">
                  +91 98765 43210 (9:00 AM - 9:00 PM)
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] space-y-3 shadow-sm">
                <Mail className="w-6 h-6 text-[#F9A01B]" />
                <h3 className="font-black text-[#08143A] dark:text-white">
                  {lang === 'bn' ? 'ইমেইল' : 'Official Email'}
                </h3>
                <p className="text-xs sm:text-sm text-[#273656] dark:text-[#CBD5E1] font-medium">
                  contact@iswampur.org
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1a40] border border-[#cbd9ec] dark:border-[#1d3575] shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-xl font-black text-[#08143A] dark:text-white">
                    {lang === 'bn' ? 'বার্তা প্রেরিত হয়েছে!' : 'Message Sent Successfully!'}
                  </h3>
                  <p className="text-sm text-[#273656] dark:text-[#CBD5E1] font-medium">
                    {lang === 'bn'
                      ? 'আপনার বার্তাটি সফলভাবে জমা হয়েছে। গ্রাম পরিচালনা কমিটি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
                      : 'Thank you for reaching out. The village committee will get back to you shortly.'}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#e6eef8] dark:bg-[#112766] text-[#08143A] dark:text-white"
                  >
                    {lang === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                      {lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                        {lang === 'bn' ? 'ইমেইল *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                        {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#08143A] dark:text-white mb-1">
                      {lang === 'bn' ? 'আপনার বার্তা / জিজ্ঞাসা *' : 'Your Message *'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd9ec] dark:border-[#1d3575] bg-[#f0f4fa] dark:bg-[#071333] text-[#08143A] dark:text-white font-semibold text-sm focus:border-[#F26522]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#F26522] to-[#F9A01B] hover:from-[#e05615] hover:to-[#e8900f] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-wider text-sm"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'বার্তা প্রেরণ করুন' : 'Send Message'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
