"use client";

import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { X, Calendar, Share2, MessageCircle, Clock, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NewsItem {
  id?: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  publishedAt: string;
}

export const NewsDetailsModal = ({ 
  item, 
  onClose 
}: { 
  item: NewsItem; 
  onClose: () => void 
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl overflow-hidden bg-white shadow-2xl animate-in slide-in-from-bottom-full duration-300 sm:rounded-[40px] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Close */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-90 sm:bg-slate-100 sm:text-slate-600 sm:hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden pb-20 sm:pb-8">
          {/* Cover Image */}
          {item.image && (
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <img 
                src={item.image} 
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge variant="live" className="mb-3 bg-white/20 text-white backdrop-blur-md border-none px-4 py-1.5 font-black tracking-[0.2em]">
                  {item.category}
                </Badge>
                <h1 className="text-2xl font-black text-white leading-tight sm:text-4xl">
                  {item.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Meta Info */}
            <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-slate-100 pb-8 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="font-bold">{formatDate(item.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="font-bold">4 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span className="font-bold">Match Analysis</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-slate max-w-none">
              <p className="text-lg font-bold leading-relaxed text-slate-950 mb-6 italic border-l-4 border-primary pl-6">
                "{item.excerpt}"
              </p>
              
              <div className="space-y-6 text-base leading-8 text-slate-600 font-medium">
                <p>
                  UTG Main Campus — In a stunning display of tactical discipline and raw speed, the latest round of matches in the Inter-Faculty Premier League has left fans and analysts alike breathless. The atmosphere under the campus lights was electric as students from all faculties gathered to support their respective teams.
                </p>
                <p>
                  "We've been training for this specific transition play for weeks," said the team captain during a post-match interview. "AllScore has made it easier for us to track our performance and see where we need to improve. Today, it all came together."
                </p>
                <p>
                  The game changed in the 72nd minute when a quick interchange in the midfield opened up space for a devastating cross. The resulting goal sent the crowd into a frenzy, solidifying the team's position at the top of the table. With only three fixtures remaining, every point is now critical in the race for the Dean's Cup.
                </p>
                <p>
                  Faculty officials have noted an increase in athlete engagement since the rollout of the digital live-scoring system. "The transparency and speed of updates are game-changers for university sports," noted the Sports Director. "Stay tuned to AllScore for the official match-day highlights and updated standings."
                </p>
              </div>
            </div>

            {/* Interaction Footer */}
            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" className="h-12 w-12 rounded-full p-0 flex items-center justify-center ring-slate-100">
                  <Share2 size={20} className="text-slate-600" />
                </Button>
                <Button variant="ghost" className="h-12 w-12 rounded-full p-0 flex items-center justify-center ring-slate-100">
                  <MessageCircle size={20} className="text-slate-600" />
                </Button>
              </div>
              <Button onClick={onClose} className="rounded-2xl px-8 py-3.5 font-black uppercase tracking-widest text-xs">
                Back to Feed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
