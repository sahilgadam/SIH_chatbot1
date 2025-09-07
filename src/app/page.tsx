// src/app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LatLngExpression } from "leaflet";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

import Header from "./components/ui/Header";
import WaveAnimation from "./components/ui/WaveAnimation";
import ChatTab from "./components/tabs/ChatTab";
import VisualizeTab from "./components/tabs/VisualizeTab";
import CompareTab from "./components/tabs/CompareTab";
import InsightsTab from "./components/tabs/InsightsTab";
import AboutTab from "./components/tabs/AboutTab";
import NewbieHelper from "./components/tabs/newbie/NewbieHelper";
import TuneModal from "./components/ui/TuneModal";
import { Tab, MapTransition, Mode } from "./types";
import { generateMockFloats } from "./services/mockDataService";
import NewbieDiagram from "./components/tabs/newbie/NewbieDiagram";
import NewBieAbout from "./components/tabs/newbie/NewBieAbout";
import { chatFloats } from "./services/mockDataService";

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("researcher");
  const [activeTab, setActiveTab] = useState<Tab>("visualize");
  const [messages, setMessages] = useState<any[]>([]);
  
  // Floats data
  const allFloats = useMemo(() => generateMockFloats(75), []);
  const [filteredFloats, setFilteredFloats] = useState(allFloats);

  // Map & visuals
  const [selectedVisual, setSelectedVisual] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([5, 80]);
  const [mapZoom, setMapZoom] = useState(4);
  const [selectedFloat, setSelectedFloat] = useState<any>(null);
  const [regionSummary, setRegionSummary] = useState<{ region: string; floats: any[] } | null>(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>("fly");

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    region: "",
    project_name: "",
    floatId: "",
    year: "",
    month: "",
  });
  const [isChatting, setIsChatting] = useState(false);
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [isTuneModalOpen, setIsTuneModalOpen] = useState(false);
  const [showTuningAnimation, setShowTuningAnimation] = useState(false);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Blur effect
  useEffect(() => {
    const bg = document.getElementById("bg-canvas");
    if (!bg) return;
    const blurTabs = ["visualize", "compare", "insights"];
    if (blurTabs.includes(activeTab) || (activeTab === "chat" && isChatting)) {
      bg.style.filter = "blur(12px) brightness(0.8)";
    } else {
      bg.style.filter = "none";
    }
  }, [activeTab, isChatting, selectedVisual]);

  // Sidebar toggle for selected visuals
  useEffect(() => {
    setIsSidebarOpen(selectedVisual === null);
  }, [selectedVisual]);

  // Animation cleanup
  useEffect(() => {
    if (showWaveAnimation) {
      const timer = setTimeout(() => setShowWaveAnimation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWaveAnimation]);

  const handleModeToggle = () => {
    setShowWaveAnimation(true);
    setMode((prev) => (prev === "researcher" ? "newbie" : "researcher"));
    setActiveTab("chat");
    setMessages([]);
    setIsChatting(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsChatting(false);
  };

  const handleFloatSelect = (float: any) => {
    setMapTransition("fly");
    setRegionSummary(null);
    setSelectedFloat(float);
    setMapCenter(float.position);
    setMapZoom(7);
  };

  // Handles both normal inputs and react-select
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    actionMeta?: any
  ) => {
    if (actionMeta && actionMeta.name) {
      const { name } = actionMeta;
      const value = e ? (e as any).value : "";
      setFilters((prev) => ({ ...prev, [name]: value }));
    } else if (e) {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = () => {
    setShowTuningAnimation(true);
    setTimeout(() => setShowTuningAnimation(false), 1500);

    let newFilteredFloats = [...allFloats];
    if (filters.floatId) {
      const targetFloat = allFloats.find(
        (f) => f.platform_number.toString() === filters.floatId
      );
      newFilteredFloats = targetFloat ? [targetFloat] : [];
    } else {
      if (filters.project_name) {
        newFilteredFloats = newFilteredFloats.filter(
          (f) => f.project_name === filters.project_name
        );
      }
      if (filters.startDate) {
        newFilteredFloats = newFilteredFloats.filter(
          (f) => f.date >= filters.startDate
        );
      }
      if (filters.endDate) {
        newFilteredFloats = newFilteredFloats.filter(
          (f) => f.date <= filters.endDate
        );
      }
    }

    setFilteredFloats(newFilteredFloats);

    if (newFilteredFloats.length === 1) {
      handleFloatSelect(newFilteredFloats[0]);
    } else {
      setSelectedFloat(null);
      setMapCenter([5, 80]);
      setMapZoom(4);
      setRegionSummary({
        region: "Filtered Results",
        floats: newFilteredFloats,
      });
    }
    setMapTransition("fly");
  };

  const handleDetailClose = () => {
    setSelectedFloat(null);
    setRegionSummary(null); // This is the crucial line to add
  };

  const renderDashboard = () => {
    if (mode === "researcher") {
      switch (activeTab) {
        case "chat":
          return (
            <ChatTab
              messages={messages}
              setMessages={setMessages}
              theme={theme}
              handleNewChat={handleNewChat}
              setIsChatting={setIsChatting}
              filters={filters}
              setFilters={setFilters}
            />
          );
        case "visualize":
          return (
            <VisualizeTab
              floats={filteredFloats}
              filters={filters}
              setFilters={setFilters}
              handleApplyFilters={handleApplyFilters}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              selectedFloat={selectedFloat}
              regionSummary={regionSummary}
              onFloatSelect={handleFloatSelect}
              onDetailClose={handleDetailClose}
              theme={theme}
              mapTransition={mapTransition}
            />
          );
        case "compare":
          return <CompareTab theme={theme} />;
        case "insights":
          return <InsightsTab theme={theme} />;
        case "about":
          return <AboutTab />;
        default:
          return null;
      }
    }

    // Newbie mode
    switch (activeTab) {
      case "chat":
        return (
          <NewbieHelper
            messages={messages}
            setMessages={setMessages}
            theme={theme}
            handleNewChat={handleNewChat}
            setIsChatting={setIsChatting}
          />
        );
      case "visualize":
        return (
          <NewbieDiagram
            floats={filteredFloats}
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleApplyFilters={handleApplyFilters}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            selectedFloat={selectedFloat}
            regionSummary={regionSummary}
            onFloatSelect={handleFloatSelect}
            onDetailClose={handleDetailClose}
            theme={theme}
            mapTransition={mapTransition}
          />
        );
      case "compare":
        return <CompareTab theme={theme} />;
      case "insights":
        return <InsightsTab theme={theme} />;
      case "about":
        return <NewBieAbout />;
      default:
        return null;
    }
  };

  const isTuningActive = filters.year || filters.month;

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <Header
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={(tab: Tab) => setActiveTab(tab)}
        mode={mode}
        onModeToggle={handleModeToggle}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {showWaveAnimation && <WaveAnimation />}

      <TuneModal
        isOpen={isTuneModalOpen}
        onClose={() => setIsTuneModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
      />

      <main
        className={`flex-1 p-4 sm:p-6 md:p-8 relative transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <div className="absolute top-6 right-6 z-20">
          <motion.button
            onClick={() => setIsTuneModalOpen(true)}
            className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
              isTuningActive
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground"
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            title="Tune Data Context"
          >
            <SlidersHorizontal size={20} />
          </motion.button>
          {showTuningAnimation && (
            <motion.div
              className="absolute top-1/2 left-1/2 w-32 h-32"
              initial={{ opacity: 1, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                borderRadius: "50%",
                border: "2px solid var(--primary)",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>

        <div className="flex h-full">
          <section className="flex-1 h-full">{renderDashboard()}</section>
        </div>
      </main>
    </div>
  );
}