import React from 'react';

interface CodeMeetLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWebflow?: boolean;
}

export const CodeMeetLogo: React.FC<CodeMeetLogoProps> = ({
  className = '',
  size = 'md',
  showWebflow = true,
}) => {
  const heightClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  }[size];

  const webflowHeightClasses = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Code Meet Logo */}
      <img
        src="/codemeet-logo.png"
        alt="Code Meet - SUIET Mukka"
        className={`${heightClasses} w-auto object-contain mix-blend-screen`}
      />

      {/* Divider & Webflow Partner Logo */}
      {showWebflow && (
        <>
          <span className="h-4 w-px bg-zinc-700/60" aria-hidden="true" />
          <img
            src="/webflow-logo.jpg"
            alt="Webflow"
            className={`${webflowHeightClasses} w-auto object-contain mix-blend-screen`}
          />
        </>
      )}
    </div>
  );
};
