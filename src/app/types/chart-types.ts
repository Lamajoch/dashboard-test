export interface ChartOption {
  id: string;
  name: string;
  icon: string;
}

export interface ChartItem {
  i: string;
  chartType: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options?: any;
  colors?: {
    [key: string]: string;
  };
}

export interface LeadData {
  _id: string;
  count: number;
}

export interface ChartData {
  lineChartData: {
    dates: string[];
    values: number[];
  };
  barChartData: {
    labels: string[];
    values: number[];
  };
  pieChartData: {
    name: string;
    value: number;
  }[];
}

export interface ChartProps {
  data: ChartData;
  colors?: Record<string, string>;
} 