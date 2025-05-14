"use client";

import React, { useState } from 'react';
import { ChartOption } from '@/app/types/chart-types';

interface DashboardSidebarProps {
  onAddChart: (chartType: ChartOption) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onAddChart }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const chartOptions: ChartOption[] = [
    { id: 'line', name: 'Lijndiagram', icon: 'chart-line' },
    { id: 'bar', name: 'Staafdiagram', icon: 'chart-bar' },
    { id: 'pie', name: 'Piechart', icon: 'chart-pie' },
    { id: 'area', name: 'Vlakdiagram', icon: 'chart-area' },
    { id: 'column', name: 'Kolomdiagram', icon: 'chart-column' },
  ];

  return (
    <div className="h-full w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200 bg- flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Grafieken</h2>
        <button 
          onClick={() => setIsPopupOpen(true)}
          className="w-9 h-9 bg-[#A7d194] text-black rounded-lg hover:bg-[#90c579]  transition-colors flex items-center justify-center"
          aria-label="Grafiek toevoegen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <input type="text" placeholder="Zoek grafiek" className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7d194] focus:ring-opacity-50 transition-all" />
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Grafiek toevoegen</h3>
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {chartOptions.map((chart) => (
                <button
                  key={chart.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-[#A7d194] hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring[#90c579] focus:ring-opacity-50 transition-all"
                  onClick={() => {
                    onAddChart(chart);
                    setIsPopupOpen(false);
                  }}
                >
                  <div className="flex flex-col items-center">
                    <ChartIcon type={chart.icon} className="h-8 w-8 text-[#A7d194] mb-2" />
                    <span className="text-sm text-slate-700">{chart.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const ChartIcon: React.FC<{ type: string; className?: string }> = ({ type, className = '' }) => {
  switch (type) {
    case 'chart-line':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    case 'chart-bar':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'chart-pie':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      );
    case 'chart-area':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    case 'chart-column':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    default:
      return null;
  }
};

export default DashboardSidebar; 