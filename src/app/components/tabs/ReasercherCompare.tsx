// src/app/components/tabs/ResearcherCompare.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Plot from 'react-plotly.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Printer, ChevronDown, AlertTriangle, Info, CheckCircle, Undo, Move, X, Droplet, Thermometer, Wind, RefreshCw, Upload } from 'lucide-react';

// --- Inlined Hook: usePreviewMetric ---
export type PreviewMetric = 'Temperature' | 'Salinity' | 'Humidity';
const usePreviewMetric = () => {
  const [previewMetric, setPreviewMetric] = useState<PreviewMetric>('Temperature');
  return { previewMetric, setPreviewMetric };
};
type DataType = PreviewMetric;

// --- Inlined Hook: useDragDropCells ---
const useDragDropCells = (initialCells: string[], onDropCell: (cellId: string) => void) => {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [liftedCell, setLiftedCell] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cellId: string) => {
    e.dataTransfer.setData('text/plain', cellId);
    setIsDragging(cellId);
    setStatusMessage(`${cellId} lifted.`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cellId = e.dataTransfer.getData('text/plain');
    if (cellId) {
      onDropCell(cellId);
      setStatusMessage(`${cellId} dropped into comparison.`);
    }
    setIsDragging(null);
    setDragOver(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, cellId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (liftedCell === cellId) {
        onDropCell(cellId);
        setStatusMessage(`${cellId} dropped into comparison.`);
        setLiftedCell(null);
      } else {
        setLiftedCell(cellId);
        setStatusMessage(`${cellId} selected. Navigate to drop zone and press Space or Enter to drop.`);
      }
    }
  };

  return {
    isDragging,
    dragOver,
    statusMessage,
    liftedCell,
    dragDropHandlers: {
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleKeyDown,
    },
  };
};


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

interface OceanBubbleProps {
  oceanName: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, oceanName: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, oceanName: string) => void;
  isDragging: boolean;
  liftedCell: string | null;
}

const OceanBubble = ({ oceanName, onDragStart, onKeyDown, isDragging, liftedCell }: OceanBubbleProps) => {
  const [position] = useState({
    top: `${Math.random() * 80 + 10}%`,
    left: `${Math.random() * 80 + 10}%`,
    animationDuration: `${Math.random() * 15 + 20}s`,
    animationDelay: `${Math.random() * -10}s`,
  });

  return (
    <motion.div
      layoutId={oceanName}
      className={`ocean-bubble ${isDragging ? 'dragging' : ''} ${liftedCell === oceanName ? 'lifted' : ''}`}
      style={{
        top: position.top,
        left: position.left,
        animationDuration: position.animationDuration,
        animationDelay: position.animationDelay,
      }}
      whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.7)' }}
      whileTap={{ scale: 0.95, cursor: 'grabbing' }}
    >
      <div
        draggable="true"
        onDragStart={(e) => onDragStart(e, oceanName)}
        onKeyDown={(e) => onKeyDown(e, oceanName)}
        role="button"
        tabIndex={0}
        aria-label={`Drag ${oceanName} to compare`}
        className="w-full h-full flex items-center justify-center"
      >
        <span>{oceanName}</span>
      </div>
    </motion.div>
  );
};

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

const OceanAnalysisCard = ({ oceanName, stats, onRemove, onSwap, dataType, getUnit, isUserUploaded = false }: { oceanName: string, stats: any, onRemove: () => void, onSwap?: () => void, dataType: DataType, getUnit: (type: DataType) => string, isUserUploaded?: boolean }) => {
    if (!stats) return null;
    const { color, emoji } = isUserUploaded ? { color: "#A020F0", emoji: "👤" } : oceanPresets[oceanName][0];
    return (
        <div className="bg-card/50 rounded-xl p-4 border border-border shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <h3 className="font-bold text-lg">{oceanName}</h3>
                </div>
                <div className="flex items-center gap-1">
                    {!isUserUploaded && onSwap && <button onClick={onSwap} title="Swap Positions" className="p-1 rounded-full hover:bg-muted"><RefreshCw size={14} /></button>}
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

interface KeyTakeawaysPanelProps {
  dataType: DataType;
  statsByOcean: any;
  comparedOceans: string[];
}

const KeyTakeawaysPanel = ({ dataType, statsByOcean, comparedOceans }: KeyTakeawaysPanelProps) => {
    if (!comparedOceans || comparedOceans.length < 2 || !statsByOcean[comparedOceans[0]] || !statsByOcean[comparedOceans[1]]) {
        return null;
    }

    const takeaways = {
        Temperature: [
            { icon: AlertTriangle, color: "text-orange-400", title: "Surface Difference", text: `The ${comparedOceans[0]} is ${(statsByOcean[comparedOceans[0]].surface - statsByOcean[comparedOceans[1]].surface).toFixed(1)}°C warmer at the surface.`},
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

interface SummaryPanelProps {
  dataType: DataType;
  statsByOcean: any;
  comparedOceans: string[];
  getUnit: (type: DataType) => string;
}

const SummaryPanel = ({ dataType, statsByOcean, comparedOceans, getUnit }: SummaryPanelProps) => {
    if (!comparedOceans || comparedOceans.length === 0) {
        return null;
    }

    let summaryText = '';

    if (comparedOceans.length === 1) {
        const ocean = comparedOceans[0];
        const stats = statsByOcean[ocean];
        if (stats) {
            summaryText = `Showing data for ${ocean}. The surface ${dataType.toLowerCase()} is ${stats.surface.toFixed(1)}${getUnit(dataType)}. The values range from a minimum of ${stats.min.toFixed(1)} to a maximum of ${stats.max.toFixed(1)}${getUnit(dataType)}.`;
        }
    } else {
        const ocean1 = comparedOceans[0];
        const ocean2 = comparedOceans[1];
        const stats1 = statsByOcean[ocean1];
        const stats2 = statsByOcean[ocean2];

        if (stats1 && stats2) {
            switch (dataType) {
                case 'Temperature':
                    const tempDiff = (stats1.surface - stats2.surface).toFixed(1);
                    summaryText = `Comparing ${ocean1} and ${ocean2} reveals key temperature differences. The ${ocean1} is consistently warmer at the surface by approximately ${tempDiff}°C, suggesting stronger solar radiation or different current patterns.`;
                    break;
                case 'Salinity':
                    const salinityDiff = (stats1.surface - stats2.surface).toFixed(1);
                    const fresherOcean = parseFloat(salinityDiff) > 0 ? ocean2 : ocean1;
                    summaryText = `The salinity profiles show notable variations. The surface water in the ${ocean1} is ${Math.abs(parseFloat(salinityDiff))} PSU ${parseFloat(salinityDiff) > 0 ? 'saltier' : 'fresher'} than the ${ocean2}. These differences often point to factors like freshwater input from rivers or ice melt, particularly in the ${fresherOcean}.`;
                    break;
                case 'Humidity':
                    summaryText = `Humidity data indicates the moisture content of the air just above the sea surface. Both ${ocean1} and ${ocean2} show high surface humidity, which is typical for marine environments and crucial for the formation of weather systems.`;
                    break;
                default:
                    summaryText = 'Select a data type to see a detailed summary.';
            }
        }
    }


    return (
        <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
            <h3 className="font-semibold mb-3">Summary for {dataType}</h3>
            <p className="text-sm text-muted-foreground">
                {summaryText || 'Please select oceans to compare.'}
            </p>
        </div>
    );
};


export default function ResearcherCompare({ theme = "light" }: Props) {
  const { previewMetric: dataType, setPreviewMetric: setDataType } = usePreviewMetric();
  const [comparedOceans, setComparedOceans] = useState<string[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [userFloatData, setUserFloatData] = useState<FloatSeries | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropCell = (oceanName: string) => {
    if (comparedOceans.includes(oceanName)) return;

    const totalCompared = comparedOceans.length + (userFloatData ? 1 : 0);
    if (totalCompared >= 2) {
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

  const handleRemoveUserData = () => {
    setUserFloatData(null);
  };

  const handleSwapOceans = () => {
    setComparedOceans(prev => [...prev].reverse());
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            // Expecting header: temperature,salinity
            const rows = text.split('\n').slice(1).filter(row => row.trim() !== '');
            const temps: number[] = [];
            const salinity: number[] = [];
            
            rows.forEach(row => {
                const columns = row.split(',');
                if (columns.length >= 2) {
                    const temp = parseFloat(columns[0]);
                    const sal = parseFloat(columns[1]);
                    if (!isNaN(temp)) temps.push(temp);
                    if (!isNaN(sal)) salinity.push(sal);
                }
            });

            if (temps.length === 0 && salinity.length === 0) {
                throw new Error("No valid numeric data found in file.");
            }
            
            const padData = (arr: number[]) => {
                const lastVal = arr.length > 0 ? arr[arr.length - 1] : 0;
                while (arr.length < defaultDepths.length) {
                    arr.push(lastVal);
                }
                return arr.slice(0, defaultDepths.length);
            };

            const newUserData: FloatSeries = {
                id: file.name.replace('.csv', '') || "User Data",
                temps: padData(temps),
                salinity: padData(salinity),
                humidity: [], // Not supported in CSV import
                color: "#A020F0",
                emoji: "👤",
            };

            const totalCompared = comparedOceans.length + (userFloatData ? 1 : 0);
            if(totalCompared >= 2) {
                setShowLimitModal(true);
                return;
            }

            setUserFloatData(newUserData);
        } catch (error) {
            console.error("Error parsing CSV:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to parse CSV. Ensure it has columns for temperature and salinity. Error: ${errorMessage}`);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const { isDragging, dragOver, statusMessage, liftedCell, dragDropHandlers } = useDragDropCells(allOceans, handleDropCell);
  
  const allFloatsToCompare = useMemo(() => {
    const presetFloats = comparedOceans.flatMap(ocean => oceanPresets[ocean] || []);
    return userFloatData ? [...presetFloats, userFloatData] : presetFloats;
  }, [comparedOceans, userFloatData]);

  const combinedComparedItems = useMemo(() => {
    const items = [...comparedOceans];
    if (userFloatData) {
        items.push(userFloatData.id);
    }
    return items;
  }, [comparedOceans, userFloatData]);
  
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
        if (!floats || floats.length === 0) return;
        const allValues = floats.flatMap(f => f[dataKey]);
        result[ocean] = {
            surface: floats[0][dataKey][0],
            min: Math.min(...allValues),
            max: Math.max(...allValues),
        };
    });
    if (userFloatData) {
        const allValues = userFloatData[dataKey];
        if (allValues && allValues.length > 0) {
          result[userFloatData.id] = {
            surface: allValues[0],
            min: Math.min(...allValues),
            max: Math.max(...allValues),
          }
        }
    }
    return result;
  }, [comparedOceans, dataKey, userFloatData]);

  const baseTraces = useMemo(() => {
    return allFloatsToCompare.map((f) => ({
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
  }, [allFloatsToCompare, defaultDepths, dataKey, dataType]);

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

  const downloadCSV = () => {
    if (allFloatsToCompare.length === 0) return;
    
    const headers = ['Depth (m)', ...allFloatsToCompare.map(float => `${float.id} ${dataType} (${getUnit(dataType)})`)];
    
    const rows = defaultDepths.map((depth, i) => {
        const rowData = [depth.toString()];
        allFloatsToCompare.forEach(float => {
            const floatData = float[dataKey];
            rowData.push(floatData[i]?.toString() || '');
        });
        return rowData.join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ocean_comparison_${dataType}.csv`);
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

  return (
    <div className="min-h-screen p-4 sm:p-6 font-sans relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">{statusMessage}</div>
      <ComparisonLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

      {combinedComparedItems.length === 0 ? (
        // --- SELECTION VIEW ---
        <div className="grid grid-cols-4 gap-6 h-full">
          <div className="col-span-3 relative floating-area">
            <AnimatePresence>
              {allOceans.filter(o => !comparedOceans.includes(o)).map(oceanName => (
                <OceanBubble
                  key={oceanName}
                  oceanName={oceanName}
                  onDragStart={dragDropHandlers.handleDragStart}
                  onKeyDown={dragDropHandlers.handleKeyDown}
                  isDragging={isDragging === oceanName}
                  liftedCell={liftedCell}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="col-span-1">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Compare Ocean Profiles</h1>
                <p className="mt-1 text-sm text-muted-foreground">Drag two ocean bubbles into the drop zone or import your own data to begin analysis.</p>
                <button onClick={handleImportClick} className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground shadow-sm text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Upload size={16} /> Import Data
                </button>
              </div>
              <div
                className={`transition-all duration-300 drop-zone ${dragOver ? 'drop-zone-active' : ''}`}
                onDragOver={dragDropHandlers.handleDragOver}
                onDragLeave={dragDropHandlers.handleDragLeave}
                onDrop={dragDropHandlers.handleDrop}
                tabIndex={liftedCell ? 0 : -1}
              >
                <div className="flex flex-col items-center justify-center h-full min-h-[550px] bg-card rounded-xl border-2 border-dashed border-border">
                  <Move size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold text-foreground text-center">Drop oceans here to compare</h2>
                  <p className="text-muted-foreground text-center px-4">Select {2 - (comparedOceans.length + (userFloatData ? 1:0))} more ocean(s) from the floating area.</p>
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
            </div>
          </div>
        </div>
      ) : (
        // --- COMPARISON VIEW ---
        <div className="max-w-8xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Comparing Ocean Profiles</h1>
                <p className="mt-1 text-sm text-muted-foreground">Drag another ocean from the side panel to change the comparison.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex border-b border-border">
                                {(['Temperature', 'Salinity'] as DataType[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDataType(d)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${dataType === d ? 'bg-muted/50 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        {d === 'Temperature' && <Thermometer className="inline-block mr-2" size={16} />}
                                        {d === 'Salinity' && <Droplet className="inline-block mr-2" size={16} />}
                                        {d}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleImportClick} className="p-2 rounded-full hover:bg-muted"><Upload size={16} /></button>
                                <button onClick={downloadCSV} className="p-2 rounded-full hover:bg-muted"><Download size={16} /></button>
                                <button onClick={exportReport} className="p-2 rounded-full hover:bg-muted"><Printer size={16} /></button>
                            </div>
                        </div>
                        <div className="h-[500px]">
                            <AnimatePresence>
                                <motion.div key={combinedComparedItems.join('-')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Plot data={baseTraces} layout={layout} style={{ width: "100%", height: "100%" }} config={{displayModeBar: false, responsive: true}} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <aside className="lg:col-span-1 space-y-4">
                    {comparedOceans.map(ocean => (
                        <OceanAnalysisCard key={ocean} oceanName={ocean} stats={statsByOcean[ocean]} onRemove={() => handleRemoveOcean(ocean)} onSwap={handleSwapOceans} dataType={dataType} getUnit={getUnit} />
                    ))}
                    {userFloatData && (
                        <OceanAnalysisCard oceanName={userFloatData.id} stats={statsByOcean[userFloatData.id]} onRemove={handleRemoveUserData} dataType={dataType} getUnit={getUnit} isUserUploaded />
                    )}
                    <div className="p-4 bg-card rounded-xl border border-border shadow-lg">
                      <h3 className="font-semibold mb-2">Add another ocean</h3>
                      <div className="relative h-48 floating-area-small">
                        <AnimatePresence>
                          {allOceans.filter(o => !comparedOceans.includes(o)).map(oceanName => (
                            <OceanBubble
                              key={oceanName}
                              oceanName={oceanName}
                              onDragStart={dragDropHandlers.handleDragStart}
                              onKeyDown={dragDropHandlers.handleKeyDown}
                              isDragging={isDragging === oceanName}
                              liftedCell={liftedCell}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                </aside>
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SummaryPanel dataType={dataType} statsByOcean={statsByOcean} comparedOceans={combinedComparedItems} getUnit={getUnit} />
                    <KeyTakeawaysPanel statsByOcean={statsByOcean} comparedOceans={comparedOceans} dataType={dataType}/>
                </div>
            </div>
        </div>
      )}

      <AnimatePresence>
        {lastAdded && (
            <motion.div className="undo-toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <span>Added {lastAdded}</span>
                <button onClick={handleUndo} className="undo-button"><Undo size={14} /> Undo</button>
            </motion.div>
        )}
      </AnimatePresence>
       <style jsx>{`
        .floating-area {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 80vh;
          border-radius: 0.75rem;
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
          overflow: hidden;
        }
        .floating-area-small {
          position: relative;
          width: 100%;
          height: 12rem;
          border-radius: 0.75rem;
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
          overflow: hidden;
        }

        .ocean-bubble {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: grab;
          user-select: none;
          animation-name: float;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-direction: alternate;
        }

        .floating-area-small .ocean-bubble {
          width: 80px;
          height: 80px;
          font-size: 0.8rem;
        }

        @keyframes float {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          20% { transform: translate(10px, -25px) rotate(5deg); }
          40% { transform: translate(-20px, 15px) rotate(-5deg); }
          60% { transform: translate(25px, 20px) rotate(10deg); }
          80% { transform: translate(-10px, -15px) rotate(-10deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ocean-bubble {
            animation: none;
          }
        }

        .ocean-bubble.dragging {
          cursor: grabbing;
          opacity: 0.5;
          z-index: 1000;
        }

        .ocean-bubble.lifted {
          outline: 2px solid var(--primary);
          box-shadow: 0 0 20px var(--primary);
        }

        .compared-ocean-chip { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; background: var(--muted); border: 1px solid; border-radius: 9999px; color: var(--foreground); font-size: 0.875rem; }
        .remove-ocean-btn { background: var(--muted-foreground); color: var(--background); border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
        .remove-ocean-btn:hover { background: var(--primary); }
        .drop-zone { transition: all 0.3s ease-out; border: 2px dashed transparent; border-radius: 0.75rem; }
        .drop-zone-active { border-color: var(--primary); background-color: rgba(var(--primary-rgb), 0.1); }
        .undo-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background-color: var(--card); color: var(--foreground); padding: 12px 20px; border-radius: 9999px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 16px; z-index: 100; }
        .undo-button { display: flex; align-items: center; gap: 4px; font-weight: 600; color: var(--primary); }
       `}</style>
    </div>
  );
}

