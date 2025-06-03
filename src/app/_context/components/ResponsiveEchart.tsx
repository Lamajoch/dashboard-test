import React from "react";
import ReactECharts from 'echarts-for-react';

interface ResponsiveEChartProps {
  option: any; 
}

const ResponsiveEChart: React.FC<ResponsiveEChartProps> = ({ option }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: 'canvas', width: "auto", height: 'auto' }}
      />
    </div>
  );
};

export default ResponsiveEChart;