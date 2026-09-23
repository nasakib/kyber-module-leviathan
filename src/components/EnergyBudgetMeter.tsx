import React from 'react';
import { EnergyBudget } from '../types/game';
import { BatteryCharging, AlertTriangle, ShieldCheck } from 'lucide-react';

interface EnergyBudgetMeterProps {
  budget?: EnergyBudget;
  params: Record<string, number>;
}

export const checkEnergyBudget = (
  budget: EnergyBudget | undefined,
  params: Record<string, number>
): { met: boolean; l1Norm: number; trace?: number; det?: number } => {
  if (!budget) return { met: true, l1Norm: 0 };

  const values = Object.values(params);
  const l1Norm = values.reduce((sum, v) => sum + Math.abs(v), 0);

  let met = true;

  if (budget.maxL1Norm !== undefined && l1Norm > budget.maxL1Norm + 0.05) {
    met = false;
  }

  let trace: number | undefined;
  if (budget.exactTrace !== undefined) {
    const a = params.a ?? 1;
    const d = params.d ?? 1;
    trace = a + d;
    if (Math.abs(trace - budget.exactTrace) > 0.08) {
      met = false;
    }
  }

  let det: number | undefined;
  if (budget.requireUnitDeterminant) {
    const a = params.a ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);
    const b = params.b ?? (params.theta_deg !== undefined ? -Math.sin((params.theta_deg * Math.PI) / 180) : 0);
    const c = params.c ?? (params.theta_deg !== undefined ? Math.sin((params.theta_deg * Math.PI) / 180) : 0);
    const d = params.d ?? (params.theta_deg !== undefined ? Math.cos((params.theta_deg * Math.PI) / 180) : 1);
    det = a * d - b * c;
    if (Math.abs(Math.abs(det) - 1.0) > 0.08) {
      met = false;
    }
  }

  return { met, l1Norm, trace, det };
};

export const EnergyBudgetMeter: React.FC<EnergyBudgetMeterProps> = ({ budget, params }) => {
  if (!budget) return null;

  const { met, l1Norm, trace, det } = checkEnergyBudget(budget, params);

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono">
      <div className="flex items-center space-x-1.5 text-slate-300">
        <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-slate-400">Energy Constraints:</span>
      </div>

      {budget.maxL1Norm !== undefined && (
        <div
          className={`px-2 py-0.5 rounded border text-[11px] flex items-center space-x-1 ${
            l1Norm <= budget.maxL1Norm + 0.05
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <span>||p||₁:</span>
          <span className="font-bold">{l1Norm.toFixed(2)} / {budget.maxL1Norm.toFixed(2)}</span>
        </div>
      )}

      {budget.exactTrace !== undefined && trace !== undefined && (
        <div
          className={`px-2 py-0.5 rounded border text-[11px] flex items-center space-x-1 ${
            Math.abs(trace - budget.exactTrace) <= 0.08
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <span>tr(M):</span>
          <span className="font-bold">{trace.toFixed(2)} (Req: {budget.exactTrace})</span>
        </div>
      )}

      {budget.requireUnitDeterminant && det !== undefined && (
        <div
          className={`px-2 py-0.5 rounded border text-[11px] flex items-center space-x-1 ${
            Math.abs(Math.abs(det) - 1.0) <= 0.08
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <span>|det|:</span>
          <span className="font-bold">{Math.abs(det).toFixed(2)} (Req: 1.00)</span>
        </div>
      )}

      <div className="flex items-center space-x-1 ml-auto">
        {met ? (
          <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 text-[10px] font-semibold flex items-center space-x-1 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            <span>Silver Mastery Valid</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 text-[10px] font-semibold flex items-center space-x-1 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Budget Exceeded</span>
          </span>
        )}
      </div>
    </div>
  );
};
