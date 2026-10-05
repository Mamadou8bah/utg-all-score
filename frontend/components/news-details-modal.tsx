"use client";
import { useLanguage } from "@/components/language-provider";

import { DetailDialog } from "@/components/detail-dialog";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { X, Calendar, Share2, Clock, BookOpen } from "lucide-react";
import { sharePage } from "@/lib/share";
import { formatDate } from "@/lib/utils";

interface NewsItem {
  id?: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  publishedAt: string;
  body?: string;
}

export const NewsDetailsModal = ({ 
  item, 
  onClose 
}: { 
  item: NewsItem; 
  onClose: () => void 
}) => {
  const { t: translate, locale } = useLanguage();
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  if (!item) return null;
  const readingMinutes = Math.max(1, Math.ceil((item.body || item.excerpt).split(/\s+/).length / 200));

  return (
    <DetailDialog label={item.title} onClose={onClose} className="reference-article fixed inset-0 z-[100] flex items-stretch justify-center bg-white sm:items-center sm:bg-slate-900 sm:p-4">
      <div 
        className="relative flex h-[100dvh] max-h-none w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl animate-in slide-in-from-bottom-full duration-300 sm:h-auto sm:max-h-[92vh] sm:rounded-[40px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Close */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            aria-label={translate("Close article")}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white  transition hover:bg-slate-600 active:scale-90 sm:bg-slate-100 sm:text-slate-600 sm:hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 sm:pb-8">
          {/* Cover Image */}
          {item.image && (
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <img 
                src={item.image} 
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge variant="live" className="mb-3 bg-slate-700 text-white  border-none px-4 py-1.5 font-black tracking-[0.2em]">
                  {item.category}
                </Badge>
                <h1 className="text-2xl font-black text-white leading-tight sm:text-4xl">
                  {item.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10">
            {!item.image ? <h1 className="mb-4 text-2xl font-bold">{item.title}</h1> : null}
            {/* Meta Info */}
            <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-slate-100 pb-8 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="font-bold">{formatDate(item.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' }, locale)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="font-bold">{readingMinutes} {translate("min read")}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span className="font-bold">{item.category}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-slate max-w-none">
              <p className="text-lg font-bold leading-relaxed text-slate-950 mb-6 italic border-l-4 border-primary pl-6">
                "{item.excerpt}"
              </p>
              
              <div className="space-y-6 text-base leading-8 text-slate-600 font-medium">
                {item.body?.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
              </div>
            </div>

            {/* Interaction Footer */}
            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" aria-label={translate("Share article")} onClick={async () => setShareMessage(await sharePage(item.title, `${window.location.origin}/news`, item.excerpt))} className="h-12 w-12 rounded-full p-0 flex items-center justify-center ring-slate-100">
                  <Share2 size={20} className="text-slate-600" />
                </Button>
                {shareMessage ? <span role="status" className="text-xs text-text-secondary">{translate(shareMessage)}</span> : null}
              </div>
              <Button onClick={onClose} className="rounded-2xl px-8 py-3.5 font-black uppercase tracking-widest text-xs">{translate("Back to Feed")}</Button>
            </div>
          </div>
        </div>
      </div>
    </DetailDialog>
  );
};
