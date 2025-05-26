import React, { useRef } from "react";
import ReactECharts from 'echarts-for-react';

interface ResponsiveEChartProps {
  option: any; 
}

const ResponsiveEChart: React.FC<ResponsiveEChartProps> = ({ option }) => {
  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // const [width, setWidth] = React.useState<number>(0);
  // const [debouncedWidth] = useDebounce(width, 10);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactECharts
        option={option}
        ref={chartRef}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: 'canvas', width: "auto", height: 'auto' }}
      />
    </div>
  );
};

export default ResponsiveEChart;