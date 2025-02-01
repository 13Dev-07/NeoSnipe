import React, { useState, useEffect } from 'react';
import { SacredTransitionManager } from './SacredTransitionManager';
import { TetrahedronSolid } from '../patterns/TetrahedronSolid';
import { HexahedronSolid } from '../patterns/HexahedronSolid';
import { OctahedronSolid } from '../patterns/OctahedronSolid';
import { DodecahedronSolid } from '../patterns/DodecahedronSolid';
import { IcosahedronSolid } from '../patterns/IcosahedronSolid';
import { MetatronsCube } from '../patterns/MetatronsCube';
import { VesicaPiscis } from '../patterns/VesicaPiscis';
import { TorusEnergyFlow } from '../patterns/TorusEnergyFlow';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

// Define sacred transition timings using Fibonacci sequence
const TRANSITION_TIMINGS = {
  duration: 1597, // Fibonacci number (ms)
  interval: 2584  // Fibonacci number (ms)
};

export const SacredTransitionExample: React.FC = () => {
  const [activePattern, setActivePattern] = useState(0);
  
  const patterns = [
    TetrahedronSolid,
    HexahedronSolid,
    OctahedronSolid,
    DodecahedronSolid,
    IcosahedronSolid,
    MetatronsCube,
    VesicaPiscis,
    TorusEnergyFlow
  ];

  // Cycle through patterns with sacred timing
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePattern((current) => (current + 1) % patterns.length);
    }, TRANSITION_TIMINGS.interval);

    return () => clearInterval(interval);
  }, []);

  const CurrentPattern = patterns[activePattern];

  return (
    <SacredTransitionManager
      size={15}
      color="#00FFCC"
      transitionSpeed={0.001 * (1 / PHI)}
      energyFlowIntensity={1.0}
    >
      <CurrentPattern />
    </SacredTransitionManager>
  );
};