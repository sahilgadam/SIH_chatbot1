// src/app/components/tabs/ResearcherCompare.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";

import { Download, Printer, ChevronDown, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { usePreviewMetric, PreviewMetric as DataType } from './usePreviewMetric';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type FloatSeries = {
  id: string;
  temps: number[];
  salinity: number[];
  humidity: number[];
  color?: string;
  emoji?: string;
};

type Props = {
  theme?: "light" | "dark";
  floats?: FloatSeries[];
  depths?: number[];
};

const defaultDepths = [0, 50, 100, 200, 400, 600, 800, 1000];

const oceanPresets: Record<string, FloatSeries[]> = {
  Atlantic: [
      { id: "AT-98765 (Warm Core)", temps: [26, 24, 21, 16, 11, 8, 6, 5], salinity: [35.5, 35.6, 35.7, 35.4, 35.2, 35.0, 34.8, 34.7], humidity: [85, 82, 78, 75, 72, 70, 68, 65], color: "#FF7F50", emoji: "🔥" },
      { id: "AT-12345 (Cold Front)", temps: [19, 18, 16, 14, 11, 8, 6, 5], salinity: [34.8, 34.9, 35.0, 35.1, 35.0, 34.9, 34.8, 34.7], humidity: [92, 90, 88, 85, 83, 80, 78, 75], color: "#1E90FF", emoji: "❄️" },
      { id: "AT-54321 (Standard)", temps: [22, 21, 19, 15, 12, 9, 7, 6], salinity: [35.1, 35.2, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8], humidity: [88, 86, 84, 82, 80, 78, 76, 74], color: "#32CD32", emoji: "🌊" }
  ],
  Pacific: [
    { id: "PX-10234 (Warm Core)", temps: [27, 25, 22, 17, 12, 9, 7, 6], salinity: [34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2], humidity: [82, 80, 77, 74, 71, 69, 67, 64], color: "#FF7F50", emoji: "🔥" },
    { id: "PX-20456 (Upwelling)", temps: [16, 15, 14, 12, 10, 8, 6, 5], salinity: [33.8, 33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5], humidity: [95, 93, 91, 89, 87, 85, 83, 81], color: "#1E90FF", emoji: "❄️" },
    { id: "PX-30987 (Typical)", temps: [21, 19, 17, 14, 11, 9, 7, 6], salinity: [34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9], humidity: [90, 88, 86, 84, 82, 80, 78, 76], color: "#32CD32", emoji: "🌊" }
  ],
  Indian: [
    { id: "IN-55678 (Warm)", temps: [28, 26, 23, 18, 13, 10, 8, 7], salinity: [36.0, 36.1, 36.2, 36.1, 35.9, 35.7, 35.5, 35.4], humidity: [80, 78, 75, 72, 70, 68, 66, 63], color: "#FF7F50", emoji: "🔥" },
    { id: "IN-66778 (Cool Patch)", temps: [18, 17, 15, 13, 11, 9, 7, 6], salinity: [35.2, 35.3, 35.4, 35.3, 35.2, 35.1, 35.0, 34.9], humidity: [93, 91, 89, 86, 84, 81, 79, 77], color: "#1E90FF", emoji: "❄️" },
    { id: "IN-77889 (Baseline)", temps: [23, 21, 19, 15, 12, 10, 8, 7], salinity: [35.5, 35.6, 35.7, 35.6, 35.4, 35.2, 35.1, 35.0], humidity: [87, 85, 83, 81, 79, 77, 75, 73], color: "#32CD32", emoji: "🌊" }
  ],
  Southern: [
    { id: "SO-00123 (Cold Core)", temps: [10, 9, 8, 7, 6, 5, 4, 3], salinity: [33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6], humidity: [98, 96, 94, 92, 90, 88, 86, 84], color: "#1E90FF", emoji: "❄️" },
    { id: "SO-00987 (Mixed)", temps: [14, 13, 12, 10, 9, 8, 6, 5], salinity: [34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8], humidity: [94, 92, 90, 88, 86, 84, 82, 80], color: "#32CD32", emoji: "🌊" }
  ],
  Arctic: [
    { id: "AR-90001 (Cold Surface)", temps: [4, 3.8, 3.5, 3.2, 3.0, 2.8, 2.6, 2.5], salinity: [32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7], humidity: [99, 98, 97, 96, 95, 94, 93, 92], color: "#1E90FF", emoji: "❄️" },
    { id: "AR-90002 (Standard)", temps: [5, 4.6, 4.2, 3.9, 3.6, 3.4, 3.1, 3.0], salinity: [32.5, 32.6, 32.7, 32.8, 32.9, 33.0, 33.1, 33.2], humidity: [97, 96, 95, 94, 93, 92, 91, 90], color: "#32CD32", emoji: "🌊" }
  ]
};

const CustomSelect = ({ options, value, onChange, ariaLabel }: { options: string[]; value: string; onChange: (value: string) => void; ariaLabel: string; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
  }

  return (
    <div className="relative w-36" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-1.5 border rounded-md bg-background text-foreground border-border text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-card/80 backdrop-blur-md border border-border rounded-md shadow-lg overflow-hidden animate-fade-in-scale"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((option: string) => (
            <li
              key={option}
              className="px-3 py-2 text-sm text-foreground hover:bg-primary/20 cursor-pointer"
              onClick={() => handleSelect(option)}
              onKeyPress={(e) => e.key === 'Enter' && handleSelect(option)}
              tabIndex={0}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const KeyTakeawaysPanel = ({ stats, visibleIds, dataType }: { stats: any[]; visibleIds: string[]; dataType: DataType; }) => {
    const visibleStats = stats.filter(s => visibleIds.includes(s.id));
    const warmFloat = visibleStats.find(s => s.type.includes('Warm'));
    const coldFloat = visibleStats.find(s => s.type.includes('Cold'));

    const getUnit = (type: DataType) => {
        switch(type) {
            case 'Temperature': return '°C';
            case 'Salinity': return 'PSU';
            case 'Humidity': return '%';
            default: return '';
        }
    }

    return (
        <div className="bg-card rounded-xl p-4 border border-border shadow-lg" aria-labelledby="takeaways-header">
            <h3 id="takeaways-header" className="text-base font-semibold mb-3 text-foreground">Key Takeaways</h3>
            <div className="space-y-4 pt-3 border-t border-border">
                <div className="text-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0"/>
                            <span>Warm Core Anomaly</span>
                        </div>
                        <span className={`font-mono text-xs px-2 py-1 rounded-md ${warmFloat ? 'bg-orange-500/20 text-orange-300' : 'bg-muted text-muted-foreground'}`}>
                            {warmFloat ? `${warmFloat.surface.toFixed(1)}${getUnit(dataType)}` : 'N/A'}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-6">Indicates a potential eddy or unusual surface heating. Float {warmFloat ? warmFloat.id.split(' ')[0] : ''} is the primary subject for this event.</p>
                </div>
                <div className="text-sm">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <Info className="h-4 w-4 text-blue-400 shrink-0"/>
                            <span>Cold Intrusion</span>
                        </div>
                         <span className={`font-mono text-xs px-2 py-1 rounded-md ${coldFloat ? 'bg-blue-500/20 text-blue-300' : 'bg-muted text-muted-foreground'}`}>
                            {coldFloat ? `${coldFloat.surface.toFixed(1)}${getUnit(dataType)}` : 'N/A'}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-6">Suggests upwelling or the influence of a cold front, observed in float {coldFloat ? coldFloat.id.split(' ')[0] : ''}.</p>
                </div>
                <div className="text-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <CheckCircle className="h-4 w-4 text-green-400 shrink-0"/>
                            <span>Deep Water Stability</span>
                        </div>
                        <span className="font-mono text-xs px-2 py-1 rounded-md bg-green-500/20 text-green-300">
                            High
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground pl-6">All active floats show convergence to a stable profile at deeper levels, indicating regional uniformity.</p>
                </div>
            </div>
        </div>
    );
};


/* Component */
export default function ResearcherCompare({ theme = "light", floats: floatsProp, depths: depthsProp }: Props) {
  const { previewMetric: dataType, setPreviewMetric: setDataType } = usePreviewMetric();
  const depths = depthsProp ?? defaultDepths;
  const [ocean, setOcean] = useState<string>("Atlantic");
  const floatsFromPreset = floatsProp ?? oceanPresets[ocean] ?? oceanPresets["Atlantic"];
  const [visibleIds, setVisibleIds] = useState<string[]>(floatsFromPreset.map((f) => f.id));
  const [smoothCurves, setSmoothCurves] = useState<boolean>(true);
  const [showThermoclineBand, setShowThermoclineBand] = useState<boolean>(true);
  const [thermoclineRange, setThermoclineRange] = useState<{ min: number; max: number }>({ min: 50, max: 300 });
  const [plotReady, setPlotReady] = useState<boolean>(false);
  const [animatedTraces, setAnimatedTraces] = useState<any[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [depthRange, setDepthRange] = useState<{ min: number; max: number }>({ min: Math.min(...depths), max: Math.max(...depths) });
  
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setVisibleIds(floatsFromPreset.map((f) => f.id));
    setPlotReady(false);
  }, [ocean, floatsProp]);

  useEffect(() => {
    if (dataType) {
        setStatusMessage(`Now showing: ${dataType} (${getUnit(dataType)})`);
    }
  }, [dataType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    const currentRef = tabRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, []);

  useEffect(() => {
    if (isIntersecting && !plotReady) {
      const timer = setTimeout(() => setPlotReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, plotReady, ocean, dataType]);

  function mean(arr: number[]) {
    if (arr.length === 0) return NaN;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  const dataKeyMap: Record<DataType, keyof Omit<FloatSeries, 'id' | 'color' | 'emoji'>> = {
      Temperature: 'temps',
      Salinity: 'salinity',
      Humidity: 'humidity',
  };
  const dataKey = dataKeyMap[dataType];
  
  const stats = useMemo(() => {
    console.debug('[ComparisonDetails] previewMetric=', dataType);
    return floatsFromPreset.map((f) => ({
      id: f.id,
      type: f.id.match(/\((.*?)\)/)?.[1] || 'Standard',
      surface: (f[dataKey] as number[])[0],
      min: Math.min(...(f[dataKey] as number[])),
      max: Math.max(...(f[dataKey] as number[])),
      mean: Number(mean(f[dataKey] as number[]).toFixed(2)),
      color: f.color,
      emoji: f.emoji
    }));
  }, [floatsFromPreset, dataKey, dataType]);

  const xAll = floatsFromPreset.flatMap((f) => f[dataKey] as number[]);
  const xMin = Math.floor(Math.min(...xAll) - 2);
  const xMax = Math.ceil(Math.max(...xAll) + 2);

  const baseTraces = useMemo(() => {
     console.debug('[Chart] previewMetric=', dataType);
     const filteredData = depths
      .map((depth, index) => ({ depth, index }))
      .filter(({ depth }) => depth >= depthRange.min && depth <= depthRange.max);
      
    return floatsFromPreset
      .filter((f) => visibleIds.includes(f.id))
      .map((f) => {
        const isHighlighted = highlightedId === f.id;
        const xData = f[dataKey] as number[];
        const x = filteredData.map(({ index }) => xData[index]);
        const y = filteredData.map(({ depth }) => depth);

        return {
          x,
          y,
          name: f.id,
          mode: "lines+markers", 
          type: "scatter" as const,
          hoverinfo: 'none', 
          marker: {
            size: isHighlighted ? 11 : 8,
            symbol: 'circle',
            line: { width: 2.5, color: theme === 'dark' ? '#0f172a' : '#FFFFFF' },
            color: f.color,
            opacity: 1
          },
          line: { 
            color: f.color, 
            width: isHighlighted ? 4 : 3, 
            shape: smoothCurves ? 'spline' : 'linear', 
            smoothing: 1.3 
          },
          filter: 'url(#glow)',
        };
      });
  }, [floatsFromPreset, visibleIds, highlightedId, theme, depths, depthRange, dataKey, smoothCurves, dataType]);

  useEffect(() => {
    if (!plotReady || !isIntersecting) {
      setAnimatedTraces([]);
      return;
    }

    if (prefersReducedMotion) {
      setAnimatedTraces(baseTraces);
      return;
    }

    const maxLen = Math.max(0, ...baseTraces.map(t => t.x.length));
    let frame = 0;
    let animationFrameId: number;

    const animate = () => {
      frame++;
      if (frame <= maxLen) {
        setAnimatedTraces(baseTraces.map(trace => ({
          ...trace,
          x: trace.x.slice(0, frame),
          y: trace.y.slice(0, frame),
          mode: 'lines+markers',
        })));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatedTraces(baseTraces);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [plotReady, isIntersecting, baseTraces, prefersReducedMotion]);
  
  const getUnit = (type: DataType) => {
    switch(type) {
        case 'Temperature': return '°C';
        case 'Salinity': return 'PSU';
        case 'Humidity': return '%';
        default: return '';
    }
  }

  const shapes: any[] = [];
  if (showThermoclineBand && dataType === 'Temperature') {
    shapes.push({
      type: "rect", xref: "x", yref: "y", x0: xMin, x1: xMax,
      y0: thermoclineRange.min, y1: thermoclineRange.max,
      fillcolor: "rgba(135, 206, 235, 0.1)",
      line: { width: 1, color: 'rgba(135, 206, 235, 0.3)', dash: 'dash' },
      layer: "below"
    });
  }

  const layout: any = {
    title: { 
        text: `<b>${ocean} Ocean:</b> ${dataType} vs. Depth Profile`, 
        font: { size: 16, family: "Inter, sans-serif", color: theme === 'dark' ? '#E2E8F0' : '#0F172A' },
        x: 0.04, xanchor: 'left', y: 0.95, yanchor: 'top',
    },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: theme === 'dark' ? "#94a3b8" : '#475569', family: "Inter, sans-serif" },
    xaxis: {
      title: { text: `${dataType} (${getUnit(dataType)})`, font: { size: 14 } }, range: [xMin, xMax],
      gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zeroline: false, dtick: 4, tickfont: { size: 12 },
      showline: false,
    },
    yaxis: {
      title: { text: "Depth (m)", font: { size: 14 } }, autorange: "reversed",
      gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      zeroline: false, tickfont: { size: 12 },
      showline: false,
    },
    showlegend: false,
    margin: { l: 70, r: 20, t: 70, b: 60 },
    hovermode: "x unified",
    shapes: shapes,
    annotations: []
  };

  const config = { responsive: true, displaylogo: false };

  const downloadCSV = () => {
    const unit = getUnit(dataType);
    const dataToExport = floatsFromPreset.filter(f => visibleIds.includes(f.id));
    const headers = [
      'Float ID',
      'Type',
      `Surface (${unit})`,
      `Min (${unit})`,
      `Max (${unit})`,
      `Mean (${unit})`,
      ...depths.filter(d => d >= depthRange.min && d <= depthRange.max).map(d => `${d}m (${unit})`)
    ];

    const csvRows = dataToExport.map(float => {
      const stat = stats.find(s => s.id === float.id);
      if (!stat) return '';

      const row = [
        `"${float.id}"`,
        `"${stat.type}"`,
        stat.surface,
        stat.min,
        stat.max,
        stat.mean,
        ...depths
          .map((depth, index) => ({ depth, index }))
          .filter(({ depth }) => depth >= depthRange.min && depth <= depthRange.max)
          .map(({ index }) => (float[dataKey] as number[])[index])
      ];
      return row.join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `compare_${dataType.toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
   };
  const exportReport = () => {
    const link = document.createElement('a');
    link.href = '/Report_Take_1.pdf';
    link.download = 'Report_Take_1.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const toggleVisible = (id: string) => setVisibleIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  return (
    <div ref={tabRef} className="min-h-screen p-4 sm:p-6 font-sans">
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {statusMessage}
      </div>
      <div className="max-w-8xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Compare Float Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Interactive visual analysis of float data profiles across different oceans.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
              <div className="bg-card rounded-xl p-4 border border-border shadow-lg h-full">
                <div className="rounded-lg relative min-h-[550px] overflow-hidden chart-container p-4">
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                      <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                    </svg>
                    {(!isIntersecting || !plotReady) && <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"><span className="text-muted-foreground">Preparing Visualization...</span></div>}
                     <div 
                        id="compare-plotly" 
                        className="compare-plotly-root" 
                        style={{ width: "100%", height: "100%" }}
                        role="region"
                        aria-label={`Chart displaying float ${dataType} profiles`}
                      >
                      {React.createElement(Plot as any, {
                        data: animatedTraces,
                        layout: layout,
                        config: config,
                        useResizeHandler: true,
                        style: { width: "100%", height: "100%", visibility: plotReady ? "visible" : "hidden" }
                      })}
                    </div>
                </div>
            </div>
          </div>
          <aside className="lg:col-span-1 space-y-6 flex flex-col">
             <div 
                className="bg-card rounded-xl p-4 border border-border shadow-lg"
                onMouseLeave={() => setHighlightedId(null)}
             >
                <h3 className="text-base font-semibold mb-3 text-foreground">Select Floats</h3>
                 <div className="space-y-1 text-sm">
                    {stats.map((s) => (
                      <label 
                        key={s.id} 
                        className={`flex items-center justify-between gap-3 cursor-pointer p-1.5 rounded-md transition-all duration-200 ${visibleIds.includes(s.id) ? 'bg-primary/20' : 'hover:bg-muted/50'} ${highlightedId === s.id ? 'ring-2 ring-primary' : ''}`}
                        onMouseEnter={() => setHighlightedId(s.id)}
                        >
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-border text-primary focus:ring-ring shrink-0" checked={visibleIds.includes(s.id)} onChange={() => toggleVisible(s.id)} />
                          <div style={{ width: 4, height: 16, backgroundColor: s.color, borderRadius: 2 }} />
                          <div className="leading-tight">
                            <div className="font-medium text-xs text-foreground">{s.id.split(' ')[0]} <span className="text-muted-foreground font-normal">{s.type}</span></div>
                            <div className="text-[11px] text-muted-foreground">Surface: {s.surface.toFixed(1)}{getUnit(dataType)}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg flex-grow">
                <h3 className="text-base font-semibold mb-3 text-foreground">Chart Tools</h3>
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Ocean Preset</label>
                        <CustomSelect 
                          options={Object.keys(oceanPresets)}
                          value={ocean}
                          onChange={setOcean}
                          ariaLabel="Select ocean preset"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <label className="text-sm font-medium text-foreground">Data Preview</label>
                        <CustomSelect 
                          options={['Temperature', 'Salinity', 'Humidity']}
                          value={dataType}
                          onChange={(value: string) => setDataType(value as DataType)}
                          ariaLabel="Select data type to preview"
                        />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border">
                        <label className="text-sm font-medium text-foreground">Depth Range (m)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                className="w-full px-2 py-1 border rounded-md bg-background text-foreground border-border text-sm" 
                                value={depthRange.min} 
                                onChange={(e) => setDepthRange(d => ({ ...d, min: Number(e.target.value) }))}
                                aria-label="Minimum depth"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input 
                                type="number" 
                                className="w-full px-2 py-1 border rounded-md bg-background text-foreground border-border text-sm" 
                                value={depthRange.max} 
                                onChange={(e) => setDepthRange(d => ({ ...d, max: Number(e.target.value) }))}
                                aria-label="Maximum depth"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border">
                        <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                            <span>Smooth Curves</span>
                            <input type="checkbox" className="toggle" checked={smoothCurves} onChange={() => setSmoothCurves((s) => !s)} />
                        </label>
                        <label className="flex items-center justify-between text-sm text-foreground cursor-pointer">
                           <span>Thermocline Band</span>
                           <input type="checkbox" className="toggle" checked={showThermoclineBand} onChange={() => setShowThermoclineBand((s) => !s)} />
                        </label>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-border">
                         <button onClick={downloadCSV} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-sm font-medium shadow-sm text-foreground hover:bg-muted transition-colors">
                            <Download size={16} />CSV
                        </button>
                        <button onClick={exportReport} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground shadow-sm text-sm font-medium hover:bg-primary/90 transition-colors">
                            <Printer size={16} />Export
                        </button>
                    </div>
                </div>
            </div>
          </aside>
          
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
             <KeyTakeawaysPanel stats={stats} visibleIds={visibleIds} dataType={dataType}/>
             <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                <h3 className="text-base font-semibold mb-3 text-foreground">Comparison Details</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b border-border">
                        <tr className="text-xs text-muted-foreground uppercase">
                          <th className="font-medium p-2">Float</th>
                          <th className="font-medium p-2 text-right">Surface</th>
                          <th className="font-medium p-2 text-right">Min</th>
                          <th className="font-medium p-2 text-right">Max</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {stats.filter(s => visibleIds.includes(s.id)).map((s) => (
                          <tr key={s.id} className={`transition-colors duration-200 ${highlightedId === s.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
                            <td className="p-2 font-medium text-foreground whitespace-nowrap flex items-center gap-2">
                                <div style={{ width: 10, height: 10, backgroundColor: s.color, borderRadius: 3, flexShrink: 0 }} />
                                {s.id.split(' ')[0]}
                            </td>
                            <td className="p-2 text-right text-muted-foreground font-mono">{s.surface.toFixed(1)}{getUnit(dataType)}</td>
                            <td className="p-2 text-right text-muted-foreground font-mono">{s.min.toFixed(1)}{getUnit(dataType)}</td>
                            <td className="p-2 text-right text-muted-foreground font-mono">{s.max.toFixed(1)}{getUnit(dataType)}</td>
                          </tr>
                        ))}
                         {visibleIds.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center text-muted-foreground text-xs">Select a float to see details.</td></tr>
                         )}
                      </tbody>
                    </table>
                </div>
            </div>
          </div>

        </div>
      </div>
       <style jsx>{`
        .chart-container {
            background: linear-gradient(165deg, hsl(222 47% 14% / 1), hsl(222 47% 11% / 1));
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dark .chart-container {
             background: linear-gradient(165deg, hsl(222 47% 9% / 1), hsl(222 47% 6% / 1)),
                        radial-gradient(ellipse at top left, hsl(var(--primary) / 0.15), transparent 50%),
                        radial-gradient(ellipse at bottom right, hsl(var(--primary) / 0.25), transparent 60%);
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
            border: 1px solid hsl(var(--border));
        }
        .toggle {
            -webkit-appearance: none;
            appearance: none;
            width: 36px;
            height: 20px;
            background-color: hsl(var(--muted));
            border-radius: 9999px;
            position: relative;
            transition: background-color 0.2s ease-in-out;
            cursor: pointer;
        }
        .toggle::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 9999px;
            transition: transform 0.2s ease-in-out;
        }
        .toggle:checked {
            background-color: hsl(var(--primary));
        }
        .toggle:checked::before {
            transform: translateX(16px);
        }
        @keyframes fade-in-scale {
            from {
                opacity: 0;
                transform: scale(0.95) translateY(-5px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}