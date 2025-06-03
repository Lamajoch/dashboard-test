"use client";

import React from 'react';
import type { EChartsOption } from 'echarts';
import EChartRenderer from '../ResponsiveEchart';
import { LeadData } from '../../../types/chart-types';
import { Card } from '../timeout';

interface PieRevenueChartProps {
  data: LeadData[];
}

const PieRevenueChart: React.FC<PieRevenueChartProps> = ({ data }) => {
  const processData = (rawData: LeadData[]) => {

    const sellerRevenue = {
      'Jur': 0,
      'Siebe': 0,
      'Tygo': 0
    };

    rawData.forEach(lead => {
      const date = new Date(lead._id);
      const day = date.getDate();

      if (day % 3 === 0) {
        sellerRevenue['Jur'] += lead.count * 17; 
      } else if (day % 3 === 1) {
        sellerRevenue['Siebe'] += lead.count * 12;
      } else {
        sellerRevenue['Tygo'] += lead.count * 15; 
      }
    });

    return Object.entries(sellerRevenue).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const generateOptions = (): EChartsOption => {
    const pieData = processData(data);
    const defaultColors = ['#ffe56f', '#93ceff', '#a7d58f'];

    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      title: {
        text: 'Omzet per Verkoper',
        textStyle: {
          fontWeight: 600,
          fontSize: 16,
          color: '#334155'
        },
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR'
          }).format(params.value);
          return `${params.name}<br/>${params.marker}${value}`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155'
        }
      },
      legend: {
        top: '7%',
        left: 'center',
        textStyle: {
          color: '#64748b'
        }
      },
      series: [{
        type: 'pie',
        name: 'Omzet per Verkoper',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        data: pieData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: defaultColors[index]
          }
        })),
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        animationDuration: 2000,
        animationEasing: 'elasticOut'
      }]
    };
  };

  return <Card><EChartRenderer option={generateOptions()} /></Card>;
};

export default PieRevenueChart; 