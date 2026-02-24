'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
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
            // Start a new range
            const newStart = parseTimeIntoDate(day, startTime);
            onChange({ start: newStart, end: null });
        } else {
            // Complete the range
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

    const formatDisplay = () => {
        if (!value.start) return placeholder;
        const startStr = format(value.start, "yyyy-MM-dd HH:mm", { locale: ar });
        if (!value.end) return `${startStr} ← ...`;
        const endStr = format(value.end, "yyyy-MM-dd HH:mm", { locale: ar });
        return `${endStr} ← ${startStr}`;
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
                    "flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200",
                    "bg-slate-900/50 border-white/10 hover:border-primary/50 text-[11px]",
                    isOpen && "border-primary ring-2 ring-primary/20",
                    !value.start && "text-slate-500"
                )}
            >
                <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{formatDisplay()}</span>
                </div>
                {value.start && (
                    <X
                        className="w-3.5 h-3.5 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange({ start: null, end: null });
                        }}
                    />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute z-[100] mt-2 w-[400px] right-0 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row divide-x divide-white/5 divide-x-reverse"
                        style={{ direction: 'rtl' }}
                    >
                        {/* Calendar Part */}
                        <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-5">
                                <button
                                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                                    className="w-8.5 h-8.5 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
                                >
                                    <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
                                </button>
                                <div className="font-black text-base bg-gradient-to-l from-white to-white/60 bg-clip-text text-transparent px-3">
                                    {format(viewDate, "MMMM yyyy", { locale: ar })}
                                </div>
                                <button
                                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                                    className="w-8.5 h-8.5 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
                                >
                                    <ChevronLeft className="w-4.5 h-4.5 text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-3">
                                {DAYS_AR.map(d => (
                                    <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest py-1.5">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1.5">
                                {/* Pad empty days at start of month */}
                                {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {days.map(day => {
                                    const active = isSelected(day);
                                    const ranged = isInRange(day);

                                    return (
                                        <motion.div
                                            key={day.toISOString()}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDayClick(day)}
                                            className={cn(
                                                "aspect-square flex flex-col items-center justify-center rounded-xl text-xs cursor-pointer transition-all relative group",
                                                active ? "bg-primary text-white font-black shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-white/10 hover:text-white",
                                                ranged && !active && "bg-primary/5 text-primary",
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

                        {/* Time Part */}
                        <div className="w-full md:w-36 bg-black/20 p-4 flex flex-col gap-4 backdrop-blur-md">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">الإعدادات الزمنية</h4>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 flex items-center gap-2 px-1">
                                        <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Clock className="w-3 h-3 text-primary" />
                                        </div>
                                        البداية
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => handleStartTimeChange(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-primary outline-none transition-all focus:bg-slate-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 flex items-center gap-2 px-1">
                                        <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center">
                                            <Clock className="w-3 h-3 text-accent" />
                                        </div>
                                        النهاية
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => handleEndTimeChange(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-2.5 text-xs text-white focus:border-primary outline-none transition-all focus:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-white text-slate-950 hover:bg-slate-100 font-black h-9 rounded-lg transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group text-[11px]"
                                >
                                    <Check className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    تأكيد المدى
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
