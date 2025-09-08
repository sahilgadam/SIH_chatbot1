// src/app/components/tabs/NewbieCompare.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Thermometer, Droplet, Wind } from 'lucide-react';
import { usePreviewMetric, PreviewMetric as DataType } from '../usePreviewMetric';

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

export default function NewbieCompare({ theme = "light" }: Props) {
  const { previewMetric: dataType, setPreviewMetric: setDataType } = usePreviewMetric();
  const depths = defaultDepths;
  const [ocean, setOcean] = useState<string>("Atlantic");
  const floatsFromPreset = oceanPresets[ocean];
  const [visibleIds, setVisibleIds] = useState<string[]>(floatsFromPreset.map((f) => f.id));
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const dataKeyMap: Record<DataType, keyof Omit<FloatSeries, 'id' | 'color' | 'emoji'>> = {
      Temperature: 'temps',
      Salinity: 'salinity',
      Humidity: 'humidity',
  };
  const dataKey = dataKeyMap[dataType];
  
  const stats = useMemo(() => {
    return floatsFromPreset.map((f) => ({
      id: f.id,
      type: f.id.match(/\((.*?)\)/)?.[1] || 'Standard',
      surface: (f[dataKey] as number[])[0],
      min: Math.min(...(f[dataKey] as number[])),
      max: Math.max(...(f[dataKey] as number[])),
    }));
  }, [floatsFromPreset, dataKey, dataType]);

  const traces = useMemo(() => {
    return floatsFromPreset
      .filter((f) => visibleIds.includes(f.id))
      .map((f) => ({
        x: f[dataKey] as number[],
        y: depths,
        name: f.id,
        mode: "lines+markers",
        type: "scatter" as const,
        marker: { size: 12, color: f.color },
        line: { color: f.color, width: 4 },
      }));
  }, [floatsFromPreset, visibleIds, depths, dataKey, dataType]);

  const getUnit = (type: DataType) => {
    switch(type) {
        case 'Temperature': return '°C';
        case 'Salinity': return 'PSU';
        case 'Humidity': return '%';
        default: return '';
    }
  }

  const layout: any = {
    title: { text: `<b>${dataType} vs. Depth in the ${ocean} Ocean</b>`, font: { size: 18 } },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { color: theme === 'dark' ? "#e2e8f0" : '#0f172a' },
    xaxis: { title: `${dataType} (${getUnit(dataType)})` },
    yaxis: { title: "Depth (m)", autorange: "reversed" },
    showlegend: false,
    margin: { l: 50, r: 20, t: 50, b: 50 },
    hovermode: "closest",
  };
  
  const handleActionClick = (action: string) => {
    setActiveAction(action);
    // Logic to highlight parts of the chart would go here
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Understanding Ocean Data</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl p-4 border border-border shadow-lg">
            {React.createElement(Plot as any, {
              data: traces,
              layout: layout,
              config: { responsive: true, displaylogo: false },
              style: { width: "100%", height: "500px" }
            })}
          </div>
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
              <h3 className="font-semibold mb-2">Learn More</h3>
              <div className="space-y-2">
                <details className="p-2 rounded hover:bg-muted/50">
                  <summary className="cursor-pointer font-medium flex items-center gap-2"><Thermometer size={16} /> Temperature</summary>
                  <p className="text-sm mt-2 text-muted-foreground">Temperature in the ocean varies with depth. The surface is warmed by the sun, while the deep ocean is very cold.</p>
                </details>
                <details className="p-2 rounded hover:bg-muted/50">
                  <summary className="cursor-pointer font-medium flex items-center gap-2"><Droplet size={16} /> Salinity</summary>
                  <p className="text-sm mt-2 text-muted-foreground">Salinity is how salty the water is. It can change based on rainfall, river runoff, and evaporation.</p>
                </details>
                <details className="p-2 rounded hover:bg-muted/50">
                  <summary className="cursor-pointer font-medium flex items-center gap-2"><Wind size={16} /> Humidity</summary>
                   <p className="text-sm mt-2 text-muted-foreground">Humidity over the ocean is a measure of the water vapor in the air, which affects weather patterns.</p>
                </details>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
                <h3 className="font-semibold mb-2">Try These Actions</h3>
                <div className="flex flex-col space-y-2">
                    <button onClick={() => handleActionClick('surface')} className={`p-2 text-sm rounded text-left ${activeAction === 'surface' ? 'bg-primary/20' : 'hover:bg-muted/50'}`}>Highlight Surface Only</button>
                    <button onClick={() => handleActionClick('thermocline')} className={`p-2 text-sm rounded text-left ${activeAction === 'thermocline' ? 'bg-primary/20' : 'hover:bg-muted/50'}`}>Show Thermocline Band</button>
                </div>
            </div>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
              <h3 className="font-semibold mb-2">Key Takeaways</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Surface water is generally warmer than deep water because it's heated by the sun.</li>
                    <li>Different parts of the ocean can have different temperature and salinity profiles.</li>
                    <li>The "thermocline" is a layer where the temperature changes rapidly.</li>
                </ul>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border shadow-lg">
              <h3 className="font-semibold mb-2">Comparison Details</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Float ID</th>
                    <th className="text-right py-2">Surface</th>
                    <th className="text-right py-2">Min</th>
                    <th className="text-right py-2">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(s => (
                    <tr key={s.id}>
                      <td className="py-2">{s.id.split(' ')[0]}</td>
                      <td className="text-right py-2">{s.surface.toFixed(1)} {getUnit(dataType)}</td>
                      <td className="text-right py-2">{s.min.toFixed(1)} {getUnit(dataType)}</td>
                      <td className="text-right py-2">{s.max.toFixed(1)} {getUnit(dataType)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}