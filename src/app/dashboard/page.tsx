"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DashboardSidebar from "../_context/components/Sidebar";
import ChartFactory from "../_context/components/ChartFactory";
import { ChartOption, ChartItem } from "../types/chart-types";
import productionLeadData from "../data/production-widget-service.lead-configurations.json";
import widgetConfiguratorData from "../data/widgetvsconfigurator.json";
import { applyConstraintsToLayout, getOptimalSizeForChart} from "../utils/gridcontainer";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
  
const LOCAL_STORAGE_KEY = "dashboard_layouts";
const CHARTS_STORAGE_KEY = "dashboard_charts";

const getWeekData = (data: Array<{ _id: string; count: number }>, weekIndex: number) => 
  data.slice(weekIndex * 7, (weekIndex * 7) + 7);

const getMonthData = (data: Array<{ _id: string; count: number }>, monthOffset: number = 0) => {

  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - monthOffset);
  const targetYear = currentDate.getFullYear();
  const targetMonth = currentDate.getMonth() + 1;

  const targetMonthStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
  
  return data.filter(item => item._id.startsWith(targetMonthStr));
};

const calculateTotal = (data: Array<{ _id: string; count: number }>) => 
  data.reduce((sum: number, { count }) => sum + count, 0);

const calculatePercentageChange = (current: number, previous: number) => 
  previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);

const baseLg = [
    { i: "statcard1", x: 0, y: 0, w: 3, h: 4 },
    { i: "statcard2", x: 3, y: 0, w: 3, h: 4 },
    { i: "statcard3", x: 6, y: 0, w: 3, h: 4 },
    { i: "statcard4", x: 9, y: 0, w: 3, h: 4 }
];
  
const baseMd = [
    { i: "statcard1", x: 0, y: 0, w: 5, h: 4 },
    { i: "statcard2", x: 5, y: 0, w: 5, h: 4 },
    { i: "statcard3", x: 0, y: 4, w: 5, h: 4 },
    { i: "statcard4", x: 5, y: 4, w: 5, h: 4 }
];

const baseSm = [
    { i: "statcard1", x: 0, y: 0, w: 1, h: 4 },
    { i: "statcard2", x: 0, y: 4, w: 1, h: 4 },
    { i: "statcard3", x: 0, y: 8, w: 1, h: 4 },
    { i: "statcard4", x: 0, y: 12, w: 1, h: 4 }
];

const defaultLayouts = {
    lg: applyConstraintsToLayout(baseLg, 'lg'),
    md: applyConstraintsToLayout(baseMd, 'md'),
    sm: applyConstraintsToLayout(baseSm, 'sm')
};

const Dashboard = () => {

    const [layouts, setLayouts] = useState(defaultLayouts);
    const [isEditMode, setIsEditMode] = useState(false);
    const [customCharts, setCustomCharts] = useState<ChartItem[]>([]);
    const [nextChartId, setNextChartId] = useState(1);
    const [originalLayouts, setOriginalLayouts] = useState<typeof defaultLayouts | null>(null);
    const [originalCharts, setOriginalCharts] = useState<ChartItem[] | null>(null);

    const dashboardData = useMemo(() => {
        const CURRENT_WEEK = 6;
        const PREVIOUS_WEEK = 7;

        const { widgetSeries, configuratorSeries } = widgetConfiguratorData[0];
        
        const monthlyLeads = {
            current: getMonthData(productionLeadData, 0),
            previous: getMonthData(productionLeadData, 1)
        };

        const weeks = {
            current: {
                widgets: getWeekData(widgetSeries, CURRENT_WEEK),
                configurators: getWeekData(configuratorSeries, CURRENT_WEEK)
            },
            previous: {
                widgets: getWeekData(widgetSeries, PREVIOUS_WEEK),
                configurators: getWeekData(configuratorSeries, PREVIOUS_WEEK)
            }
        };

        const totals = {
            monthly: {
                currentLeads: calculateTotal(monthlyLeads.current),
                previousLeads: calculateTotal(monthlyLeads.previous)
            },
            weekly: {
                current: {
                    widgets: calculateTotal(weeks.current.widgets),
                    configurators: calculateTotal(weeks.current.configurators)
                },
                previous: {
                    widgets: calculateTotal(weeks.previous.widgets),
                    configurators: calculateTotal(weeks.previous.configurators)
                }
            }
        };

        const avgDailyLeads = monthlyLeads.current.length > 0 
            ? Math.round(totals.monthly.currentLeads / monthlyLeads.current.length) 
            : 0;
        
        const percentChanges = {
            monthlyLeads: calculatePercentageChange(totals.monthly.currentLeads, totals.monthly.previousLeads),
            widgets: calculatePercentageChange(totals.weekly.current.widgets, totals.weekly.previous.widgets),
            configurators: calculatePercentageChange(totals.weekly.current.configurators, totals.weekly.previous.configurators)
        };

        const currentMonth = new Date().toLocaleString('nl-NL', { month: 'long' });
        const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('nl-NL', { month: 'long' });
        
        return {
            leadMonthlyTotal: totals.monthly.currentLeads,
            avgDailyLeads,
            widgetWeekTotal: totals.weekly.current.widgets,
            configuratorWeekTotal: totals.weekly.current.configurators,
            leadPercentChange: percentChanges.monthlyLeads,
            widgetPercentChange: percentChanges.widgets,
            configuratorPercentChange: percentChanges.configurators,
            currentMonth,
            previousMonth
        };
    }, []);

    const parseStorageData = <T,>(key: string, defaultValue: T, validator?: (data: any) => boolean): T => {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return defaultValue;
            
            const parsed = JSON.parse(stored);
            if (validator && !validator(parsed)) return defaultValue;
            
            return parsed;
        } catch {
            return defaultValue;
        }
    };

    const validateLayouts = (data: any): boolean => 
        data && typeof data === 'object' && Array.isArray(data.lg);

    const validateCharts = (data: any): boolean => 
        Array.isArray(data) && data.every(chart => 
            chart && typeof chart === 'object' && 
            typeof chart.i === 'string' && 
            chart.chartType
        );

    const applyConstraintsToAllBreakpoints = (layouts: any, charts: ChartItem[]) => ({
        lg: applyConstraintsToLayout(layouts.lg || [], 'lg', charts),
        md: applyConstraintsToLayout(layouts.md || [], 'md', charts),
        sm: applyConstraintsToLayout(layouts.sm || [], 'sm', charts)
    });

    const calculateNextChartId = (charts: ChartItem[]): number => {
        const chartIds = charts
            .map(chart => parseInt(chart.i.replace('custom-', ''), 10))
            .filter(id => !isNaN(id));
        return chartIds.length > 0 ? Math.max(...chartIds) + 1 : 1;
    };

    const saveToStorage = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layouts));
            localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(customCharts));
        } catch (error) {
            console.error("Error saving to storage:", error);
        }
    };

    const clearStorage = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(CHARTS_STORAGE_KEY);
    };

    useEffect(() => {
        const loadedLayouts = parseStorageData(LOCAL_STORAGE_KEY, defaultLayouts, validateLayouts);
        const loadedCharts = parseStorageData(CHARTS_STORAGE_KEY, [], validateCharts);

        const constrainedLayouts = applyConstraintsToAllBreakpoints(loadedLayouts, loadedCharts);
        
        setLayouts(constrainedLayouts);
        setCustomCharts(loadedCharts);
        setNextChartId(calculateNextChartId(loadedCharts));
    }, []);

    const saveLayouts = () => {
        saveToStorage();
        setIsEditMode(false);
        setOriginalLayouts(null);
        setOriginalCharts(null);
    };

    const onLayoutChange = (_currentLayout: any, allLayouts: any) => {
        if (isEditMode) {
            const constrainedLayouts = applyConstraintsToAllBreakpoints(allLayouts, customCharts);
            setLayouts(constrainedLayouts);
        }
    };

    const toggleEditMode = () => {
        if (!isEditMode) {
            setOriginalLayouts(structuredClone(layouts));
            setOriginalCharts(structuredClone(customCharts));
        }
        setIsEditMode(!isEditMode);
    };

    const undoChanges = () => {
        if (originalLayouts) setLayouts(originalLayouts);
        if (originalCharts) setCustomCharts(originalCharts);
        
        setIsEditMode(false);
        setOriginalLayouts(null);
        setOriginalCharts(null);
    };

    const resetToDefault = () => {
        const resetLayouts = applyConstraintsToAllBreakpoints({
            lg: baseLg,
            md: baseMd,
            sm: baseSm
        }, []);
        
        setLayouts(resetLayouts);
        setCustomCharts([]);
        setNextChartId(1);
        setIsEditMode(false);
        setOriginalLayouts(null);
        setOriginalCharts(null);
        clearStorage();
    };

    const findFreeGridPosition = (width: number, height: number) => {
        const maxCols = 12;
        const currentItems = layouts.lg || [];
        
        if (currentItems.length === 0) return { x: 0, y: 0 };

        const maxY = Math.max(...currentItems.map(item => item.y + item.h)) + height;
        const grid = Array(maxY).fill(null).map(() => Array(maxCols).fill(false));
        
        currentItems.forEach(item => {
            for (let y = item.y; y < item.y + item.h; y++) {
                for (let x = item.x; x < item.x + item.w; x++) {
                    if (y < grid.length && x < maxCols) {
                        grid[y][x] = true;
                    }
                }
            }
        });
        
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x <= maxCols - width; x++) {
                let canPlace = true;
                
                for (let checkY = y; checkY < y + height && canPlace; checkY++) {
                    for (let checkX = x; checkX < x + width && canPlace; checkX++) {
                        if (checkY >= grid.length || grid[checkY][checkX]) {
                            canPlace = false;
                        }
                    }
                }
                
                if (canPlace) return { x, y };
            }
        }

        return { x: 0, y: Math.max(...currentItems.map(item => item.y + item.h)) + 1 };
    };

    const handleAddChart = (chartType: ChartOption) => {
        if (!originalLayouts) setOriginalLayouts(structuredClone(layouts));
        if (!originalCharts) setOriginalCharts(structuredClone(customCharts));

        const newChartId = `custom-${nextChartId}`;
        const sizes = {
            lg: getOptimalSizeForChart(chartType.id, 'lg'),
            md: getOptimalSizeForChart(chartType.id, 'md'),
            sm: getOptimalSizeForChart(chartType.id, 'sm')
        };

        const { x, y } = findFreeGridPosition(sizes.lg.w, sizes.lg.h);
        
        const newChart: ChartItem = {
            i: newChartId,
            chartType: chartType.id,
            x,
            y,
            w: sizes.lg.w,
            h: sizes.lg.h
        };

        const newLayoutItems = {
            lg: { i: newChartId, x, y, w: sizes.lg.w, h: sizes.lg.h },
            md: { i: newChartId, x: 0, y, w: sizes.md.w, h: sizes.md.h },
            sm: { i: newChartId, x: 0, y, w: sizes.sm.w, h: sizes.sm.h }
        };

        const updatedLayouts = {
            lg: [...(layouts.lg || []), newLayoutItems.lg],
            md: [...(layouts.md || []), newLayoutItems.md],
            sm: [...(layouts.sm || []), newLayoutItems.sm]
        };

        setLayouts(updatedLayouts);
        setCustomCharts(prev => [...prev, newChart]);
        setNextChartId(prev => prev + 1);
        setIsEditMode(true);
    };

    const handleRemoveChart = (chartId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!chartId.startsWith('custom-')) return;
        
        if (!originalLayouts) setOriginalLayouts(structuredClone(layouts));
        if (!originalCharts) setOriginalCharts(structuredClone(customCharts));
        
        const updatedLayouts = {
            lg: (layouts.lg || []).filter(item => item.i !== chartId),
            md: (layouts.md || []).filter(item => item.i !== chartId),
            sm: (layouts.sm || []).filter(item => item.i !== chartId)
        };
        
        setLayouts(updatedLayouts);
        setCustomCharts(prev => prev.filter(chart => chart.i !== chartId));
    };

    const TrendIndicator = ({ value, compareText = "vs vorige week" }: { value: number; compareText?: string }) => (
        <div className={`text-xs ${value >= 0 ? 'text-green-600' : 'text-red-600'} font-medium mt-1 flex items-center`}>
            {value >= 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414l4.293 4.293V12a1 1 0 00-1-1h-2.5z" />
                </svg>
            )}
            <p className="text-sm">{value >= 0 ? '+' : ''}{value}% {compareText}</p>
        </div>
    );

    return (
      <div className="flex h-screen overflow-hidden relative">
        <DashboardSidebar onAddChart={handleAddChart} />
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="flex justify-end items-center mb-3">
            <div className="flex space-x-3">
              {isEditMode ? (
                <>
                  <button 
                    onClick={saveLayouts} 
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                  >
                    <span>Opslaan</span>
                  </button>
                  <button 
                    onClick={undoChanges} 
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-1"
                  >
                    <span>Annuleren</span>
                  </button>
                  <button 
                    onClick={resetToDefault} 
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center space-x-1"
                  >
                    <span>Reset</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={toggleEditMode} 
                  className="px-4 py-2 bg-[#A7d194] text-black rounded-lg hover:bg-[#90c579] transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 " viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>Bewerken</span>
                </button>
              )}
            </div>
          </div>
          
          <ResponsiveReactGridLayout
            className={`layout ${isEditMode ? 'edit-mode' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 1 }}
            rowHeight={30}
            onLayoutChange={onLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            margin={[16, 16]}
            draggableCancel=".react-grid-item-deletion-button, .chart-settings-button"
          >
            <div key="statcard1" className="bg-white rounded-xl p-4 border border-slate-100 transition-all ">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Leads</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{dashboardData.leadMonthlyTotal}</div>
                  <TrendIndicator value={dashboardData.leadPercentChange} compareText={`vs ${dashboardData.previousMonth}`} />
                </div>
              </div>
            </div>
            
            <div key="statcard2" className="bg-white rounded-xl p-4 border border-slate-100 transition-all ">
              <div className="flex items-center justify-between ">
                <div>
                  <div className="text-sm font-medium text-slate-500">Widget</div> 
                  <div className="text-2xl font-bold text-slate-800 mt-1">{dashboardData.widgetWeekTotal}</div>
                  <TrendIndicator value={dashboardData.widgetPercentChange} />
                </div>
              </div>
            </div>
            
            <div key="statcard3" className="bg-white rounded-xl p-4 border border-slate-100 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Configurator</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{dashboardData.configuratorWeekTotal}</div>
                  <TrendIndicator value={dashboardData.configuratorPercentChange} />
                </div>
              </div>
            </div>
            
            <div key="statcard4" className="bg-white rounded-xl p-4 border border-slate-100 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Leads per Dag</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">{dashboardData.avgDailyLeads}</div>
                </div>
              </div>
            </div>
            
            {customCharts.map(chart => (
              <div 
                key={chart.i} 
                className="bg-white rounded-xl p-4 border border-slate-100 overflow-hidden transition-all relative"
              >
                {isEditMode && (
                  <button 
                    onClick={(e) => handleRemoveChart(chart.i, e)} 
                    className="absolute top-2 right-2 z-50 w-7 h-7 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center hover:bg-rose-200 transition-colors react-grid-item-deletion-button"
                    aria-label="Verwijder grafiek"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <ChartFactory 
                  chartType={chart.chartType} 
                />
              </div>
            ))}
          </ResponsiveReactGridLayout>
          <style jsx>{`
            .react-grid-item {
              transition: all 200ms ease;
              transition-property: left, top;
            }
        
            .edit-mode .react-grid-item {
              user-select: none;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
            }
          `}</style>
        </div>
      </div>
    );
}

export default Dashboard;