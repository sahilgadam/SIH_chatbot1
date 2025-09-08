// src/app/components/ui/Header.tsx
"use client";

import React from "react";
import type { FC } from "react";
// Remove Dices from this import
import { Sun, Moon, MessageSquare, BarChart2, GitCompare, Zap, Info, User, GraduationCap, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { RESEARCHER_TABS, NEWBIE_TABS, Tab, Mode } from "../../types";

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark' | ((theme: 'light' | 'dark') => 'light' | 'dark')) => void;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    mode: Mode;
    onModeToggle: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    // Remove the onSurpriseMe prop
}

const NavIcon: FC = () => (
  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">
    🌊
  </div>
);

export default function Header({ theme, setTheme, activeTab, setActiveTab, mode, onModeToggle, isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const tabs = mode === 'researcher' ? RESEARCHER_TABS : NEWBIE_TABS;

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-card/80 backdrop-blur-xl shadow-2xl border-r border-white/10 dark:border-gray-800/20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 h-16">
        <div className={`flex items-center gap-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <NavIcon />
          <h1 className="text-xl font-bold tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600">FloatChat</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-muted/50">
          {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
            ${activeTab === id 
              ? "bg-sky-800 dark:bg-primary text-white shadow-lg dark:shadow-primary/50 scale-105" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
            `}
          >
            <Icon size={20} />
            <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
          </button>
        ))}
        {/* REMOVED Surprise Me button from here */}
      </nav>

      <div className="p-4 border-t border-white/10 dark:border-gray-800/20 space-y-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2">
            <User size={16} className={`transition-colors duration-300 ${mode === 'newbie' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium transition-colors duration-300 ${mode === 'newbie' ? 'text-foreground' : 'text-muted-foreground'}`}>Newbie</span>
          </div>
          <label htmlFor="mode-toggle" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="mode-toggle" className="sr-only peer" checked={mode === 'researcher'} onChange={onModeToggle} />
            <div className="w-11 h-6 bg-muted/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className={`transition-colors duration-300 ${mode === 'researcher' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-medium transition-colors duration-300 ${mode === 'researcher' ? 'text-foreground' : 'text-muted-foreground'}`}>Researcher</span>
          </div>
        </div>
        <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className={`w-full flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors`}>
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          <span className={`transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}