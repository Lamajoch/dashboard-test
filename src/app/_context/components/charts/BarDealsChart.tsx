"use client";

import React from 'react';
import type { EChartsOption } from 'echarts';
import EChartRenderer from '../ResponsiveEchart';
import { LeadData } from '../../../types/chart-types';
import { Card } from '../timeout';

interface BarDealsChartProps {
  data: LeadData[];
  colors?: {
    won?: string;
    lost?: string;
    open?: string;
  };
}

const BarDealsChart: React.FC<BarDealsChartProps> = ({ data, colors = {} }) => {
  const processData = (rawData: LeadData[]) => {
    const sellerDeals = {
      'Jur': { won: 0, lost: 0, open: 0 },
      'Siebe': { won: 0, lost: 0, open: 0 },
      'Tygo': { won: 0, lost: 0, open: 0 }
    };

    rawData.forEach(lead => {
      const date = new Date(lead._id);
      const month = date.getMonth();
      const totalDeals = lead.count;
      
      const wonDeals = Math.round(totalDeals * 0.3);
      const lostDeals = Math.round(totalDeals * 0.2);
      const openDeals = totalDeals - wonDeals - lostDeals;

      if (month % 3 === 0) {
        sellerDeals['Jur'].won += wonDeals;
        sellerDeals['Jur'].lost += lostDeals;
        sellerDeals['Jur'].open += openDeals;
      } else if (month % 3 === 1) {
        sellerDeals['Siebe'].won += wonDeals;
        sellerDeals['Siebe'].lost += lostDeals;
        sellerDeals['Siebe'].open += openDeals;
      } else if (month % 3 === 2) {
        sellerDeals['Tygo'].won += wonDeals;
        sellerDeals['Tygo'].lost += lostDeals;
        sellerDeals['Tygo'].open += openDeals;
      }
    });

    return sellerDeals;
  };

  const generateOptions = (): EChartsOption => {
    const processedData = processData(data);

    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      title: {
        text: 'Deals per verkoper',
        textStyle: {
          fontWeight: 600,
          fontSize: 16,
          color: '#334155'
        },
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155'
        }
      },
      legend: {
        data: ['Gewonnen', 'Verloren', 'Open'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 80,
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisLabel: {
          color: '#64748b'
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: ['Jur', 'Siebe', 'Tygo'],
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisLabel: {
          color: '#64748b'
        }
      },
      series: [
        {
          name: 'Gewonnen',
          type: 'bar',
          stack: 'total',
          itemStyle: { 
            color: colors.won || '#A0D995'
          },
          emphasis: { focus: 'series' },
          data: [
            processedData['Jur'].won,
            processedData['Siebe'].won,
            processedData['Tygo'].won
          ]
        },
        {
          name: 'Verloren',
          type: 'bar',
          stack: 'total',
          itemStyle: { 
            color: colors.lost || '#F8A29C'
          },
          emphasis: { focus: 'series' },
          data: [
            processedData['Jur'].lost,
            processedData['Siebe'].lost,
            processedData['Tygo'].lost
          ]
        },
        {
          name: 'Open',
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            position: 'right',
            color: '#64748b'
          },
          itemStyle: { 
            color: colors.open || '#9CD2F9'
          },
          emphasis: { focus: 'series' },
          data: [
            processedData['Jur'].open,
            processedData['Siebe'].open,
            processedData['Tygo'].open
          ]
        }
      ]
    };
  };

  return <Card><EChartRenderer option={generateOptions()} /></Card>;
};

export default BarDealsChart;