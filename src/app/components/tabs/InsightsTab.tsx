"use client";

import React, { useState, FC } from "react";
import { Layers, Zap, Droplets, Globe, Hash, Sparkles, Bot, Lightbulb, Thermometer, Wind, Tornado  } from 'lucide-react';
import InsightDetailView from "../ui/InsightDetailView";

// --- Sub-components ---

const SkeletonCard: FC = () => (
    <div className="bg-card p-6 rounded-2xl shadow-md animate-pulse">
        <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-muted rounded w-5/6 mb-6"></div>
        <div className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded-full w-28"></div>
        </div>
    </div>
);

interface SuggestionCardProps {
    icon: FC<any>;
    text: string;
    onClick: (text: string) => void;
}
const SuggestionCard: FC<SuggestionCardProps> = ({ icon: Icon, text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="w-full text-left p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-4 border border-transparent hover:border-primary/50"
    >
        <Icon className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="text-muted-foreground">{text}</span>
    </button>
);

const InsightCard = ({ insight, onSelect }) => {
  const InsightIcon = insight.icon;
  return (
    <div className={`p-6 bg-card rounded-2xl shadow-lg border border-white/10 flex flex-col justify-between animate-fade-in-up`}>
      <div>
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-full bg-gradient-to-br ${insight.color}`}>
                <InsightIcon size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary/80 rounded-full">{insight.type}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1">Insight for: "{insight.query}"</p>
        <h3 className="font-bold text-xl text-foreground mb-2">{insight.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{insight.text}</p>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
        <button
            onClick={() => onSelect(insight.id)}
            className={`px-4 py-2 bg-gradient-to-r ${insight.color} text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform active:scale-95 text-sm`}
        >
            View Details
        </button>
      </div>
    </div>
  );
};

// --- Main InsightsTab Component ---

export default function InsightsTab({ theme }) {
    const [query, setQuery] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedInsights, setGeneratedInsights] = useState([]);
    const [selectedInsightId, setSelectedInsightId] = useState(null);

    const MOCK_INSIGHT_TEMPLATES = {
      "heatwave": {
        title: 'Subsurface Heatwave Detected',
        icon: Thermometer,
        color: 'from-red-500 to-orange-500',
        type: 'Anomaly',
        text: 'A significant subsurface heatwave is identified in the Arabian Sea, with temperatures reaching 3°C above the norm at 50m depth.',
        interpretation: `Analysis of float #67890 reveals a persistent body of unusually warm water (a "blob") between 40m and 80m. Unlike surface heatwaves which are easily tracked by satellites, this subsurface anomaly represents a hidden threat.\n\nThe temperature profile chart clearly shows a deviation from the established climatological average, peaking at +3.1°C. This is not a transient spike; the anomaly's persistence for 21 days suggests a stable and significant thermal feature. Such features are often linked to shifts in local current systems or a reduction in vertical mixing, trapping heat below the surface.`,
        prediction: `The trapped thermal energy is a significant source of fuel for atmospheric convection. We predict an increased likelihood of rapid intensification for any tropical disturbances passing over this region in the next 2-4 weeks. \n\nEcologically, this sustained heat stress can lead to coral bleaching in shallower reefs and force mobile marine species to seek deeper, cooler waters, disrupting the local food web. Continued monitoring of this feature is critical.`,
        location: { lat: 15.0, lon: 65.0, zoom: 5 },
        metrics: [
          { icon: Thermometer, value: "+3.1°C", label: "Max Anomaly", color: "text-red-500" },
          { icon: Layers, value: "65m", label: "Anomaly Depth", color: "text-blue-500" },
          { icon: Zap, value: "21 Days", label: "Duration", color: "text-yellow-500" },
          { icon: Globe, value: "Arabian Sea", label: "Region", color: "text-green-500" },
        ],
        chartData: {
            title: "Temperature Profile vs. Climatology",
            xAxisLabel: "Temperature (°C)",
            yAxisLabel: "Depth (m)",
            data: [
                { y: [0, 20, 40, 60, 80, 100, 150], x: [28, 27, 25, 22, 21, 20, 18], name: 'Climatology', type: 'scatter', mode: 'lines', line: { color: theme === 'dark' ? '#6b7280' : '#9ca3af', dash: 'dot' } },
                { y: [0, 20, 40, 60, 80, 100, 150], x: [28.5, 28, 28.1, 25, 22, 20.5, 18], name: 'Float #67890', type: 'scatter', mode: 'lines+markers', line: { color: '#ef4444', width: 3 } },
            ]
        }
      },
      "salinity": {
        title: 'Salinity Anomaly in Bay of Bengal',
        icon: Droplets,
        color: 'from-green-500 to-teal-500',
        type: 'Trend',
        text: 'Decreasing salinity observed over the last 6 months, likely linked to increased freshwater influx from river systems.',
        interpretation: `A consistent freshening trend is observed at the surface in the northern Bay of Bengal, with a total drop of 0.8 PSU over the last six months. This is a significant deviation from seasonal norms.\n\nThe chart shows a clear, near-linear decrease. This pattern strongly correlates with increased river discharge data from the Ganges-Brahmaputra system during the same period. This suggests a powerful land-ocean interaction where excess terrestrial runoff is creating a buoyant, fresh layer on the sea surface.`,
        prediction: `This strong surface stratification will act as a barrier, inhibiting the vertical mixing of nutrients from deeper waters. This could lead to a decrease in phytoplankton productivity in the short term. \n\nFurthermore, this low-salinity layer can trap solar heat, potentially contributing to the formation of warmer surface patches that could influence the development and trajectory of cyclones in the upcoming season. We recommend cross-referencing with chlorophyll and SST satellite data.`,
        location: { lat: 20.0, lon: 90.0, zoom: 6 },
        metrics: [
          { icon: Droplets, value: "-0.8 PSU", label: "Salinity Change", color: "text-green-500" },
          { icon: Globe, value: "6 Months", label: "Observation Period", color: "text-blue-500" },
          { icon: Layers, value: "0-10m", label: "Affected Depth", color: "text-cyan-500" },
          { icon: Zap, value: "High", label: "Cyclone Fuel", color: "text-orange-500" },
        ],
        chartData: {
            title: "Surface Salinity Trend",
            xAxisLabel: "Month",
            yAxisLabel: "Salinity (PSU)",
            data: [
                { x: ["Jan '25", "Feb '25", "Mar '25", "Apr '25", "May '25", "Jun '25"], y: [33.5, 33.2, 33.0, 32.8, 32.7, 32.6], name: 'Surface Salinity', type: 'scatter', mode: 'lines+markers', line: { color: '#22c55e', width: 3 } }
            ]
        }
      },
      "omz": {
          title: 'Oxygen Minimum Zone Expansion',
          icon: Wind,
          color: 'from-slate-500 to-slate-700',
          type: 'Biogeochemical',
          text: 'The Oxygen Minimum Zone (OMZ) shows vertical expansion, potentially stressing marine life.',
          interpretation: `Data from BGC float #23456 indicates a shoaling (vertical rise) of the upper boundary of the OMZ by approximately 20 meters compared to the same period last year. The OMZ is defined by oxygen concentrations below 20 μmol/kg.\n\nThe chart contrasts the current and previous year's profiles, illustrating how the low-oxygen water is now found at shallower depths. This vertical expansion effectively compresses the habitable zone for many oxygen-dependent species, forcing them into a narrower surface layer.`,
          prediction: `Continued shoaling of the OMZ will increase stress on regional fisheries, particularly demersal (bottom-dwelling) species. This could lead to shifts in fish populations and "dead zone" events where marine life cannot survive. \n\nThis trend is a critical climate change indicator, often linked to ocean warming (which reduces oxygen solubility) and changes in ocean stratification. The model predicts this trend will continue, with the upper boundary potentially rising another 5-10 meters over the next 18 months.`,
          location: { lat: 18.0, lon: 60.0, zoom: 5 },
          metrics: [
            { icon: Wind, value: "< 20 μmol/kg", label: "O₂ Concentration", color: "text-slate-500" },
            { icon: Layers, value: "20m Shoaling", label: "Vertical Change", color: "text-blue-500" },
            { icon: Zap, value: "High", label: "Ecosystem Risk", color: "text-red-500" },
            { icon: Globe, value: "Arabian Sea", label: "Region", color: "text-green-500" },
          ],
           chartData: {
            title: "Oxygen Profile Comparison",
            xAxisLabel: "Oxygen (μmol/kg)",
            yAxisLabel: "Depth (m)",
            data: [
                 { y: [50, 100, 150, 200, 300, 400], x: [90, 40, 15, 10, 12, 25], name: 'Current Profile', type: 'scatter', mode: 'lines+markers', line: { color: '#64748b', width: 3 } },
                 { y: [70, 120, 170, 220, 300, 400], x: [90, 40, 15, 10, 12, 25], name: 'Previous Year', type: 'scatter', mode: 'lines', line: { color: theme === 'dark' ? '#6b7280' : '#9ca3af', dash: 'dot' } },
            ]
        }
      },
       "cyclone": {
        title: 'Cyclone Fingerprint Identified',
        icon: Tornado ,
        color: 'from-purple-500 to-indigo-600',
        type: 'Event Analysis',
        text: 'Post-cyclone data shows a clear thermal wake and mixed layer deepening in the path of the storm.',
        interpretation: `Float #45678, which was in the direct path of a recent Tropical Cyclone, has provided a textbook example of a cyclone's impact on the upper ocean. The temperature profile reveals a significant cooling of the sea surface by -2.5°C.\n\nMore importantly, the data shows a deepening of the mixed layer from 50m to 85m. This is caused by the intense wind-driven churning, which brings cooler, deeper water to the surface and pushes the warm surface water down. This process is a primary mechanism of ocean heat uptake during a storm.`,
        prediction: `The thermal wake left by the cyclone will persist for several weeks, creating a 'cold scar' on the ocean surface that will inhibit the formation of new storms in the immediate area. \n\nThe nutrient-rich water brought to the surface is likely to trigger a significant phytoplankton bloom within the next 7-10 days, which should be visible on satellite ocean color imagery. This bloom will temporarily boost the local marine food web.`,
        location: { lat: 14.5, lon: 88.0, zoom: 6 },
        metrics: [
            { icon: Thermometer, value: "-2.5°C", label: "SST Cooling", color: "text-blue-500" },
            { icon: Layers, value: "+35m", label: "Mixed Layer Deepening", color: "text-purple-500" },
            { icon: Wind, value: "120 km/h", label: "Est. Wind Speed", color: "text-red-500" },
            { icon: Globe, value: "Bay of Bengal", label: "Region", color: "text-green-500" },
        ],
        chartData: {
            title: "Temperature Profile: Pre vs. Post-Cyclone",
            xAxisLabel: "Temperature (°C)",
            yAxisLabel: "Depth (m)",
            data: [
                { y: [0, 25, 50, 75, 100, 125], x: [29, 28.8, 28.5, 26, 24, 22], name: 'Pre-Cyclone', type: 'scatter', mode: 'lines', line: { color: theme === 'dark' ? '#6b7280' : '#9ca3af', dash: 'dot' } },
                { y: [0, 25, 50, 75, 100, 125], x: [26.5, 26.5, 26.5, 26.3, 25, 23], name: 'Post-Cyclone', type: 'scatter', mode: 'lines+markers', line: { color: '#8b5cf6', width: 3 } },
            ]
        }
      }
    };

    const handleGenerateInsight = (e) => {
        if (e) e.preventDefault();
        const currentQuery = query.trim() || "Show me a random insight";
        if (isGenerating) return;

        setIsGenerating(true);
        setTimeout(() => {
            const insightKeys = Object.keys(MOCK_INSIGHT_TEMPLATES);
            const randomKey = insightKeys[Math.floor(Math.random() * insightKeys.length)];
            const newInsight = {
                ...MOCK_INSIGHT_TEMPLATES[randomKey],
                id: `${randomKey}-${Date.now()}`,
                query: currentQuery,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setGeneratedInsights(prev => [newInsight, ...prev]);
            setQuery("");
            setIsGenerating(false);
        }, 2500);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
    };

    const selectedInsight = generatedInsights.find(i => i.id === selectedInsightId);

    if (selectedInsight) {
        return <InsightDetailView insight={selectedInsight} onClose={() => setSelectedInsightId(null)} theme={theme} />;
    }

    return (
        <section className="p-4 md:p-6 lg:p-8 h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2 flex items-center gap-3">
                    <Bot size={36} className="text-primary" />
                    AI-Powered Insights
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Ask a question about ARGO data. Our AI will analyze patterns, trends, and anomalies to generate a professional insight report.
                </p>
                <form onSubmit={handleGenerateInsight} className="mt-6 flex items-center gap-3 max-w-xl bg-card p-2 rounded-full shadow-lg border border-white/10">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'Analyze salinity trends in the Arabian Sea'"
                        className="w-full pl-4 pr-2 py-2 bg-transparent focus:outline-none text-foreground placeholder-muted-foreground"
                        disabled={isGenerating}
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() && isGenerating}
                        className="flex-shrink-0 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all transform active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate
                            </>
                        )}
                    </button>
                </form>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {generatedInsights.length === 0 && !isGenerating ? (
                    <div className="text-center animate-fade-in-up">
                        <h3 className="text-lg font-semibold text-foreground">Start by generating an insight</h3>
                        <p className="text-muted-foreground mt-1">Or try one of these suggestions:</p>
                        <div className="max-w-md mx-auto mt-4 space-y-2">
                            <SuggestionCard icon={Lightbulb} text="Look for temperature anomalies in the Southern Ocean" onClick={handleSuggestionClick} />
                            <SuggestionCard icon={Lightbulb} text="Show me the impact of a recent cyclone" onClick={handleSuggestionClick} />
                            <SuggestionCard icon={Lightbulb} text="Check for changes in Oxygen Minimum Zones" onClick={handleSuggestionClick} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {isGenerating && <SkeletonCard />}
                        {generatedInsights.map(insight => (
                            <InsightCard key={insight.id} insight={insight} onSelect={setSelectedInsightId} />
                        ))}
                    </div>
                )}
            </div>
             <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 3px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; }
             `}</style>
        </section>
    );
};