export interface TextEntry {
  id: string;
  category: 'standard' | 'quotes' | 'tech' | 'competitive';
  text: string;
  wordCount: number;
  hasPunctuation: boolean;
  hasNumbers: boolean;
}

export const TEXT_BANK: TextEntry[] = [
  {
    id: 'tech-01',
    category: 'tech',
    text: 'Modern distributed architectures require robust consensus algorithms to guarantee synchronization across concurrent network nodes. When low latency and high availability are essential, engineers prioritize decoupled messaging protocols, idempotent endpoints, and resilient error handling boundaries.',
    wordCount: 36,
    hasPunctuation: true,
    hasNumbers: false,
  },
  {
    id: 'tech-02',
    category: 'tech',
    text: 'A compiler translates source code into machine language through lexical analysis, syntax parsing, and optimization pipelines. Every symbol, token, and memory reference is verified to ensure program correctness and runtime safety.',
    wordCount: 31,
    hasPunctuation: true,
    hasNumbers: false,
  },
  {
    id: 'competitive-01',
    category: 'competitive',
    text: 'Speed is nothing without precision. In competitive typing tournaments, deliberate rhythm and steady keystrokes outperform erratic bursts of hurried speed every time. Focus on smooth movement, eliminate hesitation, and keep your cadence unbroken.',
    wordCount: 34,
    hasPunctuation: true,
    hasNumbers: false,
  },
  {
    id: 'competitive-02',
    category: 'competitive',
    text: 'The best typists do not glance down at their keyboards. Muscle memory bridges the visual cortex directly to the fingertips, translating complex syntax into rapid physical executions within fractions of a second.',
    wordCount: 32,
    hasPunctuation: true,
    hasNumbers: false,
  },
  {
    id: 'quotes-01',
    category: 'quotes',
    text: 'Simplicity is prerequisite for reliability. Programs must be written for people to read, and only incidentally for machines to execute. Elegance in design yields resilience in production.',
    wordCount: 26,
    hasPunctuation: true,
    hasNumbers: false,
  },
  {
    id: 'standard-01',
    category: 'standard',
    text: 'The dawn revealed a crisp morning over the campus as students gathered for the championship. Every terminal flickered in unison, ready to record every strike, pause, and surge of typing speed across the arena.',
    wordCount: 35,
    hasPunctuation: true,
    hasNumbers: false,
  },
  {
    id: 'tech-numbers-01',
    category: 'tech',
    text: 'In 2026, network infrastructure operates at 100 gigabits per second with under 5 milliseconds of round trip delay. Version 4.2 of the protocol handles over 250000 transactions per second across 64 regional server clusters.',
    wordCount: 34,
    hasPunctuation: true,
    hasNumbers: true,
  },
  {
    id: 'quotes-02',
    category: 'quotes',
    text: 'First solve the problem, then write the code. Premature optimization is the root of all evil in software engineering. Master fundamentals, verify your assumptions, and test every edge condition thoroughly.',
    wordCount: 31,
    hasPunctuation: true,
    hasNumbers: false,
  },
];

export function selectTargetText(options: {
  hasPunctuation?: boolean;
  hasNumbers?: boolean;
  minWords?: number;
}): TextEntry {
  let filtered = TEXT_BANK;

  if (options.hasNumbers === false) {
    filtered = filtered.filter((t) => !t.hasNumbers);
  }
  if (options.hasPunctuation === false) {
    filtered = filtered.filter((t) => !t.hasPunctuation);
  }

  if (filtered.length === 0) {
    filtered = TEXT_BANK;
  }

  const selected = filtered[Math.floor(Math.random() * filtered.length)];

  // If minWords is requested (for 60s or 120s timer tests where fast typists need 100+ words),
  // duplicate or chain texts gracefully to avoid typists running out of text!
  const targetWords = options.minWords || 70;
  if (selected.wordCount < targetWords) {
    // Combine 2 or 3 texts into a coherent long prompt
    const other = TEXT_BANK.filter((t) => t.id !== selected.id);
    const chained = [selected.text];
    let currentWords = selected.wordCount;
    for (const t of other) {
      if (currentWords >= targetWords) break;
      chained.push(t.text);
      currentWords += t.wordCount;
    }
    return {
      id: `${selected.id}-chained-${Date.now().toString(36)}`,
      category: selected.category,
      text: chained.join(' '),
      wordCount: currentWords,
      hasPunctuation: selected.hasPunctuation,
      hasNumbers: selected.hasNumbers,
    };
  }

  return selected;
}
