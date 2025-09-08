// src/app/types.ts
import { FC } from "react";
import { MessageSquare, BarChart2, GitCompare, Zap, Info, User, GraduationCap, Search, Anchor, Award } from 'lucide-react';

export type Tab = "chat" | "visualize" | "compare" | "insights" | "about" | "badges";
export type MapTransition = "fly" | "instant";
export type Mode = "researcher" | "newbie";

export interface TabConfig {
  id: Tab;
  label: string;
  icon: FC<any>;
}

export const RESEARCHER_TABS: TabConfig[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "visualize", label: "Harbor", icon: Anchor }, // Changed icon to Anchor
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "insights", label: "Insights", icon: Zap },
  { id: "about", label: "About", icon: Info },
];

export const NEWBIE_TABS: TabConfig[] = [
    { id: "chat", label: "Helper", icon: MessageSquare },
    { id: "visualize", label: "Explore", icon: Search },
    { id: "compare", label: "Distinguish", icon: GitCompare },
    { id: "insights", label: "Info", icon: Zap },
    { id: "about", label: "About", icon: Info },
    { id: "badges", label: "Badges", icon: Award },
];

// Structure for the AI's JSON response
export interface AIMessage {
  text: string;
  graphData?: {
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
    data: Array<{
      name: string;
      x: number[];
      y: number[];
    }>;
  } | null;
}

// NEW: Structure for sending history to the API
export interface HistoryItem {
    role: 'user' | 'model';
    parts: { text: string }[];
}