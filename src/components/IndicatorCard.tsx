import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { EconomicIndicator } from '../types';

interface IndicatorCardProps {
  indicator: EconomicIndicator;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator }) => {
  const isPositive = indicator.change >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{indicator.country}</p>
          <h3 className="text-lg font-semibold text-gray-900">{indicator.name}</h3>
        </div>
        {isPositive ? (
          <ArrowUpRight className="w-6 h-6 text-green-500" />
        ) : (
          <ArrowDownRight className="w-6 h-6 text-red-500" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{indicator.value}%</p>
        <div className="flex items-center mt-2">
          <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{indicator.change}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs previous</span>
        </div>
      </div>
    </div>
  );
};