import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  BarChart2,
  Target,
  Brain,
  AlertTriangle,
  Signal,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Info,
  Zap,
  Link,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── CONTENT DATA ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'stock-basics',
    icon: BookOpen,
    title: 'Stock Basics',
    tag: 'Beginner',
    tagVariant: 'secondary',
    relatedIds: [2],
    status: 'completed',
    energy: 100,
    date: 'Chapter 1',
    content: [
      { type: 'heading', text: 'What Is a Stock?' },
      { type: 'paragraph', text: 'A stock represents a single unit of ownership in a company. When you buy a share of Apple (AAPL), you own a tiny slice of Apple Inc. If the company grows more valuable, your slice is worth more. If it shrinks, so does yours.' },
      { type: 'paragraph', text: "In CANDLE, you don't buy stocks — you predict how they'll perform around their earnings reports. But understanding what a stock actually is helps you reason about why prices move." },
      { type: 'heading', text: 'Market Cap: Size Matters' },
      { type: 'paragraph', text: "Market capitalisation (market cap) is the total value of all a company's shares combined. It tells you the size of the company in the market's eyes." },
      {
        type: 'table',
        headers: ['Category', 'Market Cap Range', 'Examples', 'Prediction Behaviour'],
        rows: [
          ['Large Cap', '$10B+', 'AAPL, MSFT, JPM', 'More predictable, dense analyst coverage'],
          ['Mid Cap', '$2B – $10B', 'PLTR, ROKU, SNAP', 'More volatile, bigger surprises possible'],
          ['Small Cap', '< $2B', 'Various', 'Least covered, highest surprise potential'],
        ],
      },
      { type: 'tip', text: 'When predicting a large-cap stock, analyst consensus is usually well-informed. For small-caps, the consensus can be way off — factor that into your confidence level.' },
      { type: 'heading', text: 'Price vs. Value' },
      { type: 'paragraph', text: "A stock's price is just the number on the screen. Its value is what the business is actually worth based on earnings, growth, and future potential. These two numbers are often different — and the gap between them is exactly why earnings reports matter so much." },
      { type: 'heading', text: 'Why Prices Move Before Earnings' },
      { type: 'paragraph', text: 'Stocks often drift up or down in the days leading up to an earnings report. This is the market pricing in expectations. If traders broadly expect a Beat, the price may already rise before the report drops.' },
      { type: 'warning', text: "Don't confuse pre-earnings price movement with the earnings result itself. A stock can rise going into earnings and still fall after — if the result doesn't match the elevated expectations." },
    ],
  },
  {
    id: 'earnings-financials',
    icon: BarChart2,
    title: 'Earnings & Financials',
    tag: 'Beginner',
    tagVariant: 'secondary',
    relatedIds: [1, 3],
    status: 'completed',
    energy: 88,
    date: 'Chapter 2',
    content: [
      { type: 'heading', text: 'What Is an Earnings Report?' },
      { type: 'paragraph', text: 'Every publicly traded company is required to report its financial results four times a year (quarterly). These reports reveal how much money the company made, how much it spent, and what it expects going forward.' },
      { type: 'paragraph', text: 'Earnings season is when most companies release these reports in a concentrated window — usually in January, April, July, and October. This is the heartbeat of CANDLE.' },
      { type: 'heading', text: 'EPS: The Number Everyone Watches' },
      { type: 'paragraph', text: "EPS stands for Earnings Per Share. It's the company's profit divided by the number of shares outstanding. It's the single most watched number in an earnings report." },
      { type: 'example', title: 'EPS in Action', text: 'If analysts expect Microsoft (MSFT) to report EPS of $2.80 and Microsoft reports $3.05, that\'s a Beat. The actual number exceeded what the market expected. Your prediction of "Beat" would be correct.' },
      { type: 'heading', text: 'Guidance: The Forward Look' },
      { type: 'paragraph', text: "Guidance is management's own forecast for the next quarter or fiscal year. This is often MORE important than the current quarter's results. The stock market is forward-looking — it prices in the future, not the past." },
      { type: 'warning', text: 'A company can Beat on EPS and Revenue but issue weak guidance — and the stock will fall. Guidance is the single most underestimated factor for prediction accuracy.' },
      {
        type: 'table',
        headers: ['Metric', 'Compares To', 'Best Used For'],
        rows: [
          ['YoY Growth', 'Same quarter, last year', 'Understanding long-term trends'],
          ['QoQ Growth', 'Previous quarter', 'Spotting short-term momentum or slowdown'],
        ],
      },
      { type: 'tip', text: 'If most analysts recently revised their estimates upward, the consensus bar is higher. A company might still technically Beat but by less than expected — making the reaction muted.' },
    ],
  },
  {
    id: 'beat-meet-miss',
    icon: Target,
    title: 'Beat · Meet · Miss',
    tag: 'Core',
    tagVariant: 'default',
    relatedIds: [2, 4],
    status: 'in-progress',
    energy: 72,
    date: 'Chapter 3',
    content: [
      { type: 'heading', text: 'The Foundation of Every Prediction' },
      { type: 'paragraph', text: "Every prediction you make in CANDLE boils down to one question: will this company's earnings result come in above, in line with, or below what analysts expect? That's Beat, Meet, or Miss." },
      {
        type: 'table',
        headers: ['Outcome', 'What It Means', 'Typical Signal'],
        rows: [
          ['🟢 Beat', 'Actual EPS > Analyst Consensus EPS', 'Company outperformed expectations'],
          ['🟡 Meet', 'Actual EPS ≈ Analyst Consensus EPS', 'Company matched expectations'],
          ['🔴 Miss', 'Actual EPS < Analyst Consensus EPS', 'Company underperformed expectations'],
        ],
      },
      { type: 'heading', text: 'Why a Stock Can Fall After a Beat' },
      { type: 'paragraph', text: "This is one of the most important and counterintuitive lessons. A stock CAN fall even after reporting a Beat. The market doesn't just react to the number — it reacts to the surprise relative to what was already priced in." },
      { type: 'example', title: 'Buy the Rumor, Sell the News', text: 'Imagine a stock has already risen 15% in the two weeks before earnings because traders were confident in a Beat. The company reports a Beat — but only a small one. The result was already priced in. Traders sell to lock in profits. The stock drops despite a Beat.' },
      { type: 'warning', text: "In CANDLE, Beat / Meet / Miss is evaluated purely on whether the actual result exceeded, matched, or fell short of consensus. Pre-earnings price movement doesn't change your prediction outcome — but understanding it helps you choose the right prediction." },
      { type: 'tip', text: 'Companies that have a history of beating estimates by a small margin often do so again — analysts sometimes deliberately set the bar slightly low. If a stock has beaten by 2–5% for four consecutive quarters, a small Beat is the most likely outcome.' },
    ],
  },
  {
    id: 'prediction-strategy',
    icon: Brain,
    title: 'Prediction Strategy',
    tag: 'Strategy',
    tagVariant: 'outline',
    relatedIds: [3, 5],
    status: 'in-progress',
    energy: 55,
    date: 'Chapter 4',
    content: [
      { type: 'heading', text: 'When to Choose Beat' },
      { type: 'paragraph', text: 'Predict Beat when you believe the company will report EPS above analyst consensus. Strong signals include: consistent history of beating estimates, positive pre-earnings guidance revisions, industry tailwinds, and management that tends to guide conservatively.' },
      { type: 'heading', text: 'When to Choose Miss' },
      { type: 'paragraph', text: 'Predict Miss when you have reason to believe the company will fall short. This is the hardest and riskiest prediction. Strong signals include: company recently warned or lowered guidance, significant industry headwinds, or consensus estimates that seem unrealistically optimistic.' },
      { type: 'example', title: 'Strategy in Practice', text: 'A conservative player might predict Beat on AAPL (which has beaten consensus in 80%+ of recent quarters). An aggressive player might predict Miss on a hyped stock where the consensus estimate was recently raised sharply — betting the bar is now too high.' },
      { type: 'heading', text: 'Using Confidence Levels Wisely' },
      { type: 'paragraph', text: "Your confidence level reflects how sure you are. Set high confidence when you have strong, evidence-based reasoning. Set low confidence when you're making a speculative or contrarian call. High confidence on a wrong prediction costs more than low confidence on the same wrong prediction." },
      { type: 'tip', text: "If you find yourself always predicting Beat at high confidence, you're likely being overconfident. Check your Analytics page to see how well-calibrated you are." },
    ],
  },
  {
    id: 'common-mistakes',
    icon: AlertTriangle,
    title: 'Common Mistakes',
    tag: 'Tips',
    tagVariant: 'destructive',
    relatedIds: [4, 6],
    status: 'pending',
    energy: 35,
    date: 'Chapter 5',
    content: [
      { type: 'heading', text: 'Overconfidence' },
      { type: 'warning', text: "The #1 mistake. New predictors tend to assign high confidence to almost every prediction. The market is unpredictable — even experienced analysts are wrong regularly. If your confidence is always above 80%, you're not calibrating properly." },
      { type: 'heading', text: 'Ignoring Guidance' },
      { type: 'warning', text: 'Many predictors focus only on whether EPS will Beat or Miss. But a company can Beat on EPS and crater on guidance — and the market will punish it. Always factor in what management is saying about the future.' },
      { type: 'heading', text: 'Following the Hype' },
      { type: 'warning', text: "Social media and news headlines create noise. A stock trending on Twitter doesn't mean it's more likely to Beat. High-hype stocks often have elevated consensus estimates — making a Beat harder, not easier." },
      { type: 'heading', text: 'Recency Bias' },
      { type: 'warning', text: "If a company Beat last quarter, you might assume it'll Beat again. Sometimes that's right — but not always. A company that Beat three quarters in a row might be approaching a quarter where the bar has been raised too high." },
      { type: 'heading', text: 'Not Reviewing Your Predictions' },
      { type: 'warning', text: 'The fastest way to improve is to study your mistakes. After each earnings season, go through your predictions — especially the wrong ones. Your Analytics and My Predictions pages are built for exactly this.' },
    ],
  },
  {
    id: 'market-signals',
    icon: Signal,
    title: 'Market Signals',
    tag: 'Advanced',
    tagVariant: 'outline',
    relatedIds: [5],
    status: 'pending',
    energy: 18,
    date: 'Chapter 6',
    content: [
      { type: 'advanced-banner', text: "This section covers more advanced signals. These are not required to make good predictions, but understanding them can give you an edge." },
      { type: 'heading', text: 'Pre-Earnings Price Movement' },
      { type: 'paragraph', text: 'Stocks often drift in a predictable direction before earnings — this is called the "pre-earnings announcement drift" (PEAD). If a stock has historically beaten estimates, it may drift upward before the next report. A significant upward drift suggests the market is already expecting good results.' },
      { type: 'heading', text: 'Analyst Upgrades & Downgrades' },
      { type: 'paragraph', text: 'When an analyst upgrades a stock (e.g., Hold to Buy), it signals expected better performance. Multiple upgrades before earnings can indicate growing confidence in a Beat. Pay attention to the timing — upgrades right before earnings are more meaningful.' },
      { type: 'heading', text: 'Volume Spikes' },
      { type: 'paragraph', text: "An unusual spike in trading volume before earnings suggests large institutional investors are taking positions. If volume is surging and the price is rising, informed traders may be betting on a Beat. Volume alone isn't conclusive, but combined with price direction, it adds context." },
      { type: 'heading', text: 'Sentiment Indicators' },
      { type: 'paragraph', text: 'Options market activity can reveal sentiment. A high ratio of call options to put options before earnings suggests bullish sentiment. However, extreme bullish sentiment can sometimes be a contrarian signal — when everyone is betting on a Beat, the risk of disappointment increases.' },
      { type: 'tip', text: 'Use these signals as additional context, not standalone decision drivers. The strongest predictions combine fundamental analysis with these market signals.' },
    ],
  },
];

// ─── BLOCK RENDERERS ─────────────────────────────────────────────────────────
function Heading({ text }) {
  return <h3 className="text-lg font-semibold tracking-tight mt-6 mb-2 first:mt-0 text-white">{text}</h3>;
}
function Paragraph({ text }) {
  return <p className="text-sm text-candle-muted-blue leading-relaxed mb-3">{text}</p>;
}
function TipBlock({ text }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-green-400/30 bg-green-400/10 backdrop-blur-sm p-4">
      <Lightbulb className="size-5 text-green-400 shrink-0 mt-0.5" />
      <p className="text-sm text-green-400 leading-relaxed">{text}</p>
    </div>
  );
}
function WarningBlock({ text }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm p-4">
      <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-300 leading-relaxed">{text}</p>
    </div>
  );
}
function ExampleBlock({ title, text }) {
  return (
    <div className="my-4 rounded-lg border border-candle-electric-blue/30 glass-card p-4">
      <p className="text-xs font-semibold text-candle-muted-blue uppercase tracking-wider mb-1">Example</p>
      <p className="text-sm font-medium mb-1.5 text-white">{title}</p>
      <p className="text-sm text-candle-muted-blue leading-relaxed">{text}</p>
    </div>
  );
}
function AdvancedBanner({ text }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg border border-candle-accent-blue/30 bg-candle-accent-blue/10 backdrop-blur-sm p-4">
      <Info className="size-5 text-candle-accent-blue shrink-0 mt-0.5" />
      <p className="text-sm text-candle-accent-blue leading-relaxed font-medium">{text}</p>
    </div>
  );
}
function TableBlock({ headers, rows }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-candle-electric-blue/20">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-candle-electric-blue/10">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 text-candle-muted-blue font-semibold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-t border-candle-electric-blue/10 ${ri % 2 === 1 ? 'bg-candle-electric-blue/5' : ''}`}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-sm text-white">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function renderBlock(block, idx) {
  switch (block.type) {
    case 'heading':         return <Heading key={idx} text={block.text} />;
    case 'paragraph':       return <Paragraph key={idx} text={block.text} />;
    case 'tip':             return <TipBlock key={idx} text={block.text} />;
    case 'warning':         return <WarningBlock key={idx} text={block.text} />;
    case 'example':         return <ExampleBlock key={idx} title={block.title} text={block.text} />;
    case 'advanced-banner': return <AdvancedBanner key={idx} text={block.text} />;
    case 'table':           return <TableBlock key={idx} headers={block.headers} rows={block.rows} />;
    default:                return null;
  }
}

// ─── RADIAL ORBITAL NAVIGATOR (21dev UI effect) ───────────────────────────────
function OrbitalNavigator({ sections, activeId, onSelect }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [activeNodeId, setActiveNodeId] = useState(null);
  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  // Map sections to 1-based numeric IDs for the orbital system
  const orbitalData = sections.map((s, i) => ({ ...s, orbitalId: i + 1 }));

  // Auto-rotate ticker
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle(prev => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 140;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedOrbitalIds = (orbitalId) => {
    const section = orbitalData.find(s => s.orbitalId === orbitalId);
    return section ? section.relatedIds : [];
  };

  const isRelatedToActive = (orbitalId) => {
    if (!activeNodeId) return false;
    return getRelatedOrbitalIds(activeNodeId).includes(orbitalId);
  };

  const centerViewOnNode = (orbitalId) => {
    const nodeIndex = orbitalData.findIndex(s => s.orbitalId === orbitalId);
    if (nodeIndex === -1) return;
    const targetAngle = (nodeIndex / orbitalData.length) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (section, e) => {
    e.stopPropagation();
    const id = section.orbitalId;

    setExpandedItems(prev => {
      const newState = {};
      // Close all others
      Object.keys(prev).forEach(key => { newState[parseInt(key)] = false; });
      const isOpening = !prev[id];
      newState[id] = isOpening;

      if (isOpening) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const related = getRelatedOrbitalIds(id);
        const pulse = {};
        related.forEach(rid => { pulse[rid] = true; });
        setPulseEffect(pulse);
        centerViewOnNode(id);
        onSelect(section.id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getStatusStyles = (status) => {
    if (status === 'completed') return 'text-white bg-black border-white';
    if (status === 'in-progress') return 'text-black bg-white border-black';
    return 'text-white bg-black/40 border-white/50';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height: 340 }}
      onClick={handleContainerClick}
    >
      {/* Orbit ring */}
      <div
        ref={orbitRef}
        className="absolute w-full h-full flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {/* Orbital track ring */}
        <div className="absolute w-72 h-72 rounded-full border border-white/10 pointer-events-none" />

        {/* Center core — same as 21dev */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10 pointer-events-none">
          <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70" />
          <div
            className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50"
            style={{ animationDelay: '0.5s' }}
          />
          <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md" />
        </div>

        {/* Orbital nodes */}
        {orbitalData.map((section, index) => {
          const pos = calculateNodePosition(index, orbitalData.length);
          const isExpanded = !!expandedItems[section.orbitalId];
          const isRelated = isRelatedToActive(section.orbitalId);
          const isPulsing = !!pulseEffect[section.orbitalId];
          const isActive = section.id === activeId;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              ref={el => (nodeRefs.current[section.orbitalId] = el)}
              className="absolute transition-all duration-700 cursor-pointer"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isExpanded ? 200 : pos.zIndex,
                opacity: isExpanded ? 1 : pos.opacity,
              }}
              onClick={(e) => toggleItem(section, e)}
            >
              {/* Energy aura radial glow */}
              <div
                className={`absolute rounded-full pointer-events-none ${isPulsing ? 'animate-pulse' : ''}`}
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                  width: `${section.energy * 0.5 + 40}px`,
                  height: `${section.energy * 0.5 + 40}px`,
                  left: `-${(section.energy * 0.5 + 40 - 40) / 2}px`,
                  top: `-${(section.energy * 0.5 + 40 - 40) / 2}px`,
                }}
              />

              {/* Node icon button */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isExpanded
                    ? 'bg-white text-black border-white shadow-lg shadow-white/30 scale-150'
                    : isRelated
                    ? 'bg-white/50 text-black border-white animate-pulse'
                    : isActive
                    ? 'bg-white/20 text-white border-white/60'
                    : 'bg-black text-white border-white/40'}
                `}
              >
                <Icon size={16} />
              </div>

              {/* Label */}
              <div
                className={`
                  absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-xs font-semibold tracking-wider transition-all duration-300
                  ${isExpanded || isActive ? 'text-white scale-110' : 'text-white/60'}
                `}
              >
                {section.title}
              </div>

              {/* Expanded card — matches 21dev Card design */}
              {isExpanded && (
                <div
                  className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl shadow-white/10 overflow-visible"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Connector line */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />

                  <div className="p-4">
                    {/* Status + Date row */}
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusStyles(section.status)}`}>
                        {section.status === 'completed' ? 'COMPLETE' : section.status === 'in-progress' ? 'IN PROGRESS' : 'PENDING'}
                      </span>
                      <span className="text-xs font-mono text-white/50">{section.date}</span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-white mb-3">{section.title}</p>

                    {/* Energy bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-white/50">
                          <Zap size={10} /> Energy Level
                        </span>
                        <span className="font-mono text-white/50">{section.energy}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${section.energy}%` }}
                        />
                      </div>
                    </div>

                    {/* Related / Connected Nodes */}
                    {section.relatedIds && section.relatedIds.length > 0 && (
                      <div className="border-t border-white/10 pt-3">
                        <div className="flex items-center gap-1 mb-2">
                          <Link size={10} className="text-white/50" />
                          <p className="text-xs uppercase tracking-wider font-medium text-white/50">Connected Nodes</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {section.relatedIds.map(rid => {
                            const rel = orbitalData[rid - 1];
                            if (!rel) return null;
                            return (
                              <button
                                key={rid}
                                className="flex items-center h-6 px-2 text-xs border border-white/20 bg-transparent hover:bg-white/10 text-white/70 hover:text-white rounded transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(rel.id);
                                  toggleItem(rel, e);
                                }}
                              >
                                {rel.title}
                                <ArrowRight size={8} className="ml-1 text-white/40" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CONTENT MODAL ───────────────────────────────────────────────────────────
function ContentModal({ sectionId, onClose, onNavigate }) {
  const current = SECTIONS.find(s => s.id === sectionId);
  const currentIndex = SECTIONS.findIndex(s => s.id === sectionId);
  const prev = currentIndex > 0 ? SECTIONS[currentIndex - 1] : null;
  const next = currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null;
  const Icon = current?.icon;

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!current) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* Modal panel — stop propagation so clicks inside don't close */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-candle-electric-blue/25 bg-[#0a0d1a] shadow-2xl shadow-black/60 overflow-hidden"
        style={{
          animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-candle-electric-blue/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-candle-electric-blue/20 border border-candle-electric-blue/30">
              <Icon className="size-5 text-candle-accent-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">{current.title}</span>
                <Badge
                  variant={current.tagVariant}
                  className={
                    current.tagVariant === 'default'
                      ? 'bg-candle-electric-blue/20 text-candle-electric-blue border-candle-electric-blue/30'
                      : current.tagVariant === 'secondary'
                      ? 'bg-candle-muted-blue/20 text-candle-muted-blue border-candle-muted-blue/30'
                      : current.tagVariant === 'destructive'
                      ? 'bg-red-400/20 text-red-400 border-red-400/30'
                      : 'bg-candle-electric-blue/10 text-candle-muted-blue border-candle-electric-blue/20'
                  }
                >
                  {current.tag}
                </Badge>
              </div>
              <p className="text-xs text-candle-muted-blue mt-0.5">
                {current.date} · Section {currentIndex + 1} of {SECTIONS.length}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="modal-scroll flex-1 overflow-y-auto px-6 py-5 text-left"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,179,237,0.5) transparent' }}
        >
          {current.content.map((block, idx) => renderBlock(block, idx))}
        </div>

        {/* Footer — prev / next */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 shrink-0">
          <button
            onClick={() => prev && onNavigate(prev.id)}
            disabled={!prev}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${prev
                ? 'border-candle-electric-blue/30 text-white hover:bg-white/5 hover:border-candle-electric-blue/50'
                : 'opacity-25 cursor-not-allowed border-white/10 text-white/30'}`}
          >
            <ChevronLeft className="size-4" />
            {prev ? prev.title : 'Previous'}
          </button>

          {/* Chapter dots */}
          <div className="flex items-center gap-1.5">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className={`rounded-full transition-all duration-200 ${
                  s.id === sectionId
                    ? 'w-4 h-2 bg-candle-electric-blue'
                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => next && onNavigate(next.id)}
            disabled={!next}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
              ${next
                ? 'border-candle-electric-blue/30 text-white hover:bg-white/5 hover:border-candle-electric-blue/50'
                : 'opacity-25 cursor-not-allowed border-white/10 text-white/30'}`}
          >
            {next ? next.title : 'Next'}
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-scroll::-webkit-scrollbar { width: 5px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 99px; }
        .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(99,179,237,0.45);
          border-radius: 99px;
          transition: background 0.25s ease;
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,179,237,0.8); }
      `}</style>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function LearningCenter({ activeSection: propSection, onSectionChange }) {
  const [internalSection, setInternalSection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // When a section is selected (tab click or node click), open modal
  const handleSelect = (id) => {
    setInternalSection(id);
    setModalOpen(true);
    onSectionChange?.(id);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleNavigate = (id) => {
    setInternalSection(id);
    onSectionChange?.(id);
  };

  const displaySection = propSection || internalSection;

  return (
    <div className="flex-1 space-y-16 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Learning Center</h1>
        <p className="text-candle-muted-blue">Master the art of earnings predictions</p>
      </div>

      {/* Orbital Navigator — full page, no content below */}
      <div className="w-full rounded-xl border border-candle-electric-blue/20 bg-black overflow-hidden ">
        <OrbitalNavigator
          sections={SECTIONS}
          activeId={displaySection}
          onSelect={handleSelect}
        />
        {/* Tab strip */}
        <div className="flex justify-center gap-2 pb-4 pt-4 flex-wrap px-4">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                s.id === displaySection && modalOpen
                  ? 'border-white/60 text-white bg-white/10'
                  : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/70'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content Modal — rendered as portal-style overlay */}
      {modalOpen && displaySection && (
        <ContentModal
          sectionId={displaySection}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default LearningCenter;