// src/app/components/tabs/CompareTab.tsx
"use client";

import React from 'react';
import ResearcherCompare from './ReasercherCompare';
import NewbieDistinguish from './newbie/NewbieDistinguish';
import { Mode } from '../../types';

type Props = {
  theme?: "light" | "dark";
  mode?: Mode;
};

export default function CompareTab({ theme = "light", mode = 'researcher' }: Props) {
  // This is the switch that directs to the correct component.
  if (mode === 'newbie') {
    // For "Newbie" mode, it MUST render NewbieDistinguish.
    return <NewbieDistinguish theme={theme} />;
  }
  
  // For "Researcher" mode, it renders the full-featured component.
  return <ResearcherCompare theme={theme} />;
}