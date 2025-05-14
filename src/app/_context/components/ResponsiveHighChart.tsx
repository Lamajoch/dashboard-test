import React, { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact, { HighchartsReactRefObject } from "highcharts-react-official";

interface ResponsiveHighChartProps {
  options: Highcharts.Options;
}

const ResponsiveHighChart: React.FC<ResponsiveHighChartProps> = ({ options }) => {
  const chartComponentRef = useRef<HighchartsReactRefObject>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartComponentRef.current?.chart) {
        chartComponentRef.current.chart.reflow();
      }
    };

    const container = chartComponentRef.current?.container?.current;

    const resizeObserver = new ResizeObserver(handleResize);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []); 

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      containerProps={{ style: { width: "100%", height: "100%" } }}
    />
  );
};

export default ResponsiveHighChart;
