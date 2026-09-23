import React from 'react';
import { RosettaRow } from '../types/game';
import { Table, Eye, Sparkles, BookOpen, Compass } from 'lucide-react';

interface RosettaTableProps {
  rows: RosettaRow[];
  activeHighlightKey?: string;
  onHoverRow: (highlightKey?: string) => void;
  onLeaveRow: () => void;
}

export const RosettaTable: React.FC<RosettaTableProps> = ({
  rows,
  activeHighlightKey,
  onHoverRow,
  onLeaveRow,
}) => {
  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* Table Header Info Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-3 backdrop-blur shadow-lg flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            THE ROSETTA STONE: BRIDGING INTUITION & RIGOR
          </h4>
        </div>
        <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 flex items-center gap-1">
          <Eye className="w-3 h-3" /> Hover row to illuminate canvas elements
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              <th className="p-3 w-1/4">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <BookOpen className="w-3.5 h-3.5" /> School / Algebra Concept
                </span>
              </th>
              <th className="p-3 w-1/4">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Eye className="w-3.5 h-3.5" /> Visual Canvas Element
                </span>
              </th>
              <th className="p-3 w-1/4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" /> Formal Calculus / Higher Math
                </span>
              </th>
              <th className="p-3 w-1/4">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Table className="w-3.5 h-3.5" /> Mechanical Intuition (Plain English)
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row) => {
              const isHighlighted = activeHighlightKey === row.highlightKey && Boolean(row.highlightKey);
              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => onHoverRow(row.highlightKey)}
                  onMouseLeave={onLeaveRow}
                  className={`transition-colors duration-150 cursor-pointer ${
                    isHighlighted
                      ? 'bg-cyan-950/50 border-l-2 border-l-cyan-400 shadow-inner'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <td className="p-3 align-top">
                    <span className="font-bold text-cyan-300 text-xs block leading-relaxed">
                      {row.algebraConcept}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    <span className="text-amber-200 text-[11px] leading-relaxed block">
                      {row.canvasElement}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    <div className="p-1.5 rounded bg-slate-900 border border-emerald-900/60 font-mono text-[11px] text-emerald-300 font-semibold break-words">
                      {row.symbolicMath}
                    </div>
                  </td>
                  <td className="p-3 align-top">
                    <p className="text-slate-300 text-[11px] leading-relaxed italic">
                      "{row.plainEnglish}"
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="grid grid-cols-1 gap-2.5 md:hidden">
        {rows.map((row) => {
          const isHighlighted = activeHighlightKey === row.highlightKey && Boolean(row.highlightKey);
          return (
            <div
              key={row.id}
              onClick={() => onHoverRow(isHighlighted ? undefined : row.highlightKey)}
              className={`p-3 rounded-lg border flex flex-col gap-2 transition cursor-pointer ${
                isHighlighted
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-lg'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Algebra Concept</span>
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Tap to highlight
                </span>
              </div>
              <h5 className="text-xs font-bold text-slate-100">{row.algebraConcept}</h5>

              <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                <span className="font-bold text-amber-400 block text-[10px] uppercase">Canvas Element:</span>
                {row.canvasElement}
              </div>

              <div className="text-[11px] text-emerald-300 bg-slate-900 p-2 rounded border border-emerald-900/50 font-mono">
                <span className="font-bold text-emerald-400 block text-[10px] uppercase">Formal Math:</span>
                {row.symbolicMath}
              </div>

              <div className="text-[11px] text-slate-300 bg-purple-950/20 p-2 rounded border border-purple-900/40 italic">
                <span className="font-bold text-purple-300 block text-[10px] uppercase not-italic">Intuition:</span>
                "{row.plainEnglish}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
