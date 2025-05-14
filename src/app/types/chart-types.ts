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
} 