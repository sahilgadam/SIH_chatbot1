// src/app/components/tabs/ResearcherCompare.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Printer, ChevronDown, AlertTriangle, Info, CheckCircle, Undo, Move, X, Droplet, Thermometer, Wind, RefreshCw } from 'lucide-react';
import { usePreviewMetric, PreviewMetric as DataType } from './usePreviewMetric';
import { useDragDropCells } from './useDragDropCells';
import OceanCell from './OceanCell';

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type FloatSeries = { id: string; temps: number[]; salinity: number[]; humidity: number[]; color?: string; emoji?: string; };
type Props = { theme?: "light" | "dark"; floats?: FloatSeries[]; depths?: number[]; };
const defaultDepths = [0, 50, 100, 200, 400, 600, 800, 1000];

const oceanPresets: Record<string, FloatSeries[]> = {
  Atlantic: [
      { id: "AT-98765 (Warm Core)", temps: [26, 24, 21, 16, 11, 8, 6, 5], salinity: [35.5, 35.6, 35.7, 35.4, 35.2, 35.0, 34.8, 34.7], humidity: [85, 82, 78, 75, 72, 70, 68, 65], color: "#FF7F50", emoji: "🔥" },
      { id: "AT-12345 (Cold Front)", temps: [19, 18, 16, 14, 11, 8, 6, 5], salinity: [34.8, 34.9, 35.0, 35.1, 35.0, 34.9, 34.8, 34.7], humidity: [92, 90, 88, 85, 83, 80, 78, 75], color: "#1E90FF", emoji: "❄️" },
      { id: "AT-54321 (Standard)", temps: [22, 21, 19, 15, 12, 9, 7, 6], salinity: [35.1, 35.2, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8], humidity: [88, 86, 84, 82, 80, 78, 76, 74], color: "#32CD32", emoji: "🌊" }
  ],
  Pacific: [
    { id: "PX-10234 (Warm Core)", temps: [27, 25, 22, 17, 12, 9, 7, 6], salinity: [34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2], humidity: [82, 80, 77, 74, 71, 69, 67, 64], color: "#FFD700", emoji: "🔥" }
  ],
  Indian: [
    { id: "IN-55678 (Warm)", temps: [28, 26, 23, 18, 13, 10, 8, 7], salinity: [36.0, 36.1, 36.2, 36.1, 35.9, 35.7, 35.5, 35.4], humidity: [80, 78, 75, 72, 70, 68, 66, 63], color: "#4B0082", emoji: "🔥" }
  ],
  Southern: [
    { id: "SO-00123 (Cold Core)", temps: [10, 9, 8, 7, 6, 5, 4, 3], salinity: [33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6], humidity: [98, 96, 94, 92, 90, 88, 86, 84], color: "#87CEEB", emoji: "❄️" }
  ],
  Arctic: [
    { id: "AR-90001 (Cold Surface)", temps: [4, 3.8, 3.5, 3.2, 3.0, 2.8, 2.6, 2.5], salinity: [32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7], humidity: [99, 98, 97, 96, 95, 94, 93, 92], color: "#FFFFFF", emoji: "❄️" }
  ]
};

const allOceans = Object.keys(oceanPresets);

const ComparisonLimitModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-card/90 border border-red-500/50 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"><X size={20} /></button>
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Comparison Limit Reached</h2>
            <p className="text-muted-foreground mb-6">You can only compare up to two oceans at a time. Please remove an ocean to add another.</p>
            <button onClick={onClose} className="w-full mt-2 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-all">Okay</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const OceanAnalysisCard = ({ oceanName, stats, onRemove, onSwap, dataType, getUnit }: { oceanName: string, stats: any, onRemove: () => void, onSwap: () => void, dataType: DataType, getUnit: (type: DataType) => string }) => {
    if (!stats) return null;
    const { color, emoji } = oceanPresets[oceanName][0];
    return (
        <div className="bg-card/50 rounded-xl p-4 border border-border shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <h3 className="font-bold text-lg">{oceanName}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onSwap} title="Swap Positions" className="p-1 rounded-full hover:bg-muted"><RefreshCw size={14} /></button>
                    <button onClick={onRemove} title="Remove Ocean" className="p-1 rounded-full hover:bg-muted"><X size={14} /></button>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Surface:</span> <span className="font-mono">{stats.surface.toFixed(1)}{getUnit(dataType)}</span></div>
                <div className="flex justify-between"><span>Min:</span> <span className="font-mono">{stats.min.toFixed(1)}{getUnit(dataType)}</span></div>
                <div className="flex justify-between"><span>Max:</span> <span className="font-mono">{stats.max.toFixed(1)}{getUnit(dataType)}</span></div>
            </div>
        </div>
    );
};

const KeyTakeawaysPanel = ({ dataType, statsByOcean, comparedOceans }: { dataType: DataType, statsByOcean: any, comparedOceans: string[] }) => {
    const takeaways = {
        Temperature: [
            { icon: AlertTriangle, color: "text-orange-400", title: "Surface Difference", text: `The ${comparedOceans[0]} is ${(statsByOcean[comparedOceans[0]]?.surface - statsByOcean[comparedOceans[1]]?.surface).toFixed(1)}°C warmer at the surface.`},
            { icon: Info, color: "text-blue-400", title: "Thermocline Depth", text: "Both oceans show a sharp thermocline, but it is deeper in the Pacific." },
            { icon: CheckCircle, color: "text-green-400", title: "Deep Water Stability", text: "Below 800m, temperatures in both oceans stabilize near 4-6°C." },
        ],
        Salinity: [
            { icon: Info, color: "text-blue-400", title: "Halocline Presence", text: "A distinct halocline (salinity gradient) is observed in the Atlantic data." },
            { icon: CheckCircle, color: "text-green-400", title: "Deep Salinity", text: "Deep water salinity is highly consistent across both regions, around 34.7 PSU." },
        ],
        Humidity: [
            { icon: Info, color: "text-blue-400", title: "Surface Humidity", text: "Surface-level air humidity is high in both regions, typical for marine environments." },
        ],
    };

    return (
        <div className="bg-card rounded-xl p-4 border border-border shadow-lg" aria-labelledby="takeaways-header">
            <h3 id="takeaways-header" className="text-base font-semibold mb-3 text-foreground">Key Takeaways for {dataType}</h3>
            <div className="space-y-4 pt-3 border-t border-border">
                {(takeaways as any)[dataType].map((item: any) => {
                    const Icon = item.icon;
                    return (
                        <div className="text-sm" key={item.title}>
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <Icon className={`h-4 w-4 ${item.color} shrink-0`} />
                                <span>{item.title}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground pl-6">{item.text}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};


export default function ResearcherCompare({ theme = "light" }: Props) {
  const { previewMetric: dataType, setPreviewMetric: setDataType } = usePreviewMetric();
  const [comparedOceans, setComparedOceans] = useState<string[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleDropCell = (oceanName: string) => {
    if (comparedOceans.includes(oceanName)) return;
    if (comparedOceans.length >= 2) {
      setShowLimitModal(true);
      return;
    }
    setComparedOceans(prev => [...prev, oceanName]);
    setLastAdded(oceanName);
    setTimeout(() => setLastAdded(null), 6000);
  };

  const handleUndo = () => {
    if(lastAdded) setComparedOceans(prev => prev.filter(o => o !== lastAdded));
    setLastAdded(null);
  };

  const handleRemoveOcean = (oceanNameToRemove: string) => {
    setComparedOceans(prev => prev.filter(o => o !== oceanNameToRemove));
  };
    
  const handleSwapOceans = () => {
    setComparedOceans(prev => [...prev].reverse());
  };

  const { isDragging, dragOver, statusMessage, liftedCell, dragDropHandlers } = useDragDropCells(allOceans, handleDropCell);
  
  const floatsFromPreset = useMemo(() => comparedOceans.flatMap(ocean => oceanPresets[ocean] || []), [comparedOceans]);
  
  const dataKeyMap: Record<DataType, keyof Omit<FloatSeries, 'id' | 'color' | 'emoji'>> = {
      Temperature: 'temps',
      Salinity: 'salinity',
      Humidity: 'humidity',
  };
  const dataKey = dataKeyMap[dataType];
  
  const statsByOcean = useMemo(() => {
      const result: { [key: string]: any } = {};
      comparedOceans.forEach(ocean => {
          const floats = oceanPresets[ocean];
          const allValues = floats.flatMap(f => f[dataKey]);
          result[ocean] = {
              surface: floats[0][dataKey][0],
              min: Math.min(...allValues),
              max: Math.max(...allValues),
          };
      });
      return result;
  }, [comparedOceans, dataKey]);

  const baseTraces = useMemo(() => {
    return floatsFromPreset.map((f) => ({
        x: f[dataKey] as number[],
        y: defaultDepths,
        name: f.id,
        mode: "lines+markers", type: "scatter" as const,
        hovertemplate: `<b>%{data.name}</b><br>Depth: %{y}m<br>${dataType}: %{x}<extra></extra>`,
        hoverinfo: 'text',
        marker: { size: 8, symbol: 'circle', color: f.color },
        line: { color: f.color, width: 3, shape: 'spline', smoothing: 1.3 },
        filter: 'url(#glow)',
      }));
  }, [floatsFromPreset, defaultDepths, dataKey, dataType]);
  
  const getUnit = (type: DataType) => {
    switch(type) {
        case 'Temperature': return '°C';
        case 'Salinity': return 'PSU';
        case 'Humidity': return '%';
        default: return '';
    }
  }

  const layout: any = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: theme === 'dark' ? "#94a3b8" : '#475569' },
    xaxis: { title: `${dataType} (${getUnit(dataType)})`, gridcolor: theme === 'dark' ? '#374151' : '#e2e8f0' },
    yaxis: { title: "Depth (m)", autorange: "reversed", gridcolor: theme === 'dark' ? '#374151' : '#e2e8f0' },
    showlegend: true,
    legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
    margin: { l: 60, r: 20, t: 20, b: 50 },
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 font-sans relative">
       <div className="sr-only" aria-live="polite" aria-atomic="true">{statusMessage}</div>
       <ComparisonLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
      
      <div className="max-w-8xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Compare Ocean Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Drag two ocean bubbles into the drop zone to begin analysis.</p>
        </div>
        
        <div className="ocean-selector-banner">
            <AnimatePresence>
                {allOceans.filter(o => !comparedOceans.includes(o)).map((oceanName) => (
                     <motion.div key={oceanName} layoutId={oceanName} draggable="true" onDragStart={(e) => dragDropHandlers.handleDragStart(e as any, oceanName)} onKeyDown={(e) => dragDropHandlers.handleKeyDown(e, oceanName)} role="button" tabIndex={0} aria-label={`Drag ${oceanName} to compare`} className={`ocean-selector-item ${isDragging === oceanName ? 'dragging' : ''} ${liftedCell === oceanName ? 'lifted' : ''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {oceanName}
                      </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {comparedOceans.length < 2 ? (
          <div 
            className={`transition-all duration-300 drop-zone ${dragOver ? 'drop-zone-active' : ''}`}
            onDragOver={dragDropHandlers.handleDragOver}
            onDragLeave={dragDropHandlers.handleDragLeave}
            onDrop={dragDropHandlers.handleDrop}
            tabIndex={liftedCell ? 0 : -1}
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[550px] bg-card rounded-xl border-2 border-dashed border-border">
              <Move size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Drop oceans here to compare</h2>
              <p className="text-muted-foreground">Select {2 - comparedOceans.length} more ocean(s) from the banner above.</p>
              {comparedOceans.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                    <span className="font-semibold">Selected:</span>
                    <div className="compared-ocean-chip" style={{borderColor: oceanPresets[comparedOceans[0]][0].color}}>
                        <span>{comparedOceans[0]}</span>
                        <button onClick={() => handleRemoveOcean(comparedOceans[0])} className="remove-ocean-btn"><X size={12} /></button>
                    </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <OceanAnalysisCard oceanName={comparedOceans[0]} stats={statsByOcean[comparedOceans[0]]} onRemove={() => handleRemoveOcean(comparedOceans[0])} onSwap={handleSwapOceans} dataType={dataType} getUnit={getUnit} />
              <OceanAnalysisCard oceanName={comparedOceans[1]} stats={statsByOcean[comparedOceans[1]]} onRemove={() => handleRemoveOcean(comparedOceans[1])} onSwap={handleSwapOceans} dataType={dataType} getUnit={getUnit}/>
            </div>
            <div className="lg:col-span-2 bg-card rounded-xl p-4 border border-border shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex border-b border-border">
                        {(['Temperature', 'Salinity', 'Humidity'] as DataType[]).map(d => (
                            <button 
                                key={d}
                                onClick={() => setDataType(d)}
                                className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${dataType === d ? 'bg-muted/50 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                            >
                                {d === 'Temperature' && <Thermometer className="inline-block mr-2" size={16} />}
                                {d === 'Salinity' && <Droplet className="inline-block mr-2" size={16} />}
                                {d === 'Humidity' && <Wind className="inline-block mr-2" size={16} />}
                                {d}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => {}} className="p-2 rounded-full hover:bg-muted"><Download size={16} /></button>
                        <button onClick={() => {}} className="p-2 rounded-full hover:bg-muted"><Printer size={16} /></button>
                    </div>
                </div>
                <div className="h-[500px]">
                    {React.createElement(Plot as any, { data: baseTraces, layout: layout, style: { width: "100%", height: "100%" }, config: {displayModeBar: false, responsive: true} })}
                </div>
            </div>
            <div className="lg:col-span-3">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                        <h3 className="font-semibold mb-3">Summary</h3>
                        <p className="text-sm text-muted-foreground">
                            Comparing the {comparedOceans[0]} and {comparedOceans[1]} oceans reveals key differences. 
                            The {comparedOceans[0]} is consistently warmer at the surface by approximately {(statsByOcean[comparedOceans[0]].surface - statsByOcean[comparedOceans[1]].surface).toFixed(1)}°C, suggesting stronger solar radiation or different current patterns.
                            Deeper analysis of salinity and humidity would provide further insights into regional climate drivers.
                        </p>
                    </div>
                    <KeyTakeawaysPanel statsByOcean={statsByOcean} comparedOceans={comparedOceans} dataType={dataType}/>
                </div>
            </div>
          </div>
        )}

      </div>
       <AnimatePresence>
            {lastAdded && (
                <motion.div className="undo-toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                    <span>Added {lastAdded}</span>
                    <button onClick={handleUndo} className="undo-button"><Undo size={14} /> Undo</button>
                </motion.div>
            )}
        </AnimatePresence>
       <style jsx>{`
        .ocean-selector-banner {
            background-image: url('https://images.unsplash.com/photo-1509477886674-06228f8b1f14?q=80&w=2070&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            padding: 1rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            border: 1px solid var(--border);
            box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
        }
        .ocean-selector-item {
            padding: 1rem 2rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 9999px;
            cursor: grab;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        }
        .ocean-selector-item:hover {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(255, 255, 255, 0.6);
        }
        .ocean-selector-item.dragging { opacity: 0.5; cursor: grabbing; }
        .ocean-selector-item.lifted { outline: 2px solid var(--primary); box-shadow: 0 0 20px var(--primary); }
        .compared-oceans-container { display: flex; align-items: center; gap: 0.5rem; }
        .compared-oceans-title { font-size: 0.875rem; font-weight: 600; color: rgba(255,255,255,0.7); margin-right: 0.5rem; }
        .compared-ocean-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid; border-radius: 9999px; color: white; font-size: 0.875rem; }
        .remove-ocean-btn { background: rgba(255,255,255,0.2); border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
        .remove-ocean-btn:hover { background: rgba(255,255,255,0.4); }
        .drop-zone { transition: all 0.3s ease-out; border: 2px dashed transparent; border-radius: 0.75rem; }
        .drop-zone-active { border-color: var(--primary); background-color: rgba(var(--primary-rgb), 0.1); }
        .undo-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background-color: var(--card); color: var(--foreground); padding: 12px 20px; border-radius: 9999px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 16px; z-index: 100; }
        .undo-button { display: flex; align-items: center; gap: 4px; font-weight: 600; color: var(--primary); }
       `}</style>
    </div>
  );
}

