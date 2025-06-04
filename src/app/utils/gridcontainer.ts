export interface GridConstraints {
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
}

export interface BreakpointConstraints {
  lg: GridConstraints;
  md: GridConstraints;
  sm: GridConstraints;
}

export const GRID_CONSTRAINTS: Record<string, BreakpointConstraints> = {

  statcard: {
    lg: { minW: 1, minH: 4, maxW: 4, maxH: 6 },
    md: { minW: 2, minH: 4, maxW: 6, maxH: 6 },
    sm: { minW: 2, minH: 4, maxW: 1, maxH: 6 }
  },

  lineChart: {
    lg: { minW: 3, minH: 8, maxW: 12, maxH: 15 },
    md: { minW: 3, minH: 8, maxW: 10, maxH: 15 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 15 }
  },

  stackedLineChart: {
    lg: { minW: 5, minH: 10, maxW: 12, maxH: 15 },
    md: { minW: 5, minH: 10, maxW: 10, maxH: 15 },
    sm: { minW: 1, minH: 10, maxW: 1, maxH: 15 }
  },

  barChart: {
    lg: { minW: 3, minH: 8, maxW: 12, maxH: 15 },
    md: { minW: 3, minH: 8, maxW: 10, maxH: 15 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 15 }
  },

  pieChart: {
    lg: { minW: 2, minH: 7, maxW: 8, maxH: 15 },
    md: { minW: 2, minH: 7, maxW: 8, maxH: 15 },
    sm: { minW: 1, minH: 7, maxW: 1, maxH: 15 }
  },

  default: {
    lg: { minW: 3, minH: 8, maxW: 12, maxH: 15 },
    md: { minW: 4, minH: 8, maxW: 10, maxH: 15 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 15 }
  }
};

export const ITEM_TYPE_MAPPING: Record<string, string> = {
  'statcard1': 'statcard',
  'statcard2': 'statcard', 
  'statcard3': 'statcard',
  'statcard4': 'statcard',

  'map': 'map',
  'activity': 'activity'
};

export const CHART_TYPE_MAPPING: Record<string, string> = {
  'line': 'lineChart',
  'bar': 'barChart', 
  'pie': 'pieChart',
  'area': 'lineChart',
  'scatter': 'lineChart',
  'stackedLine': 'stackedLineChart'
};


export function getConstraintsForItem(
  itemId: string, 
  breakpoint: keyof BreakpointConstraints,
  chartType?: string
): GridConstraints {
  if (itemId.startsWith('custom-') && chartType) {
    const constraintType = CHART_TYPE_MAPPING[chartType] || 'default';
    return GRID_CONSTRAINTS[constraintType][breakpoint];
  }

  const constraintType = ITEM_TYPE_MAPPING[itemId] || 'default';
  return GRID_CONSTRAINTS[constraintType][breakpoint];
}

export function applyConstraintsToItem(
  item: any,
  breakpoint: keyof BreakpointConstraints,
  chartType?: string
): any {
  const constraints = getConstraintsForItem(item.i, breakpoint, chartType);
  
  return {
    ...item,
    minW: constraints.minW,
    minH: constraints.minH,
    maxW: constraints.maxW,
    maxH: constraints.maxH
  };
}

export function applyConstraintsToLayout(
  layout: any[],
  breakpoint: keyof BreakpointConstraints,
  customCharts: Array<{ i: string; chartType: string }> = []
): any[] {
  const chartTypeMap = new Map(
    customCharts.map(chart => [chart.i, chart.chartType])
  );

  return layout.map(item => {
    const chartType = chartTypeMap.get(item.i);
    return applyConstraintsToItem(item, breakpoint, chartType);
  });
}

export function getOptimalSizeForChart(
  chartType: string,
  breakpoint: keyof BreakpointConstraints
): { w: number; h: number } {
  const constraintType = CHART_TYPE_MAPPING[chartType] || 'default';
  const constraints = GRID_CONSTRAINTS[constraintType][breakpoint];
  
  const w = Math.min(constraints.maxW, Math.max(constraints.minW, 
    breakpoint === 'lg' ? 6 : breakpoint === 'md' ? 8 : 1
  ));
  
  const h = Math.min(constraints.maxH, Math.max(constraints.minH, 10));
  
  return { w, h };
} 