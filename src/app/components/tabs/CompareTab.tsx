// src/app/components/tabs/CompareTab.tsx
"use client";

import React from 'react';
import ResearcherCompare from './ReasercherCompare';
import NewbieCompare from './newbie/NewbieDistinguish';
import { Mode } from '../../types';

type Props = {
  theme?: "light" | "dark";
  mode?: Mode;
};

export default function CompareTab({ theme = "light", mode = 'researcher' }: Props) {
  if (mode === 'newbie') {
    return <NewbieCompare theme={theme} />;
  }
  
  return <ResearcherCompare theme={theme} />;
}