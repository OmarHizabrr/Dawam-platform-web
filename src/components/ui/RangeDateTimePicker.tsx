'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, X, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DateTimeRange {
    start: Date | null;
    end: Date | null;
}

interface RangeDateTimePickerProps {
    value: DateTimeRange;
    onChange: (value: DateTimeRange) => void;
    placeholder?: string;
}

const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

export default function RangeDateTimePicker({ value, onChange, placeholder = "اختر الفترة..." }: RangeDateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value.start || new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    const [startTime, setStartTime] = useState(value.start ? format(value.start, "HH:mm") : "08:00");
    const [endTime, setEndTime] = useState(value.end ? format(value.end, "HH:mm") : "16:00");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const days = eachDayOfInterval({
        start: startOfMonth(viewDate),
        end: endOfMonth(viewDate),
    });

    const handleDayClick = (day: Date) => {
        if (!value.start || (value.start && value.end)) {
            const newStart = parseTimeIntoDate(day, startTime);
            onChange({ start: newStart, end: null });
        } else {
            if (day < value.start) {
                const newStart = parseTimeIntoDate(day, startTime);
                onChange({ start: newStart, end: null });
            } else {
                const newEnd = parseTimeIntoDate(day, endTime);
                onChange({ ...value, end: newEnd });
            }
        }
    };

    const parseTimeIntoDate = (date: Date, timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(h, m, 0, 0);
        return newDate;
    };

    const handleStartTimeChange = (time: string) => {
        setStartTime(time);
        if (value.start) {
            onChange({ ...value, start: parseTimeIntoDate(value.start, time) });
        }
    };

    const handleEndTimeChange = (time: string) => {
        setEndTime(time);
        if (value.end) {
            onChange({ ...value, end: parseTimeIntoDate(value.end, time) });
        }
    };

    const isSelected = (day: Date) => {
        if (value.start && isSameDay(day, value.start)) return true;
        if (value.end && isSameDay(day, value.end)) return true;
        return false;
    };

    const isInRange = (day: Date) => {
        if (value.start && value.end) {
            return isWithinInterval(day, { start: value.start, end: value.end });
        }
        return false;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group flex items-center gap-3 px-4 h-11 rounded-xl border transition-all duration-500 cursor-pointer overflow-hidden",
                    "bg-slate-950/40 border-white/10 hover:border-primary/40 shadow-inner",
                    isOpen && "border-primary/50 ring-4 ring-primary/5 bg-slate-900/80 backdrop-blur-xl"
                )}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 flex-shrink-0",
                        value.start ? "bg-primary/20 text-primary shadow-lg shadow-primary/10" : "bg-white/5 text-slate-500"
                    )}>
                        <CalendarIcon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        {value.start ? (
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-[12px] font-black text-white whitespace-nowrap">{format(value.start, "yyyy-MM-dd", { locale: ar })}</span>
                                <ArrowLeft className="w-3 h-3 text-slate-700 flex-shrink-0" />
                                <span className="text-[12px] font-black text-white whitespace-nowrap">
                                    {value.end ? format(value.end, "yyyy-MM-dd", { locale: ar }) : '...'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-[12px] font-black text-slate-500 truncate">{placeholder}</span>
                        )}
                    </div>
                </div>

                {value.start && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange({ start: null, end: null });
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 transition-all flex-shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute z-[110] mt-3 w-[calc(100vw-2rem)] md:w-[460px] left-0 md:right-0 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 divide-x-reverse"
                        style={{ direction: 'rtl' }}
                    >
                        {/* Calendar Part */}
                        <div className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                                    className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all border border-white/10"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                </button>
                                <div className="font-black text-[15px] bg-gradient-to-l from-white to-white/40 bg-clip-text text-transparent px-3 uppercase tracking-wider">
                                    {format(viewDate, "MMMM yyyy", { locale: ar })}
                                </div>
                                <button
                                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                                    className="w-9 h-9 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all border border-white/10"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {DAYS_AR.map(d => (
                                    <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest py-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {days.map(day => {
                                    const active = isSelected(day);
                                    const ranged = isInRange(day);

                                    return (
                                        <motion.div
                                            key={day.toISOString()}
                                            whileTap={{ scale: 0.92 }}
                                            onClick={() => handleDayClick(day)}
                                            className={cn(
                                                "aspect-square flex flex-col items-center justify-center rounded-xl text-[12px] cursor-pointer transition-all relative",
                                                active ? "bg-primary text-white font-black shadow-xl shadow-primary/30 z-10" : "text-slate-400 hover:bg-white/5 hover:text-white",
                                                ranged && !active && "bg-primary/10 text-primary font-bold",
                                                !isSameMonth(day, viewDate) && "opacity-20 pointer-events-none"
                                            )}
                                        >
                                            {format(day, "d")}
                                            {isSameDay(day, new Date()) && !active && (
                                                <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Settings Part */}
                        <div className="w-full md:w-44 bg-white/[0.02] p-6 flex flex-col gap-6">
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                        <Clock className="w-3 h-3 text-primary" /> وقت البدء
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => handleStartTimeChange(e.target.value)}
                                        className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[13px] text-white focus:border-primary outline-none transition-all font-black shadow-inner"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                                        <Clock className="w-3 h-3 text-accent" /> وقت النهاية
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => handleEndTimeChange(e.target.value)}
                                        className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[13px] text-white focus:border-primary outline-none transition-all font-black shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-primary text-white hover:bg-primary/90 font-black h-11 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-[12px] active:scale-95"
                                >
                                    <Check className="w-4 h-4" /> حفظ النطاق الزمني
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
