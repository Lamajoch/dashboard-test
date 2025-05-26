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
import { 
  applyConstraintsToLayout, 
  getOptimalSizeForChart,
  type BreakpointConstraints 
} from "../utils/gridcontainer";

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
    { i: "statcard4", x: 9, y: 0, w: 3, h: 4 },
    { i: "eventTrends", x: 0, y: 4, w: 7, h: 10 },
    { i: "completionPie", x: 7, y: 4, w: 5, h: 10 },
    { i: "revisitBar", x: 0, y: 15, w: 6, h: 10 },
    { i: "formClose", x: 6, y: 15, w: 6, h: 10 },
    { i: "map", x: 0, y: 25, w: 12, h: 20 },
    { i: "activity", x: 0, y: 45, w: 7, h: 10 },
    { i: "stepCompletion", x: 7, y: 45, w: 5, h: 10 }
];
  
const baseMd = [
    { i: "statcard1", x: 0, y: 0, w: 5, h: 4 },
    { i: "statcard2", x: 5, y: 0, w: 5, h: 4 },
    { i: "statcard3", x: 0, y: 4, w: 5, h: 4 },
    { i: "statcard4", x: 5, y: 4, w: 5, h: 4 },
    { i: "eventTrends", x: 0, y: 8, w: 10, h: 10 },
    { i: "completionPie", x: 0, y: 18, w: 10, h: 10 },
    { i: "revisitBar", x: 0, y: 28, w: 5, h: 10 },
    { i: "formClose", x: 5, y: 28, w: 5, h: 10 },   
    { i: "map", x: 0, y: 38, w: 10, h: 20 },
    { i: "activity", x: 0, y: 58, w: 5, h: 10 },
    { i: "stepCompletion", x: 5, y: 58, w: 5, h: 10 }
];

const baseSm = [
    { i: "statcard1", x: 0, y: 0, w: 1, h: 4 },
    { i: "statcard2", x: 0, y: 4, w: 1, h: 4 },
    { i: "statcard3", x: 0, y: 8, w: 1, h: 4 },
    { i: "statcard4", x: 0, y: 12, w: 1, h: 4 },
    { i: "eventTrends", x: 0, y: 16, w: 1, h: 10 },
    { i: "completionPie", x: 0, y: 26, w: 1, h: 10 },
    { i: "revisitBar", x: 0, y: 36, w: 1, h: 10 },
    { i: "formClose", x: 0, y: 46, w: 1, h: 10 },
    { i: "map", x: 0, y: 56, w: 1, h: 20 },
    { i: "activity", x: 0, y: 76, w: 1, h: 10 },
    { i: "stepCompletion", x: 0, y: 86, w: 1, h: 10 }
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
    const [chartColors, setChartColors] = useState<Record<string, Record<string, string>>>({});


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

        const widgetToConfigRatio = totals.weekly.current.configurators > 0 
            ? Math.round((totals.weekly.current.widgets / totals.weekly.current.configurators) * 10) / 10
            : 0;
        const prevWidgetToConfigRatio = totals.weekly.previous.configurators > 0 
            ? Math.round((totals.weekly.previous.widgets / totals.weekly.previous.configurators) * 10) / 10
            : 0;
        const ratioPercentChange = calculatePercentageChange(widgetToConfigRatio, prevWidgetToConfigRatio);

        const currentMonth = new Date().toLocaleString('nl-NL', { month: 'long' });
        const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('nl-NL', { month: 'long' });
        
        return {
            leadMonthlyTotal: totals.monthly.currentLeads,
            avgDailyLeads,
            widgetWeekTotal: totals.weekly.current.widgets,
            configuratorWeekTotal: totals.weekly.current.configurators,
            widgetToConfigRatio,
            leadPercentChange: percentChanges.monthlyLeads,
            widgetPercentChange: percentChanges.widgets,
            configuratorPercentChange: percentChanges.configurators,
            ratioPercentChange,
            currentMonth,
            previousMonth
        };
    }, []);

    useEffect(() => {
        try {
            const savedLayouts = localStorage.getItem(LOCAL_STORAGE_KEY);
            let loadedLayouts = defaultLayouts;
            
            if (savedLayouts) {
                try {
                    const parsedLayouts = JSON.parse(savedLayouts);
                    if (parsedLayouts && 
                        typeof parsedLayouts === 'object' && 
                        Array.isArray(parsedLayouts.lg)) {
                        loadedLayouts = parsedLayouts;
                    }
                } catch (parseError) {
                    console.error("Error parsing layouts from localStorage:");
                }
            }
            
            const savedCharts = localStorage.getItem(CHARTS_STORAGE_KEY);
            let loadedCharts: ChartItem[] = [];
            
            if (savedCharts) {
                try {
                    const parsedCharts = JSON.parse(savedCharts);
                    if (Array.isArray(parsedCharts)) {
                        loadedCharts = parsedCharts.filter(chart => 
                            chart && 
                            typeof chart === 'object' && 
                            chart.i && 
                            typeof chart.i === 'string' &&
                            chart.chartType
                        );
                    }
                } catch (parseError) {
                    console.error("Error parsing charts from localStorage:");
                }
            }
            
            const constrainedLayouts = {
                lg: applyConstraintsToLayout(loadedLayouts.lg || [], 'lg', loadedCharts),
                md: applyConstraintsToLayout(loadedLayouts.md || [], 'md', loadedCharts),
                sm: applyConstraintsToLayout(loadedLayouts.sm || [], 'sm', loadedCharts)
            };
            
            setLayouts(constrainedLayouts);
            setCustomCharts(loadedCharts);

            if (loadedCharts.length > 0) {
                const chartIds = loadedCharts
                    .map(chart => chart.i)
                    .filter(id => id.startsWith('custom-'))
                    .map(id => {
                        const idNumber = parseInt(id.replace('custom-', ''), 10);
                        return isNaN(idNumber) ? 0 : idNumber;
                    });
                    
                const maxId = chartIds.length > 0 ? Math.max(...chartIds) : 0;
                setNextChartId(maxId + 1);
            }

        } catch (error) {
            console.error("Error loading dashboard data from localStorage:");
            setLayouts(defaultLayouts);
            setCustomCharts([]);
            setNextChartId(1);
            setChartColors({});
        }
    }, []);
    
    const saveLayouts = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layouts));
            localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(customCharts));
            setIsEditMode(false); 
            setOriginalLayouts(null);
            setOriginalCharts(null);
        } catch (error) {
            console.error("Error saving layouts to localStorage:");
        }
    };

    const onLayoutChange = (_currentLayout: any, allLayouts: any) => {
        if (isEditMode) {
            const constrainedLayouts = {
                lg: applyConstraintsToLayout(allLayouts.lg || [], 'lg', customCharts),
                md: applyConstraintsToLayout(allLayouts.md || [], 'md', customCharts),
                sm: applyConstraintsToLayout(allLayouts.sm || [], 'sm', customCharts)
            };
            setLayouts(constrainedLayouts);
        }
    };

    const toggleEditMode = () => {
        if (!isEditMode) {
            setOriginalLayouts(JSON.parse(JSON.stringify(layouts)));
            setOriginalCharts(JSON.parse(JSON.stringify(customCharts)));
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
        }
    };

    const undoChanges = () => {
        if (originalLayouts) {
            setLayouts(originalLayouts);
        }
        
        if (originalCharts) {
            setCustomCharts(originalCharts);
        }
        
        setIsEditMode(false);
        setOriginalLayouts(null);
        setOriginalCharts(null);
    };

    const resetToDefault = () => {
        const resetLayouts = {
            lg: applyConstraintsToLayout(baseLg, 'lg'),
            md: applyConstraintsToLayout(baseMd, 'md'),
            sm: applyConstraintsToLayout(baseSm, 'sm')
        };
        
        setLayouts(resetLayouts);
        setCustomCharts([]);
        setChartColors({});
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(CHARTS_STORAGE_KEY);
        setIsEditMode(false);
        setNextChartId(1);
        setOriginalLayouts(null);
        setOriginalCharts(null);
    };
    
    const findFreeGridPosition = (width: number, height: number) => {
        if (!layouts.lg || layouts.lg.length === 0) {
            return { x: 0, y: 0 };
        }

        const maxCols = 12;

        const occupiedPositions: boolean[][] = [];

        const maxY = Math.max(...layouts.lg.map(item => item.y + item.h)) + height;
        for (let y = 0; y < maxY + height; y++) {
            occupiedPositions[y] = [];
            for (let x = 0; x < maxCols; x++) {
                occupiedPositions[y][x] = false;
            }
        }
        
        layouts.lg.forEach(item => {
            for (let y = item.y; y < item.y + item.h; y++) {
                for (let x = item.x; x < item.x + item.w; x++) {
                    if (y < occupiedPositions.length && x < maxCols) {
                        occupiedPositions[y][x] = true;
                    }
                }
            }
        });
        
        for (let y = 0; y < occupiedPositions.length; y++) {
            for (let x = 0; x <= maxCols - width; x++) {
                let isFree = true;

                for (let checkY = y; checkY < y + height && isFree; checkY++) {
                    for (let checkX = x; checkX < x + width && isFree; checkX++) {
                        if (checkY >= occupiedPositions.length || 
                            checkX >= maxCols || 
                            occupiedPositions[checkY][checkX]) {
                            isFree = false;
                        }
                    }
                }
                
                if (isFree) {
                    return { x, y };
                }
            }
        }

        return { 
            x: 0, 
            y: Math.max(...layouts.lg.map(item => item.y + item.h)) + 1 
        };
    };

    const handleAddChart = (chartType: ChartOption) => {
        if (!originalLayouts) {
            setOriginalLayouts(JSON.parse(JSON.stringify(layouts)));
        }
        if (!originalCharts) {
            setOriginalCharts(JSON.parse(JSON.stringify(customCharts)));
        }

        const newChartId = `custom-${nextChartId}`;
        setNextChartId(prevId => prevId + 1);
        const lgSize = getOptimalSizeForChart(chartType.id, 'lg');
        const mdSize = getOptimalSizeForChart(chartType.id, 'md');
        const smSize = getOptimalSizeForChart(chartType.id, 'sm');

        const { x, y } = findFreeGridPosition(lgSize.w, lgSize.h);
        
        const newChart: ChartItem = {
            i: newChartId,
            chartType: chartType.id,
            x: x,
            y: y,
            w: lgSize.w,
            h: lgSize.h
        };

        const newLayoutItems = {
            lg: applyConstraintsToLayout([{ i: newChartId, x, y, w: lgSize.w, h: lgSize.h }], 'lg', [newChart])[0],
            md: applyConstraintsToLayout([{ i: newChartId, x: 0, y, w: mdSize.w, h: mdSize.h }], 'md', [newChart])[0],
            sm: applyConstraintsToLayout([{ i: newChartId, x: 0, y, w: smSize.w, h: smSize.h }], 'sm', [newChart])[0]
        };

        const updatedLayouts = {
            lg: [...(layouts.lg || []), newLayoutItems.lg],
            md: [...(layouts.md || []), newLayoutItems.md],
            sm: [...(layouts.sm || []), newLayoutItems.sm]
        };

        setLayouts(updatedLayouts);
        setCustomCharts(prev => [...prev, newChart]);
        setIsEditMode(true);
    };

    const handleRemoveChart = (chartId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!originalLayouts) {
            setOriginalLayouts(JSON.parse(JSON.stringify(layouts)));
        }
        if (!originalCharts) {
            setOriginalCharts(JSON.parse(JSON.stringify(customCharts)));
        }
        
        if (!chartId.startsWith('custom-')) return;
        
        const updatedLayouts = {
            lg: (layouts.lg || []).filter(item => item.i !== chartId),
            md: (layouts.md || []).filter(item => item.i !== chartId),
            sm: (layouts.sm || []).filter(item => item.i !== chartId)
        };
        
        const updatedCustomCharts = customCharts.filter(chart => chart.i !== chartId);
        
        setLayouts(updatedLayouts);
        setCustomCharts(updatedCustomCharts);
    };

    const TrendIndicator = ({ value, compareText = "vs vorige week" }: { value: number; compareText?: string }) => (
        <div className={`text-xs ${value >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-medium mt-1 flex items-center`}>
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
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
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
            className="layout"
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
                    <TrendIndicator value={dashboardData.configuratorPercentChange} />
                  <div className="text-xs text-slate-500 font-medium mt-1 flex items-center">
                  </div>
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
                  title={`Reuzenpanda ${chart.chartType} grafiek`} 
                  colors={chartColors[chart.i] || {}}
                />
              </div>
            ))}
          </ResponsiveReactGridLayout>
          <style jsx>{`
            .react-grid-item {
              transition: all 200ms ease;
              transition-property: left, top;
            }
          `}</style>
        </div>
      </div>
    );
}
export default Dashboard;