// src/hooks/useDragDropCells.ts
"use client";

import { useState, useEffect } from 'react';

export const useDragDropCells = (initialCells: string[], onDropCell: (cellId: string) => void) => {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Keyboard accessibility state
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

  // Keyboard interaction logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, cellId: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (liftedCell === cellId) {
        // Drop it on the target
        onDropCell(cellId);
        setStatusMessage(`${cellId} dropped into comparison.`);
        setLiftedCell(null);
      } else {
        // Lift the cell
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
