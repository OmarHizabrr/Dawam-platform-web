'use client';

import React from 'react';
import { Search, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeriodFilterProps {
    startDate: string;
    endDate: string;
    onStartChange: (val: string) => void;
    onEndChange: (val: string) => void;
    searchValue?: string;
    onSearchChange?: (val: string) => void;
    onApplyMonth?: () => void;
    onApplyYear?: () => void;
    searchPlaceholder?: string;
}

export default function PeriodFilter({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    searchValue,
    onSearchChange,
    onApplyMonth,
    onApplyYear,
    searchPlaceholder = "بحث..."
}: PeriodFilterProps) {

    const setPeriodToMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        onStartChange(start.toISOString().split('T')[0]);
        onEndChange(end.toISOString().split('T')[0]);
        if (onApplyMonth) onApplyMonth();
    };

    const setPeriodToYear = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        onStartChange(start.toISOString().split('T')[0]);
        onEndChange(end.toISOString().split('T')[0]);
        if (onApplyYear) onApplyYear();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
            <div className="flex-1 bg-slate-950/40 border border-white/10 p-2 rounded-2xl flex items-center group focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/50 transition-all shadow-inner">
                <div className="p-3">
                    <Search className="w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-slate-500 font-medium"
                />
            </div>

            <div className="bg-slate-950/40 border border-white/10 p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-inner">
                <div className="flex items-center gap-4 px-4 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">من</span>
                        <div className="relative group">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartChange(e.target.value)}
                                className="bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2 text-[12px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer shadow-inner appearance-none"
                            />
                        </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-700 hidden sm:block flex-shrink-0" />
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">إلى</span>
                        <div className="relative group">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndChange(e.target.value)}
                                className="bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2 text-[12px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all cursor-pointer shadow-inner appearance-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-slate-950/60 rounded-xl border border-white/10 shadow-inner">
                    <button
                        type="button"
                        onClick={setPeriodToMonth}
                        className="px-5 py-2 text-[10px] font-black text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                        <CalendarIcon className="w-3.5 h-3.5" /> هذا الشهر
                    </button>
                    <button
                        type="button"
                        onClick={setPeriodToYear}
                        className="px-5 py-2 text-[10px] font-black text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                        <CalendarIcon className="w-3.5 h-3.5" /> هذه السنة
                    </button>
                </div>
            </div>
        </div>
    );
}
