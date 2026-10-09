'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n/context';
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, Trophy, Calendar, MapPin, Download } from 'lucide-react';

export default function VerifyPassPage() {
  const params = useParams();
  const passId = params?.passId as string;
  const { lang, resolveBilingual } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/passes/${passId}/verify`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Verify error', err);
      } finally {
        setLoading(false);
      }
    }
    if (passId) verify();
  }, [passId]);

  const isValid = data?.isValid;
  const isCheckedIn = data?.status === 'CHECKED_IN';

  return (
    <div className="min-h-screen flex flex-col bg-[#050D24] text-white">
      <Navbar />
      <main className="flex-1 py-10 lg:py-16 flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-3xl bg-[#08143A] border-2 border-[#19398A] shadow-2xl overflow-hidden space-y-6">
          {/* Header with Official Logo & Broadcast Band */}
          <div className="bg-[#050D24] p-5 border-b border-[#1d3575] relative text-center">
            <div className="h-1 w-full bg-gradient-to-r from-[#F26522] via-[#F9A01B] to-[#00A3E0] absolute top-0 left-0" />
            <div className="flex justify-center mb-2">
              <Image
                src="/logo-horizontal-web.png"
                alt="Iswampur Premier League Logo"
                width={200}
                height={133}
                className="h-16 w-auto object-contain filter drop-shadow"
                priority
              />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#F9A01B]">
              {lang === 'bn' ? 'অফিসিয়াল ম্যাচ-ডে টিম পাস' : 'OFFICIAL MATCHDAY SQUAD PASS'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-center pt-0">
            {loading ? (
              <div className="py-12 font-bold text-slate-300">
                {lang === 'bn' ? 'ডিজিটাল সিগনেচার যাচাই করা হচ্ছে...' : 'Verifying pass digital signature...'}
              </div>
            ) : isValid || isCheckedIn ? (
              <>
                {/* Verified Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isCheckedIn
                      ? lang === 'bn'
                        ? 'মাঠে চেক-ইন সম্পন্ন (CHECKED-IN)'
                        : 'GROUND CHECK-IN VERIFIED'
                      : lang === 'bn'
                      ? 'অফিসিয়ালি অনুমোদিত পাস'
                      : 'OFFICIALLY VERIFIED PASS'}
                  </span>
                </div>

                {/* PROMINENT PASS ID BOX */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F9A01B] to-[#F26522] text-[#050D24] shadow-xl border-2 border-white/50 space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-widest block opacity-90">
                    {lang === 'bn' ? 'পাস কোড (PASS CODE / ID)' : 'OFFICIAL PASS CODE / ID'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider block drop-shadow-sm select-all">
                    {data?.humanPassCode}
                  </span>
                  <span className="text-[10px] font-mono font-bold block opacity-75">
                    {data?.passId}
                  </span>
                </div>

                {/* Team Info */}
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {data?.teamName}
                  </h1>
                  <p className="text-xs text-[#00A3E0] font-bold">
                    {lang === 'bn' ? 'দল প্রতিনিধি:' : 'Representative:'} {data?.representativeName}
                  </p>
                </div>

                {/* Details Table Card */}
                <div className="p-4 rounded-2xl bg-[#0C1A40] border border-[#1d3575] text-xs text-left space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#F9A01B] shrink-0" />
                    <span className="text-white font-bold">
                      {resolveBilingual(data?.eventTitle)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F26522] shrink-0" />
                    <span className="text-slate-300 font-semibold">{data?.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00A3E0] shrink-0" />
                    <span className="text-slate-300 font-semibold">
                      {resolveBilingual(data?.venue)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#1d3575] flex justify-between items-center text-[11px] text-slate-400">
                    <span>
                      {lang === 'bn'
                        ? `খেলোয়াড় সংখ্যা: ${data?.memberCount} জন`
                        : `Squad: ${data?.memberCount} Players`}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {lang === 'bn' ? 'সিগনেচার: বৈধ ✓' : 'HMAC: VALID ✓'}
                    </span>
                  </div>
                </div>

                {/* Download PDF button */}
                <div className="pt-2">
                  <a
                    href={`/api/passes/${passId}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl font-bold bg-[#19398A] hover:bg-[#112766] border border-[#1d3575] text-white flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#F9A01B]" />
                    <span>
                      {lang === 'bn' ? 'অফিসিয়াল PDF পাস ডাউনলোড' : 'Download Official PDF Pass'}
                    </span>
                  </a>
                </div>
              </>
            ) : (
              <>
                {/* Invalid / Tampered Badge */}
                <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-600/30">
                  <AlertCircle className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-rose-500">
                    {lang === 'bn' ? 'অবৈধ বা নকল পাস!' : 'Invalid or Tampered Pass!'}
                  </h1>
                  <p className="text-xs text-slate-300 font-semibold">
                    {lang === 'bn'
                      ? 'এই পাসটির তথ্য বিকৃত করা হয়েছে অথবা কর্তৃপক্ষ দ্বারা এটি বাতিল করা হয়েছে।'
                      : 'The cryptographic signature does not match official records or the pass was revoked.'}
                  </p>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-[#1d3575]">
              <Link
                href="/"
                className="text-xs font-black text-[#00A3E0] hover:text-[#F9A01B] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরুন' : 'Return to Website'}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
