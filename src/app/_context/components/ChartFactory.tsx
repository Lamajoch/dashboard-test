"use client";

import React from 'react';
import LineLeadsChart from './charts/LineLeadsChart';
import PieRevenueChart from './charts/PieRevenueChart';
import BarDealsChart from './charts/BarDealsChart';
import StackedLineChart from './charts/StackedLineChart';
import leadData from '../../data/production-widget-service.lead-configurations.json';
import widgetVsConfiguratorData from '../../data/widgetvsconfigurator.json';

interface ChartFactoryProps {
  chartType: string;
}

const ChartFactory: React.FC<ChartFactoryProps> = ({ chartType }) => {
  const chartStyle: React.CSSProperties = {
    minHeight: 250,
    width: '100%',
    height: '100%',
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <LineLeadsChart data={leadData} />;
      case 'pie':
        return <PieRevenueChart data={leadData} />;
      case 'bar':
        return <BarDealsChart data={leadData} />;
      case 'stacked':
        return <StackedLineChart data={widgetVsConfiguratorData} />;
      default:
        return null;
    }
  };

  return (
    <div style={chartStyle} className="rounded-xl overflow-hidden">
      {renderChart()}
    </div>
  );
};


export default ChartFactory; 