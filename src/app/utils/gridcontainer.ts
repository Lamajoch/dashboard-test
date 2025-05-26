

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
    lg: { minW: 1, minH: 3, maxW: 4, maxH: 6 },
    md: { minW: 1, minH: 3, maxW: 6, maxH: 6 },
    sm: { minW: 1, minH: 3, maxW: 1, maxH: 6 }
  },

  lineChart: {
    lg: { minW: 3, minH: 8, maxW: 12, maxH: 20 },
    md: { minW: 3, minH: 8, maxW: 10, maxH: 20 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 20 }
  },

  stackedLineChart: {
    lg: { minW: 5, minH: 10, maxW: 12, maxH: 20 },
    md: { minW: 5, minH: 10, maxW: 10, maxH: 20 },
    sm: { minW: 1, minH: 10, maxW: 1, maxH: 20 }
  },

  barChart: {
    lg: { minW: 3, minH: 8, maxW: 12, maxH: 18 },
    md: { minW: 3, minH: 8, maxW: 10, maxH: 18 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 18 }
  },

  pieChart: {
    lg: { minW: 2, minH: 7, maxW: 8, maxH: 16 },
    md: { minW: 2, minH: 7, maxW: 8, maxH: 16 },
    sm: { minW: 1, minH: 7, maxW: 1, maxH: 16 }
  },

  map: {
    lg: { minW: 6, minH: 12, maxW: 12, maxH: 25 },
    md: { minW: 8, minH: 12, maxW: 10, maxH: 25 },
    sm: { minW: 1, minH: 12, maxW: 1, maxH: 25 }
  },

  activity: {
    lg: { minW: 4, minH: 8, maxW: 10, maxH: 16 },
    md: { minW: 5, minH: 8, maxW: 10, maxH: 16 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 16 }
  },

  default: {
    lg: { minW: 3, minH: 8, maxW: 12, maxH: 20 },
    md: { minW: 4, minH: 8, maxW: 10, maxH: 20 },
    sm: { minW: 1, minH: 8, maxW: 1, maxH: 20 }
  }
};

export const ITEM_TYPE_MAPPING: Record<string, string> = {
  'statcard1': 'statcard',
  'statcard2': 'statcard', 
  'statcard3': 'statcard',
  'statcard4': 'statcard',

  'eventTrends': 'stackedLineChart',
  'completionPie': 'pieChart',
  'revisitBar': 'barChart',
  'formClose': 'barChart',
  'stepCompletion': 'barChart',

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