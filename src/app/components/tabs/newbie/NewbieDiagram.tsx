// src/app/components/tabs/newbie/NewbieDiagram.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, Info, Thermometer, Droplet, Gauge } from 'lucide-react';
import FilterGroup from "../../ui/FilterGroup";
import SidePanel from "../../ui/SidePanel";
import Select from 'react-select';
import { customSelectStyles } from '../../ui/selectStyles';
import { generateMockFloats } from "@/app/services/mockDataService";
import { Tooltip } from 'react-tooltip';
import ClientOnly from "@/app/components/ui/ClientOnly";
import { subDays } from "date-fns";
import { motion } from "framer-motion";

const Map = dynamic(() => import("../../ui/Map"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>,
});

const parameterOptions = [
    { value: "Salinity", label: "Salinity", icon: Droplet, tooltip: "Measures how salty the water is (PSU)." },
    { value: "Temperature", label: "Temperature", icon: Thermometer, tooltip: "Measures water temperature (°C)." },
    { value: "Pressure", label: "Pressure", icon: Gauge, tooltip: "Measures pressure at a certain depth (dbar)." },
];

const regionOptions = [
    { value: "Indian Ocean", label: "Indian Ocean" },
    { value: "Arabian Sea", label: "Arabian Sea" },
    { value: "Bay of Bengal", label: "Bay of Bengal" },
    { value: "Southern Ocean", label: "Southern Ocean" },
    { value: "North Atlantic", label: "North Atlantic" },
    { value: "Pacific Ocean", label: "Pacific Ocean" },
];

const projectNameOptions = [
    { value: "INCOIS", label: "INCOIS" },
    { value: "NOAA", label: "NOAA" },
    { value: "CSIRO", label: "CSIRO" },
    { value: "JAMSTEC", label: "JAMSTEC" },
];

const quickSelectOptions = [
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 90 days" },
];

const regionMap = {
  "Indian Ocean": { center: [0, 80], zoom: 4 },
  "Arabian Sea": { center: [15, 65], zoom: 6 },
  "Bay of Bengal": { center: [10, 90], zoom: 6 },
  "Southern Ocean": { center: [-60, 90], zoom: 3 },
  "North Atlantic": { center: [30, -40], zoom: 4 },
  "Pacific Ocean": { center: [0, -140], zoom: 3 },
};

export default function NewbieDiagram({ floats, filters, handleFilterChange, handleApplyFilters, mapCenter, mapZoom, selectedFloat, regionSummary, onFloatSelect, onDetailClose, theme, mapTransition }) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const mockFloats = useMemo(() => generateMockFloats(75), []);

    const [currentMapCenter, setCurrentMapCenter] = useState(mapCenter || [5, 80]);
    const [currentMapZoom, setCurrentMapZoom] = useState(mapZoom || 4);
    const [currentMapTransition, setCurrentMapTransition] = useState(mapTransition || 'fly');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredFloats = useMemo(() => {
        const { region } = filters;
        const mockRegionalData = {
          "Indian Ocean": [2901234, 2901235, 2901236, 2901237, 2901238, 2901239, 2901240, 2901241],
          "Arabian Sea": [2901234, 2901235],
          "Bay of Bengal": [2901236, 2901237],
          "Southern Ocean": [2901238, 2901239],
          "North Atlantic": [2901240],
          "Pacific Ocean": [2901241],
        };
        const regionFloats = mockRegionalData[region] || mockRegionalData["Indian Ocean"];

        const filtered = mockFloats.filter(f => regionFloats.includes(f.platform_number));

        if (filters.project_name) {
            return filtered.filter(f => f.project_name === filters.project_name);
        }
        
        return filtered;
    }, [filters, mockFloats]);

    const handleFloatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        handleFilterChange(e);
        
        if (value.length > 0) {
            const matchingFloats = filteredFloats.filter(f =>
                f.platform_number.toString().includes(value)
            );
            setSuggestions(matchingFloats.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (floatId: string) => {
      handleFilterChange({ target: { name: 'floatId', value: floatId } });
      setSuggestions([]);
    };

    const handleParamChange = (selectedOption) => {
        handleFilterChange(selectedOption, { name: 'parameter' });
    }

    const updateMapView = (region) => {
        const newMapSettings = regionMap[region] || { center: [0, 80], zoom: 4 };
        setCurrentMapCenter(newMapSettings.center);
        setCurrentMapZoom(newMapSettings.zoom);
        setCurrentMapTransition('fly');
    };

    const handleRegionChange = (selectedOption) => {
        handleFilterChange(selectedOption, { name: 'region' });
    };

    const handleProjectChange = (selectedOption) => {
        handleFilterChange(selectedOption, { name: 'project_name' });
    }

    const handleQuickSelect = (selectedOption) => {
        if (!selectedOption) return;

        const now = new Date();
        let startDate = new Date();
        const endDate = now;

        switch (selectedOption.value) {
            case 'last7':
                startDate = subDays(now, 7);
                break;
            case 'last30':
                startDate = subDays(now, 30);
                break;
            case 'last90':
                startDate = subDays(now, 90);
                break;
        }

        handleFilterChange({ target: { name: 'startDate', value: startDate.toISOString().split('T')[0] } });
        handleFilterChange({ target: { name: 'endDate', value: endDate.toISOString().split('T')[0] } });
    };
    
    const handleApplyFiltersWithAnimation = () => {
        updateMapView(filters.region);
        handleApplyFilters();
    };

    return (
        <section className="grid md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          <aside className="col-span-1 bg-card rounded-xl shadow-lg p-6 flex flex-col space-y-6">
            <h3 className="text-xl font-bold border-b pb-3 text-foreground">Dive Parameters</h3>
            
            {/* Region Filter */}
            <FilterGroup label="Ocean Region">
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="region"
                    options={regionOptions}
                    styles={customSelectStyles}
                    placeholder="Select"
                    isClearable
                    onChange={handleRegionChange}
                    value={regionOptions.find(o => o.value === filters.region) || null}
                />
            </FilterGroup>

            {/* Project Filter */}
            <FilterGroup label="Project Name">
                <Select
                    menuPortalTarget={isMounted ? document.body : null}
                    menuPosition="fixed"
                    name="project_name"
                    options={projectNameOptions}
                    styles={customSelectStyles}
                    placeholder="All Projects"
                    isClearable
                    onChange={handleProjectChange}
                    value={projectNameOptions.find(o => o.value === filters.project_name) || null}
                />
            </FilterGroup>

            {/* Date Range Filters */}
            <div className="space-y-4 pt-4 border-t border-white/10 dark:border-gray-700/50">
                <FilterGroup label="Quick Select">
                    <Select
                        menuPortalTarget={isMounted ? document.body : null}
                        menuPosition="fixed"
                        name="quickSelect"
                        options={quickSelectOptions}
                        styles={customSelectStyles}
                        placeholder="Select date range"
                        isClearable
                        onChange={handleQuickSelect}
                    />
                </FilterGroup>
                <div className="grid grid-cols-1 gap-4">
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
                </div>
            </div>

            {/* Parameter & Float ID filters */}
            <FilterGroup label="What data are you looking for?">
                <div className="flex items-center gap-2">
                    {parameterOptions.map(p => {
                        const Icon = p.icon;
                        const isSelected = filters.parameter === p.value;
                        return (
                            <div key={p.value}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative p-3 rounded-full border transition-all duration-200
                                                ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                                    onClick={() => handleParamChange(isSelected ? null : p)}
                                    data-tooltip-id={`tooltip-${p.value}`}
                                >
                                    <Icon size={20} />
                                </motion.button>
                                <Tooltip id={`tooltip-${p.value}`} content={p.tooltip} />
                            </div>
                        );
                    })}
                </div>
            </FilterGroup>

            <FilterGroup label="Float ID">
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            name="floatId"
                            placeholder="e.g., 2901234"
                            value={filters.floatId}
                            onChange={handleFloatIdChange}
                            className="filter-input pl-4 pr-10"
                        />
                        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                    </div>
                    {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {suggestions.map((float) => (
                                <button
                                    key={float.id}
                                    onClick={() => handleSuggestionClick(float.platform_number.toString())}
                                    className="px-3 py-1.5 text-xs bg-muted/50 text-muted-foreground rounded-full hover:bg-primary/20 transition-colors"
                                >
                                    {float.platform_number}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </FilterGroup>

            <button
              onClick={handleApplyFiltersWithAnimation}
              className="mt-auto w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold
                         hover:bg-primary/90 transition-all transform active:scale-95 active:bg-teal shadow-lg"
            >
              Apply Filters
            </button>
          </aside>
          <div className="col-span-3 bg-card rounded-xl shadow-lg overflow-hidden relative">
            <ClientOnly>
                <Map 
                    center={currentMapCenter} 
                    zoom={currentMapZoom} 
                    selectedFloatId={selectedFloat?.id} 
                    onFloatSelect={onFloatSelect} 
                    transition={currentMapTransition} 
                    floats={filteredFloats} 
                    theme={theme}
                />
            </ClientOnly>
            <SidePanel float={selectedFloat} summary={regionSummary} onClose={onDetailClose} theme={theme} />
          </div>
        </section>
    );
};