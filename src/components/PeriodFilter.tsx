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
            <div className="flex-1 glass p-2 rounded-2xl flex items-center group focus-within:ring-2 ring-primary/20 transition-all">
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

            <div className="glass p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-4 px-4 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">من</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartChange(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-600 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">إلى</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndChange(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                    <button
                        type="button"
                        onClick={setPeriodToMonth}
                        className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                    >
                        <CalendarIcon className="w-3.5 h-3.5" /> هذا الشهر
                    </button>
                    <button
                        type="button"
                        onClick={setPeriodToYear}
                        className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                    >
                        <CalendarIcon className="w-3.5 h-3.5" /> هذه السنة
                    </button>
                </div>
            </div>
        </div>
    );
}
