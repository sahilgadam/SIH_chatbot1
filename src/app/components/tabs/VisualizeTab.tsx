// src/app/components/tabs/VisualizeTab.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Search, Loader, SlidersHorizontal } from "lucide-react";
import SidePanel from "../ui/SidePanel";
import FilterGroup from "../ui/FilterGroup";
import TuningIndicator from "../ui/TuningIndicator";
import Select from "react-select";
import { customSelectStyles } from "../ui/selectStyles";
import ClientOnly from "@/app/components/ui/ClientOnly";


const Map = dynamic(() => import("../ui/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p>Loading map...</p>
    </div>
  ),
});

// Options for react-select
const regionOptions = [
  { value: "Indian Ocean", label: "Indian Ocean" },
  { value: "North Atlantic", label: "North Atlantic" },
  { value: "Southern Ocean", label: "Southern Ocean" },
  { value: "Pacific Ocean", label: "Pacific Ocean" },
];
const parameterOptions = [
  { value: "Salinity", label: "Salinity" },
  { value: "Temperature", label: "Temperature" },
  { value: "Pressure", label: "Pressure" },
];
const dataModeOptions = [
  { value: "R", label: "Real-time (R)" },
  { value: "D", label: "Delayed-mode (D)" },
];
const directionOptions = [
  { value: "A", label: "Ascending (A)" },
  { value: "D", label: "Descending (D)" },
];
const projectNameOptions = [
  { value: "INCOIS", label: "INCOIS" },
  { value: "NOAA", label: "NOAA" },
  { value: "CSIRO", label: "CSIRO" },
  { value: "JAMSTEC", label: "JAMSTEC" },
];

const regionMap = {
  "Indian Ocean": { center: [0, 80], zoom: 4 },
  "Equatorial Region": { center: [0, 80], zoom: 5 },
  "North Atlantic": { center: [30, -40], zoom: 4 },
  "Southern Ocean": { center: [-60, 90], zoom: 3 },
  "Pacific Ocean": { center: [0, -140], zoom: 3 },
};

export default function VisualizeTab({
  floats,
  filters,
  setFilters,
  handleApplyFilters,
  mapCenter,
  mapZoom,
  selectedFloat,
  regionSummary,
  onFloatSelect,
  onDetailClose,
  theme,
  mapTransition,
}) {
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualFilters, setShowManualFilters] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Local state to manage the map view
  const [currentMapCenter, setCurrentMapCenter] = useState(mapCenter);
  const [currentMapZoom, setCurrentMapZoom] = useState(mapZoom);
  const [currentMapTransition, setCurrentMapTransition] = useState(mapTransition);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hybrid filter handler: works with react-select and native inputs
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | null,
    actionMeta?: any
  ) => {
    if (actionMeta && actionMeta.name) {
      const { name } = actionMeta;
      const value = e ? (e as any).value : "";
      setFilters((prev: any) => ({ ...prev, [name]: value }));
    } else if (e) {
      const { name, value } = e.target;
      setFilters((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleFloatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleFilterChange(e);

    if (value.length > 0) {
      const matchingFloats = floats.filter((float: any) =>
        float.platform_number.toString().includes(value)
      );
      setSuggestions(matchingFloats);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (floatId: string) => {
    setFilters((prev: any) => ({ ...prev, floatId }));
    setSuggestions([]);
  };

  // AI command submit
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/map-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to parse command.");
      }

      const parsedFilters = await response.json();
      setFilters((prev: any) => ({ ...prev, ...parsedFilters }));

      setTimeout(() => {
        handleApplyFilters();
      }, 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFiltersWithAnimation = () => {
    const newMapSettings = regionMap[filters.region] || { center: [0, 80], zoom: 3 };
    setCurrentMapCenter(newMapSettings.center);
    setCurrentMapZoom(newMapSettings.zoom);
    setCurrentMapTransition('fly');
    
    // Call the parent's apply filters function after triggering the animation
    handleApplyFilters();
  };


  return (
    <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
        {/* AI Command Bar */}
        <div className="relative z-10 mb-6">
          <h3 className="text-xl font-bold border-b pb-3 text-foreground mb-4">Directive</h3>
          <form onSubmit={handleCommandSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., Show INCOIS floats from June 2022..."
              className="w-full pl-12 pr-12 py-3 bg-background border border-primary/20 rounded-full shadow-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="submit"
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:bg-muted"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
          {error && (
            <p className="text-center text-red-500 text-sm mt-2 bg-card/80 p-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        {/* Manual Filters */}
        <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 grid grid-cols-1 gap-4">
          <h3 className="text-xl font-bold border-b pb-3 text-foreground mb-2">Observation Lens</h3>
          {/* Dates */}
          <FilterGroup label="Start Date">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="styled-input"
            />
          </FilterGroup>
          <FilterGroup label="End Date">
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="styled-input"
            />
          </FilterGroup>

          {/* React-select advanced filters */}
          <FilterGroup label="Region">
            <ClientOnly>
                <Select
                  menuPortalTarget={isMounted ? document.body : null}
                  menuPosition="fixed"
                  name="region"
                  options={regionOptions}
                  styles={customSelectStyles}
                  placeholder="Select"
                  isClearable
                  onChange={handleFilterChange}
                  value={
                    regionOptions.find((o) => o.value === filters.region) || null
                  }
                />
            </ClientOnly>
          </FilterGroup>
          <FilterGroup label="Parameter">
            <ClientOnly>
                <Select
                  menuPortalTarget={isMounted ? document.body : null}
                  menuPosition="fixed"
                  name="parameter"
                  options={parameterOptions}
                  styles={customSelectStyles}
                  placeholder="Select"
                  isClearable
                  onChange={handleFilterChange}
                  value={
                    parameterOptions.find((o) => o.value === filters.parameter) ||
                    null
                  }
                />
            </ClientOnly>
          </FilterGroup>
          <FilterGroup label="Data Mode">
            <ClientOnly>
                <Select
                  menuPortalTarget={isMounted ? document.body : null}
                  menuPosition="fixed"
                  name="data_mode"
                  options={dataModeOptions}
                  styles={customSelectStyles}
                  placeholder="Select"
                  isClearable
                  onChange={handleFilterChange}
                  value={
                    dataModeOptions.find((o) => o.value === filters.data_mode) ||
                    null
                  }
                />
            </ClientOnly>
          </FilterGroup>
          <FilterGroup label="Profiling Direction">
            <ClientOnly>
                <Select
                  menuPortalTarget={isMounted ? document.body : null}
                  menuPosition="fixed"
                  name="direction"
                  options={directionOptions}
                  styles={customSelectStyles}
                  placeholder="Select"
                  isClearable
                  onChange={handleFilterChange}
                  value={
                    directionOptions.find((o) => o.value === filters.direction) ||
                    null
                  }
                />
            </ClientOnly>
          </FilterGroup>
          <FilterGroup label="Cycle Number">
            <input
              type="text"
              name="cycle_number"
              placeholder="e.g., 15"
              value={filters.cycle_number || ""}
              onChange={handleFilterChange}
              className="styled-input"
            />
          </FilterGroup>
          <FilterGroup label="Project Name">
            <ClientOnly>
                <Select
                  menuPortalTarget={isMounted ? document.body : null}
                  menuPosition="fixed"
                  name="project_name"
                  options={projectNameOptions}
                  styles={customSelectStyles}
                  placeholder="Select"
                  isClearable
                  onChange={handleFilterChange}
                  value={
                    projectNameOptions.find(
                      (o) => o.value === filters.project_name
                    ) || null
                  }
                />
            </ClientOnly>
          </FilterGroup>
          <FilterGroup label="Float ID">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  name="floatId"
                  placeholder="Search by ID..."
                  value={filters.floatId}
                  onChange={handleFloatIdChange}
                  className="styled-input pl-10"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-card border border-muted-foreground/20 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.map((float: any) => (
                    <li
                      key={float.id}
                      onClick={() =>
                        handleSuggestionClick(
                          float.platform_number.toString()
                        )
                      }
                      className="p-3 hover:bg-muted/50 cursor-pointer text-sm"
                    >
                      {float.platform_number}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FilterGroup>

          <button
            onClick={handleApplyFiltersWithAnimation}
            className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform active:scale-95 active:bg-teal shadow-lg"
          >
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Map Area */}
      <div className="relative col-span-3 bg-card rounded-xl shadow-lg overflow-hidden flex-1">
        <TuningIndicator year={filters.year} month={filters.month} />
        <ClientOnly>
          <Map
            center={currentMapCenter}
            zoom={currentMapZoom}
            selectedFloatId={selectedFloat?.id}
            onFloatSelect={onFloatSelect}
            transition={currentMapTransition}
            floats={floats}
            theme={theme}
          />
        </ClientOnly>
        <SidePanel
          float={selectedFloat}
          summary={regionSummary}
          onClose={onDetailClose}
          theme={theme}
        />
      </div>
    </section>
  );
}