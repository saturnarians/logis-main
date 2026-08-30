'use client';

import React, { useState } from 'react';
import { useLogistics } from '@/context/LogisticsContext';
import { RateTariff } from '@/types/logistics';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  Edit2,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const RatesTariffsView: React.FC = () => {
  const { tariffs, updateTariff } = useLogistics();

  // Interactive Live Rate Estimator
  const [calcWeightKg, setCalcWeightKg] = useState(12.5);
  const [selectedTariffId, setSelectedTariffId] = useState<string>(tariffs[0]?.id || '');
  const [isExpress, setIsExpress] = useState(false);
  const [isOvernight, setIsOvernight] = useState(false);

  const selectedTariff = tariffs.find(t => t.id === selectedTariffId) || tariffs[0];
  
  // Calculate dynamic quote
  const baseCost = selectedTariff?.basePriceUsd || 25;
  const weightCost = calcWeightKg * (selectedTariff?.pricePerKgUsd || 3.5);
  let multiplier = 1.0;
  if (isExpress) multiplier *= (selectedTariff?.expressMultiplier || 1.4);
  if (isOvernight) multiplier *= (selectedTariff?.overnightMultiplier || 1.8);

  const subtotal = (baseCost + weightCost + (selectedTariff?.handlingFeeUsd || 5)) * multiplier;
  const fuelSurcharge = subtotal * ((selectedTariff?.fuelSurchargePct || 14.5) / 100);
  const totalQuoteUsd = (subtotal + fuelSurcharge).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#D40511] text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              FREIGHT COMMERCIALS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Rates, Tariffs & Dynamic Surcharge Matrix
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure baseline per-kg zone pricing brackets, jet fuel indexed surcharges, and express multipliers.
          </p>
        </div>

        <div className="bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
          <Percent className="w-4 h-4 text-amber-600" />
          <span>Fuel Index Adjusted Weekly (Avg 14.5%)</span>
        </div>
      </div>

      {/* Interactive Tariff Estimator Widget */}
      <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-white rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[#FFCC00]" />
            <h2 className="text-base font-extrabold">Instant Dynamic Freight Quote Simulator</h2>
          </div>
          <span className="text-xs bg-[#D40511] text-[#FFCC00] font-black px-2.5 py-0.5 rounded-full font-mono">
            LIVE MATRIX
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-gray-400 font-bold mb-1">Zone Route Tariff Card</label>
            <select
              value={selectedTariffId}
              onChange={(e) => setSelectedTariffId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              {tariffs.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.zoneFrom} → {t.zoneTo})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Gross Cargo Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={calcWeightKg}
              onChange={(e) => setCalcWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 pt-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isExpress}
                onChange={(e) => setIsExpress(e.target.checked)}
                className="rounded text-[#D40511] focus:ring-0"
              />
              <span className="text-gray-300 font-medium">Express Priority (x{selectedTariff?.expressMultiplier || 1.4})</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOvernight}
                onChange={(e) => setIsOvernight(e.target.checked)}
                className="rounded text-[#D40511] focus:ring-0"
              />
              <span className="text-gray-300 font-medium">Overnight Red-Eye (x{selectedTariff?.overnightMultiplier || 1.8})</span>
            </label>
          </div>

          <div className="text-right flex flex-col justify-end">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Quoted Freight</span>
            <div className="text-2xl sm:text-3xl font-black text-[#FFCC00] font-mono">
              ${totalQuoteUsd} <span className="text-xs font-normal text-gray-400">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tariffs Master Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-sm text-gray-900">Configured Tariff Rate Cards</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tariff Plan</th>
                <th className="py-3 px-4">Origin / Dest</th>
                <th className="py-3 px-4">Base Callout</th>
                <th className="py-3 px-4">Price / kg</th>
                <th className="py-3 px-4">Express Mult</th>
                <th className="py-3 px-4">Fuel Surcharge</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {tariffs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#D40511]"></span>
                    <span>{t.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {t.zoneFrom} → {t.zoneTo}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">${t.basePriceUsd.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono">${t.pricePerKgUsd.toFixed(2)} / kg</td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-bold">{t.expressMultiplier}x</td>
                  <td className="py-3 px-4 font-mono text-amber-600 font-bold">{t.fuelSurchargePct}%</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        const newBase = prompt('Enter new Base Price USD:', t.basePriceUsd.toString());
                        if (newBase && !isNaN(Number(newBase))) {
                          updateTariff(t.id, { basePriceUsd: Number(newBase) });
                        }
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-[11px]"
                    >
                      Edit Base
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
