"use client";

import React from 'react';
import type { EChartsOption } from 'echarts';
import EChartRenderer from '../ResponsiveEchart';
import { Card } from '../timeout';

interface WidgetVsConfiguratorData {
  configuratorSeries: Array<{ _id: string; count: number }>;
  widgetSeries: Array<{ _id: string; count: number }>;
}

interface StackedLineChartProps {
  data: WidgetVsConfiguratorData[];
  colors?: Record<string, string>;
}

const StackedLineChart: React.FC<StackedLineChartProps> = ({ data, colors = {} }) => {
  const processData = (rawData: WidgetVsConfiguratorData[]) => {
    const { configuratorSeries, widgetSeries } = rawData[0];

    const sortedConfigurator = [...configuratorSeries].sort((a, b) => 
      new Date(a._id).getTime() - new Date(b._id).getTime()
    );
    const sortedWidget = [...widgetSeries].sort((a, b) => 
      new Date(a._id).getTime() - new Date(b._id).getTime()
    );

    const weeklyData = new Map<string, { configurator: number; widget: number }>();

    const processSeries = (series: typeof configuratorSeries, type: 'configurator' | 'widget') => {
      series.forEach(item => {
        const date = new Date(item._id);
        const weekNumber = getWeekNumber(date);
        const weekKey = `${date.getFullYear()}-W${weekNumber}`;
        
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { configurator: 0, widget: 0 });
        }
        const current = weeklyData.get(weekKey)!;
        current[type] += item.count;
      });
    };

    processSeries(sortedConfigurator, 'configurator');
    processSeries(sortedWidget, 'widget');

    const dates = Array.from(weeklyData.keys()).map(date => {
      const [year, week] = date.split('-W');
      return `Week ${week}, ${year}`;
    });

    const configuratorValues = Array.from(weeklyData.values()).map(d => d.configurator);
    const widgetValues = Array.from(weeklyData.values()).map(d => d.widget);

    return { dates, configuratorValues, widgetValues };
  };
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const generateOptions = (): EChartsOption => {
    const { dates, configuratorValues, widgetValues } = processData(data);
    const configuratorColor = colors.configurator || '#3b82f6';
    const widgetColor = colors.widget || '#ef4444';

    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      title: {
        text: 'Widget 1.0 vs Configurator 2.0',
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
          const configuratorValue = params[0].value;
          const widgetValue = params[1].value;
          const total = configuratorValue + widgetValue;
          return `${params[0].axisValue}<br/>
                  ${params[0].marker}Configurator 2.0: ${configuratorValue} aanvragen<br/>
                  ${params[1].marker}Widget 1.0: ${widgetValue} aanvragen<br/>
                  Totaal: ${total} aanvragen`;
        }
      },
      legend: {
        data: ['Configurator 2.0', 'Widget 1.0'],
        top: '5%',
        textStyle: {
          color: '#64748b'
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
        name: 'Aantal Aanvragen',
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
      series: [
        {
          name: 'Configurator 2.0',
          type: 'line',
          stack: 'Total',
          data: configuratorValues,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: configuratorColor
          },
          itemStyle: {
            color: configuratorColor
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
                color: configuratorColor
              }, {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.1)'
              }]
            }
          },
          animationDuration: 2000,
          animationEasing: 'cubicInOut'
        },
        {
          name: 'Widget 1.0',
          type: 'line',
          stack: 'Total',
          data: widgetValues,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: widgetColor
          },
          itemStyle: {
            color: widgetColor
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
                color: widgetColor
              }, {
                offset: 1,
                color: 'rgba(239, 68, 68, 0.1)'
              }]
            }
          },
          animationDuration: 2000,
          animationEasing: 'cubicInOut'
        }
      ]
    };
  };

  return <Card><EChartRenderer option={generateOptions()} /></Card>;
};

export default StackedLineChart; 