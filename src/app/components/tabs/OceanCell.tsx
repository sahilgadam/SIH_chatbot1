// src/app/components/tabs/OceanCell.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';

interface OceanCellProps {
  id: string;
  label: string;
  metricValue: number;
  color: string;
  isDragging: boolean;
  lifted: boolean;
  onDragStart: (event: MouseEvent | TouchEvent | PointerEvent, info: any) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export default function OceanCell({ id, label, metricValue, color, isDragging, lifted, onDragStart, onKeyDown }: OceanCellProps) {
  return (
    <motion.div
      layoutId={id}
      draggable="true"
      onDragStart={onDragStart}
      onKeyDown={onKeyDown}
      role="button"
      aria-grabbed={isDragging || lifted}
      aria-label={`Drag ${label} ocean to comparison`}
      tabIndex={0}
      className={`ocean-cell ${isDragging ? 'dragging' : ''} ${lifted ? 'lifted' : ''}`}
      style={{ borderColor: color }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="cell-label">{label}</div>
      <div className="cell-metric-badge">
        <Thermometer size={10} />
        <span>{metricValue.toFixed(1)}°C</span>
      </div>
    </motion.div>
  );
}
