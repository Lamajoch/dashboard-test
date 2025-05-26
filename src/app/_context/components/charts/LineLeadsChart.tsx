"use client";

import React from 'react';
import type { EChartsOption } from 'echarts';
import EChartRenderer from '../ResponsiveEchart';
import { LeadData } from '../../../types/chart-types';
import { Card } from '../timeout';

interface LineLeadsChartProps {
  data: LeadData[];
  colors?: Record<string, string>;
}

const LineLeadsChart: React.FC<LineLeadsChartProps> = ({ data, colors = {} }) => {
  const processData = (rawData: LeadData[]) => {
    const sortedData = [...rawData].sort((a, b) => 
      new Date(a._id).getTime() - new Date(b._id).getTime()
    );

    const monthlyData = sortedData.reduce((acc, curr) => {
      const date = new Date(curr._id);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += curr.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      dates: Object.keys(monthlyData).map(date => {
        const [year, month] = date.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
      }),
      values: Object.values(monthlyData)
    };
  };

  const generateOptions = (): EChartsOption => {
    const { dates, values } = processData(data);
    const primaryColor = colors.primary || '#A7d194';

    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      title: {
        text: 'Leads Over Tijd',
        textStyle: {
          fontWeight: 600,
          fontSize: 16,
          color: '#334155'
        },
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155'
        },
        formatter: (params: any) => {
          const value = params[0].value;
          return `${params[0].axisValue}<br/>${params[0].marker}${params[0].seriesName}: ${value} leads`;
        }
      },
      grid: {
        top: 60,
        right: 20,
        bottom: 40,
        left: 60,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisLabel: {
          color: '#64748b',
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Aantal Leads',
        nameTextStyle: {
          color: '#64748b'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9'
          }
        },
        axisLabel: {
          color: '#64748b'
        }
      },
      series: [{
        type: 'line',
        name: 'Leads',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: primaryColor
        },
        itemStyle: {
          color: primaryColor
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: primaryColor
            }, {
              offset: 1,
              color: 'rgba(167, 209, 148, 0.1)'
            }]
          }
        },
        animationDuration: 2000,
        animationEasing: 'cubicInOut'
      }]
    };
  };

  return <Card><EChartRenderer option={generateOptions()} /></Card>;
};

export default LineLeadsChart; 