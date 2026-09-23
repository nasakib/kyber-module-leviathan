import React, { useEffect, useRef } from 'react';
import { CombatLogEntry } from '../types/game';
import { Terminal, Shield, AlertTriangle, Zap, Activity, X } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
  onClose?: () => void;
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeStyle = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'player_action':
        return 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
      case 'boss_attack':
        return 'text-rose-400 border-rose-950 bg-rose-950/20';
      case 'warning':
        return 'text-amber-400 border-amber-950 bg-amber-950/20';
      case 'phase_change':
        return 'text-cyan-400 border-cyan-950 bg-cyan-950/30 font-bold';
      case 'critical':
        return 'text-purple-400 border-purple-950 bg-purple-950/30 font-bold';
      default:
        return 'text-slate-400 border-slate-900 bg-slate-900/10';
    }
  };

  const getIcon = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'player_action':
        return <Zap className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5 shrink-0" />;
      case 'boss_attack':
        return <Shield className="w-3.5 h-3.5 text-rose-400 inline mr-1.5 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline mr-1.5 shrink-0" />;
      case 'phase_change':
        return <Activity className="w-3.5 h-3.5 text-cyan-400 inline mr-1.5 shrink-0" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-slate-500 inline mr-1.5 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-hidden shadow-lg backdrop-blur">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          CRYPTANALYSIS TELEMETRY LOG
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400/80 animate-pulse hidden sm:inline">● LIVE STREAM</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition min-h-[30px] min-w-[30px] flex items-center justify-center"
              title="Close / Exit Telemetry Log to expand canvas"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-2 rounded border text-[11px] flex flex-col gap-0.5 transition-all ${getTypeStyle(
              log.type
            )}`}
          >
            <div className="flex items-start gap-1">
              {getIcon(log.type)}
              <span className="text-slate-500 font-normal shrink-0">[{log.timestamp}]</span>
              <span className="break-words leading-relaxed font-semibold">{log.text}</span>
            </div>
            {log.simpleTranslation && (
              <div className="text-[10px] text-slate-400 pl-6 italic font-normal">
                💡 Translation: {log.simpleTranslation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
