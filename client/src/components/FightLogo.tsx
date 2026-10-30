import React from 'react';
import { CodeMeetLogo } from './CodeMeetLogo.js';

interface FightLogoProps {
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
  showWordmark?: boolean;
}

export const FightLogo: React.FC<FightLogoProps> = ({ size, className = '', showWordmark = true }) => {
  const mappedSize = typeof size === 'number' ? (size < 30 ? 'sm' : size > 40 ? 'lg' : 'md') : size;
  return <CodeMeetLogo className={className} size={mappedSize} showWebflow={showWordmark} />;
};
