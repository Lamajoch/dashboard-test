"use client";

import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import Highcharts from "highcharts";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ResponsiveHighChart from "../_context/components/ResponsiveHighChart";
import DashboardSidebar from "../_context/components/DashboardSidebar";
import ChartFactory from "../_context/components/ChartFactory";
import { ChartOption, ChartItem } from "../types/chart-types";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
  
const LOCAL_STORAGE_KEY = "dashboard_layouts";
const CHARTS_STORAGE_KEY = "dashboard_charts";

const lg = [
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
  
const md = [
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

const sm = [
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

const defaultLayouts = { lg, md, sm };

const Dashboard = () => {

    const [layouts, setLayouts] = useState(defaultLayouts);
    const [isEditMode, setIsEditMode] = useState(false);
    const [customCharts, setCustomCharts] = useState<ChartItem[]>([]);
    const [nextChartId, setNextChartId] = useState(1);

    const ResponsiveGridLayout = React.useMemo(() => WidthProvider(Responsive), []);

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
                    console.error("Error parsing layouts from localStorage:", parseError);
                }
            }
            
            setLayouts(loadedLayouts);

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
                    console.error("Error parsing charts from localStorage:", parseError);
                }
            }
            
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
            console.error("Error loading dashboard data from localStorage:", error);
            setLayouts(defaultLayouts);
            setCustomCharts([]);
            setNextChartId(1);
        }
    }, []);
    
    const saveLayouts = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layouts));
            localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(customCharts));
            setIsEditMode(false); 
            alert("Dashboard layout opgeslagen!");
        } catch (error) {
            console.error("Error saving layouts to localStorage:", error);
            alert("Er is een fout opgetreden bij het opslaan van de layout.");
        }
    };

    const onLayoutChange = (_currentLayout: any, allLayouts: any) => {
        if (isEditMode) {
            setLayouts(allLayouts);
        }
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const resetToDefault = () => {
        setLayouts(defaultLayouts);
        setCustomCharts([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(CHARTS_STORAGE_KEY);
        setIsEditMode(false);
        setNextChartId(1);
        alert("Dashboard layout is hersteld naar de standaard instellingen.");
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
        const newChartId = `custom-${nextChartId}`;
        setNextChartId(prevId => prevId + 1);

        let width = 6;
        let height = 10;
        
        if (chartType.id === 'pie') {
            width = 5;
        } else if (chartType.id === 'bar') {
            width = 7;
        }

        const { x, y } = findFreeGridPosition(width, height);
        
        const newChart: ChartItem = {
            i: newChartId,
            chartType: chartType.id,
            x: x,
            y: y,
            w: width,
            h: height
        };

        const updatedLayouts = {
            lg: [...(layouts.lg || []), { i: newChartId, x, y, w: width, h: height }],
            md: [...(layouts.md || []), { i: newChartId, x: 0, y, w: Math.min(width, 10), h: height }],
            sm: [...(layouts.sm || []), { i: newChartId, x: 0, y, w: 1, h: height }]
        };

        setLayouts(updatedLayouts);
        setCustomCharts(prev => [...prev, newChart]);

        setIsEditMode(true);

        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLayouts));
            localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify([...customCharts, newChart]));
        } catch (error) {
            console.error("Error saving layouts after adding chart:", error);
        }
    };

    const handleRemoveChart = (chartId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!chartId.startsWith('custom-')) return;
        
        const updatedLayouts = {
            lg: (layouts.lg || []).filter(item => item.i !== chartId),
            md: (layouts.md || []).filter(item => item.i !== chartId),
            sm: (layouts.sm || []).filter(item => item.i !== chartId)
        };
        
        const updatedCustomCharts = customCharts.filter(chart => chart.i !== chartId);
        
        setLayouts(updatedLayouts);
        setCustomCharts(updatedCustomCharts);

        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLayouts));
            localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(updatedCustomCharts));
        } catch (error) {
            console.error("Error saving layouts after chart removal:", error);
        }
    };

    // const lineChartOptions = {
    //     chart: {
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     },
    //     title: { 
    //         text: "Trends Overview",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
    //     xAxis: {
    //         lineColor: '#e2e8f0',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     yAxis: {
    //         gridLineColor: '#f1f5f9',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     series: [{
    //         type: "line" as const,
    //         name: "Performance",
    //         data: [1, 3, 2, 4, 5, 3, 6],
    //         lineWidth: 3,
    //         marker: {
    //             radius: 4
    //         }
    //     }]
    // };

    // const pieChartOptions = {
    //     chart: { 
    //         type: "pie" as const,
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     },
    //     title: { 
    //         text: "Completion Status",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#3b82f6', '#e2e8f0', '#f59e0b'],
    //     plotOptions: {
    //         pie: {
    //             borderWidth: 0,
    //             borderRadius: 4,
    //             innerSize: '50%',
    //             dataLabels: {
    //                 distance: 20,
    //                 style: {
    //                     fontWeight: '500',
    //                     color: '#475569',
    //                     textOutline: 'none'
    //                 }
    //             }
    //         }
    //     },
    //     series: [{
    //         type: "pie" as const,
    //         name: "Completed",
    //         data: [
    //           { name: "Done", y: 60 },
    //           { name: "Remaining", y: 30 },
    //           { name: "Deals", y: 10 }
    //         ]
    //     }]
    // };

    // const revisitBarOptions = {
    //     chart: { 
    //         type: "column" as const,
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     }, 
    //     title: { 
    //         text: "Customer Revisits",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#3b82f6', '#94a3b8'],
    //     xAxis: {
    //         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //         lineColor: '#e2e8f0',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     yAxis: {
    //         title: {
    //             text: 'Revisits'
    //         },
    //         gridLineColor: '#f1f5f9',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     plotOptions: {
    //         column: {
    //             borderRadius: 4,
    //             borderWidth: 0
    //         }
    //     },
    //     series: [
    //         {
    //             type: "column" as const,
    //             name: "Gewonnen",
    //             data: [49, 71, 106, 129, 144, 176]
    //         },
    //         {
    //             type: "column" as const,
    //             name: "Open",
    //             data: [83, 78, 98, 93, 106, 84]
    //         }
    //     ] 
    // };

    // const formCloseOptions = {
    //     chart: { 
    //         type: "area" as const,
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     },
    //     title: { 
    //         text: "Gewonnen deals",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#10b981'],
    //     xAxis: {
    //         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //         lineColor: '#e2e8f0',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     yAxis: {
    //         title: {
    //             text: 'Percentage'
    //         },
    //         gridLineColor: '#f1f5f9',
    //         labels: {
    //             format: '{value}%',
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     tooltip: {
    //         pointFormat: '{series.name}: <b>{point.y}%</b>'
    //     },
    //     plotOptions: {
    //         area: {
    //             fillOpacity: 0.3,
    //             marker: {
    //                 enabled: false,
    //                 symbol: 'circle',
    //                 radius: 2,
    //                 states: {
    //                     hover: {
    //                         enabled: true
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     series: [
    //         {
    //             type: "area" as const,
    //             name: "Gewonnen deals", 
    //             data: [63, 67, 72, 78, 82, 85]
    //         }
    //     ]
    // };

    // const regionOptions = {
    //     chart: { 
    //         type: "column" as const,
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     },
    //     title: { 
    //         text: "Regional Performance",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
    //     xAxis: {
    //         categories: ['North', 'East', 'South', 'West', 'Central'],
    //         lineColor: '#e2e8f0',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     yAxis: {
    //         title: {
    //             text: 'Sales (€)'
    //         },
    //         gridLineColor: '#f1f5f9',
    //         labels: {
    //             format: '€{value:,.0f}',
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     tooltip: {
    //         pointFormat: '{series.name}: <b>€{point.y:,.0f}</b>'
    //     },
    //     plotOptions: {
    //         column: {
    //             borderRadius: 4,
    //             borderWidth: 0
    //         }
    //     },
    //     series: [
    //         {
    //             type: "column" as const,
    //             name: "Sales",
    //             data: [120000, 95000, 75000, 110000, 145000],
    //             colorByPoint: true
    //         }
    //     ]
    // };

    // const activityOptions = {
    //     chart: { 
    //         type: "line" as const,
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     },
    //     title: { 
    //         text: "Daily User Activity",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#8b5cf6'],
    //     xAxis: {
    //         categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    //         lineColor: '#e2e8f0',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     yAxis: {
    //         title: {
    //             text: 'Active Users'
    //         },
    //         min: 0,
    //         gridLineColor: '#f1f5f9',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     tooltip: {
    //         pointFormat: '{series.name}: <b>{point.y} users</b>'
    //     },
    //     plotOptions: {
    //         line: {
    //             marker: {
    //                 enabled: true,
    //                 radius: 5,
    //                 symbol: 'circle'
    //             },
    //             lineWidth: 3
    //         }
    //     },
    //     series: [
    //         {
    //             type: "line" as const,
    //             name: "Active Users",
    //             data: [143, 176, 202, 148, 187, 236, 225]
    //         }
    //     ]
    // };

    // const stepCompletionOptions = {
    //     chart: { 
    //         type: "bar" as const,
    //         backgroundColor: 'rgba(255, 255, 255, 0.8)',
    //         borderRadius: 12,
    //         style: {
    //             fontFamily: 'var(--font-geist-sans), sans-serif'
    //         }
    //     },
    //     title: { 
    //         text: "Workflow Progress",
    //         style: {
    //             fontWeight: '600',
    //             fontSize: '16px',
    //             color: '#334155'
    //         }
    //     },
    //     colors: ['#3b82f6'],
    //     xAxis: {
    //         categories: ['Planning', 'Design', 'Development', 'Testing', 'Deployment'],
    //         lineColor: '#e2e8f0',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     yAxis: {
    //         min: 0,
    //         max: 100,
    //         title: {
    //             text: 'Completion %'
    //         },
    //         gridLineColor: '#f1f5f9',
    //         labels: {
    //             style: {
    //                 color: '#64748b'
    //             }
    //         }
    //     },
    //     tooltip: {
    //         pointFormat: '{series.name}: <b>{point.y}%</b>'
    //     },
    //     plotOptions: {
    //         bar: {
    //             borderRadius: 4,
    //             dataLabels: {
    //                 enabled: true,
    //                 format: '{y}%',
    //                 style: {
    //                     fontWeight: '500',
    //                     color: '#475569',
    //                     textOutline: 'none'
    //                 }
    //             }
    //         }
    //     },
    //     legend: {
    //         enabled: false
    //     },
    //     series: [
    //         {
    //             type: "bar" as const,
    //             name: "Progress",
    //             data: [90, 80, 85, 40, 30]
    //         }
    //     ]
    // };

    return (
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar onAddChart={handleAddChart} />
        
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <div className="flex space-x-3">
              {isEditMode ? (
                <>
                  <button 
                    onClick={saveLayouts} 
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Opslaan</span>
                  </button>
                  <button 
                    onClick={toggleEditMode} 
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg shadow hover:bg-slate-700 transition-colors flex items-center space-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Annuleren</span>
                  </button>
                  <button 
                    onClick={resetToDefault} 
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-colors flex items-center space-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>Reset</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={toggleEditMode} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            draggableCancel=".react-grid-item-deletion-button"
          >
            <div key="statcard1" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Leads</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">131</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    +12% vs vorige week
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div key="statcard2" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Deals</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">27</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    +5% vs vorige maand
                  </div>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div key="statcard3" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Revenue</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">€43,200</div>
                  <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    +15% vs Q1
                  </div>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div key="statcard4" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500">Conversion</div>
                  <div className="text-2xl font-bold text-slate-800 mt-1">17%</div>
                  <div className="text-xs text-rose-600 font-medium mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16 17a1 1 0 01-1-1v-2.586l-4.293 4.293a1 1 0 01-1.414 0L8 16.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 16.586 14.586 13H12a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    -2% vs target
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
{/* 
            <div key="eventTrends" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={lineChartOptions} />
            </div>

            <div key="completionPie" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={pieChartOptions} />
            </div>

            <div key="revisitBar" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={revisitBarOptions} />
            </div>

            <div key="formClose" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={formCloseOptions} />
            </div>

            <div key="map" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={regionOptions} />
            </div>

            <div key="activity" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={activityOptions} />
            </div>      

            <div key="stepCompletion" className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md">
              <ResponsiveHighChart options={stepCompletionOptions} />
            </div>
             */}
            {customCharts.map(chart => (
              <div 
                key={chart.i} 
                className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 overflow-hidden transition-all hover:shadow-md relative"
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
                  title={`Nieuwe ${chart.chartType} grafiek`} 
                />
              </div>
            ))}
          </ResponsiveReactGridLayout>

          <style jsx>{`
            .react-grid-placeholder {
              background: rgba(59, 130, 246, 0.1) !important;
              border: 2px dashed #3b82f6;
              border-radius: 0.75rem;
            }

            .react-grid-item {
              transition: all 200ms ease;
              transition-property: left, top;
            }
            
            .react-grid-item.react-draggable-dragging {
              transition: none;
              z-index: 100;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            }
            
            .react-grid-item.react-grid-placeholder {
              background: rgba(59, 130, 246, 0.1) !important;
              border: 2px dashed #3b82f6;
              opacity: 0.7;
              border-radius: 0.75rem;
            }
            
            .react-resizable-handle {
              visibility: ${isEditMode ? 'visible' : 'hidden'};
              opacity: ${isEditMode ? '1' : '0'};
              transition: opacity 0.2s ease-in-out;
              right: 5px !important;
              bottom: 5px !important;
              width: 12px !important;
              height: 12px !important;
              background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>');
              background-position: bottom right;
              padding: 0 3px 3px 0;
              background-repeat: no-repeat;
              background-origin: content-box;
              box-sizing: border-box;
              cursor: se-resize;
            }
          `}</style>
        </div>
      </div>
    );
};

export default Dashboard;