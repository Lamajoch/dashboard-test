"use client";

import React from 'react';
import Highcharts from 'highcharts';
import ResponsiveHighChart from './ResponsiveHighChart';

interface ChartFactoryProps {
  chartType: string;
  title?: string;
}

const ChartFactory: React.FC<ChartFactoryProps> = ({ chartType, title = 'Nieuwe grafiek' }) => {
  const generateChartOptions = (): Highcharts.Options => {
    const baseOptions = {
      chart: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        style: {
          fontFamily: 'var(--font-geist-sans), sans-serif'
        }
      },
      title: { 
        text: title,
        style: {
          fontWeight: '600',
          fontSize: '16px',
          color: '#334155'
        }
      },
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        lineColor: '#e2e8f0',
        labels: {
          style: {
            color: '#64748b'
          }
        }
      },
      yAxis: {
        title: {
          text: 'Waarde'
        },
        gridLineColor: '#f1f5f9',
        labels: {
          style: {
            color: '#64748b'
          }
        }
      }
    };

    // Data voor elk chart type
    const mockData = [65, 59, 80, 81, 56, 72];

    switch (chartType) {
      case 'line':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'line' as const
          },
          series: [{
            type: 'line' as const,
            name: 'Trend',
            data: mockData,
            lineWidth: 3,
            marker: {
              radius: 4
            }
          }]
        };
      
      case 'bar':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'bar' as const
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              borderWidth: 0
            }
          },
          series: [{
            type: 'bar' as const,
            name: 'Waarde',
            data: mockData,
            colorByPoint: true
          }]
        };
      
      case 'pie':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'pie' as const
          },
          plotOptions: {
            pie: {
              borderWidth: 0,
              borderRadius: 4,
              innerSize: '50%',
              dataLabels: {
                distance: 20,
                style: {
                  fontWeight: '500',
                  color: '#475569',
                  textOutline: 'none'
                }
              }
            }
          },
          series: [{
            type: 'pie' as const,
            name: 'Aandeel',
            data: [
              { name: 'Categorie A', y: 40 },
              { name: 'Categorie B', y: 30 },
              { name: 'Categorie C', y: 20 },
              { name: 'Categorie D', y: 10 }
            ]
          }]
        };
      
      case 'area':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'area' as const
          },
          plotOptions: {
            area: {
              fillOpacity: 0.3,
              marker: {
                enabled: false,
                symbol: 'circle',
                radius: 2,
                states: {
                  hover: {
                    enabled: true
                  }
                }
              }
            }
          },
          series: [{
            type: 'area' as const,
            name: 'Gebied',
            data: mockData
          }]
        };
      
      case 'column':
        return {
          ...baseOptions,
          chart: {
            ...baseOptions.chart,
            type: 'column' as const
          },
          plotOptions: {
            column: {
              borderRadius: 4,
              borderWidth: 0
            }
          },
          series: [{
            type: 'column' as const,
            name: 'Waarde',
            data: mockData
          }, {
            type: 'column' as const,
            name: 'Vergelijking',
            data: mockData.map(item => item * 0.7)
          }]
        };
      
      default:
        return {
          ...baseOptions,
          series: [{
            type: 'line' as const,
            name: 'Standaard',
            data: mockData
          }]
        };
    }
  };

  return <ResponsiveHighChart options={generateChartOptions()} />;
};

export default ChartFactory; 