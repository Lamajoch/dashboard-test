"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChartOption } from '@/app/types/chart-types';

interface DashboardSidebarProps {
  onAddChart: (chartType: ChartOption) => void;
}

const SIDEBAR_WIDTH_EXPANDED = 320;
const SIDEBAR_WIDTH_COLLAPSED = 64; 
const MOBILE_BREAKPOINT = 768;

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onAddChart }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    
    if (mobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true); 
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  const chartOptions: ChartOption[] = [
    { id: 'line', name: 'Lijndiagram', icon: 'chart-line' },
    { id: 'bar', name: 'Staafdiagram', icon: 'chart-bar' },
    { id: 'pie', name: 'Piechart', icon: 'chart-pie' },
    { id: 'stacked', name: 'Gestapeld Lijndiagram', icon: 'chart-stacked' },
  ];

  const handleAddChart = useCallback((chart: ChartOption) => {
    onAddChart(chart);
    setIsPopupOpen(false);
  }, [onAddChart]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const openPopup = useCallback(() => {
    setIsPopupOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const sidebarClasses = `
    h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-50 overflow-hidden
    ${isMobile ? 'fixed left-0 top-0' : 'relative'}
    ${isMobile 
      ? (isSidebarOpen ? `w-80 translate-x-0` : 'w-0 -translate-x-full') 
      : (isSidebarOpen ? 'w-80' : 'w-16')
    }
  `.trim();

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={closeSidebar}
        />
      )}

      {isMobile && !isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-[#A7d194] text-black rounded-lg hover:bg-[#90c579] transition-all shadow-lg flex items-center justify-center"
          aria-label="Sidebar openen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className={sidebarClasses}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center min-h-[73px]">
          <h2 className={`text-lg font-semibold text-slate-800 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          } ${!isMobile && !isSidebarOpen ? 'sr-only' : ''}`}>
            Grafieken
          </h2>
          <div className={`flex transition-all duration-300 ${
            isSidebarOpen ? 'space-x-2' : 'flex-col space-y-2'
          } ${!isMobile && !isSidebarOpen ? 'w-full justify-center' : ''}`}>
            <button 
              onClick={openPopup}
              className="w-9 h-9 bg-[#A7d194] text-black rounded-lg hover:bg-[#90c579] transition-colors flex items-center justify-center flex-shrink-0"
              aria-label="Grafiek toevoegen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={isMobile ? closeSidebar : toggleSidebar}
              className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center flex-shrink-0"
              aria-label={isMobile ? "Sidebar sluiten" : (isSidebarOpen ? "Sidebar inklappen" : "Sidebar uitklappen")}
            >
              {isMobile || isSidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {isSidebarOpen && (
          <div className="p-4">
            <input 
              type="text" 
              placeholder="Zoek grafiek" 
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A7d194] focus:ring-opacity-50 transition-all" 
            />
          </div>
        )}

        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
            <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Grafiek toevoegen</h3>
                <button 
                  onClick={closePopup}
                  className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
                  aria-label="Popup sluiten"
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
                    className="p-4 border border-slate-200 rounded-lg hover:border-[#A7d194] hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-[#90c579] focus:ring-opacity-50 transition-all group"
                    onClick={() => handleAddChart(chart)}
                  >
                    <div className="flex flex-col items-center">
                      <ChartIcon type={chart.icon} className="h-8 w-8 text-[#A7d194] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-slate-700 font-medium">{chart.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const ChartIcon: React.FC<{ type: string; className?: string }> = ({ type, className = '' }) => {
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2
  };

  switch (type) {
    case 'chart-line':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    case 'chart-bar':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 1 0 01-2-2z" />
        </svg>
      );
    case 'chart-pie':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      );
    case 'chart-stacked':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8l3-3 3 3 4-4" opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
};

export default DashboardSidebar; 