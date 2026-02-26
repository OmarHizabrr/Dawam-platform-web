'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterProps {
    searchValue: string;
    onSearchChange: (val: string) => void;
    placeholder?: string;
}

export default function SearchFilter({
    searchValue,
    onSearchChange,
    placeholder = "بحث..."
}: SearchFilterProps) {
    return (
        <div className="mb-8 lg:w-96">
            <div className="bg-slate-950/40 border border-white/10 p-1.5 rounded-xl flex items-center group focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/50 transition-all shadow-inner">
                <div className="p-2">
                    <Search className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-slate-600 text-[13px] font-medium"
                />
            </div>
        </div>
    );
}
