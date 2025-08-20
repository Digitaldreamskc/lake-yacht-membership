'use client';

import * as React from 'react';

// Simple placeholder component for chart functionality
const ChartComponent = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <div className="w-full h-full flex items-center justify-center text-muted-foreground" {...props}>
          {children}
      </div>
);

// Export all chart components as the same simple component
export const Chart = ChartComponent;
export const ChartContainer = ChartComponent;
export const ChartTooltip = ChartComponent;
export const ChartTooltipContent = ChartComponent;
export const ChartLegend = ChartComponent;
export const ChartLegendItem = ChartComponent;
export const ChartLegendItemIcon = ChartComponent;
export const ChartLegendItemText = ChartComponent;
export const ChartLegendItemValue = ChartComponent;
export const ChartLegendItemPercentage = ChartComponent;
export const ChartLegendItemCount = ChartComponent;
export const ChartLegendItemSum = ChartComponent;
export const ChartLegendItemAverage = ChartComponent;
export const ChartLegendItemMin = ChartComponent;
export const ChartLegendItemMax = ChartComponent;
export const ChartLegendItemRange = ChartComponent;
export const ChartLegendItemMedian = ChartComponent;
export const ChartLegendItemMode = ChartComponent;
export const ChartLegendItemVariance = ChartComponent;
export const ChartLegendItemStandardDeviation = ChartComponent;
export const ChartLegendItemCoefficientOfVariation = ChartComponent;
export const ChartLegendItemSkewness = ChartComponent;
export const ChartLegendItemKurtosis = ChartComponent;
export const ChartLegendItemQuartile = ChartComponent;
export const ChartLegendItemPercentile = ChartComponent;
export const ChartLegendItemDecile = ChartComponent;
export const ChartLegendItemQuintile = ChartComponent;
export const ChartLegendItemSextile = ChartComponent;
export const ChartLegendItemOctile = ChartComponent;
export const ChartLegendItemVigintile = ChartComponent;
export const ChartLegendItemCentile = ChartComponent;
export const ChartLegendItemPermille = ChartComponent;
export const ChartLegendItemBasisPoint = ChartComponent;
export const ChartLegendItemPPM = ChartComponent;
export const ChartLegendItemPPB = ChartComponent;
export const ChartLegendItemPPT = ChartComponent;
export const ChartLegendItemPPQ = ChartComponent;
export const ChartLegendItemPPQM = ChartComponent;
export const ChartLegendItemPPQT = ChartComponent;
export const ChartLegendItemPPQP = ChartComponent;
export const ChartLegendItemPPQS = ChartComponent;
export const ChartLegendItemPPQH = ChartComponent;
export const ChartLegendItemPPQD = ChartComponent;
export const ChartLegendItemPPQW = ChartComponent;
export const ChartLegendItemPPQY = ChartComponent;
export const ChartLegendItemPPQC = ChartComponent;
export const ChartLegendItemPPQK = ChartComponent;
export const ChartLegendItemPPQZ = ChartComponent;
export const ChartLegendItemPPQJ = ChartComponent;
export const ChartLegendItemPPQN = ChartComponent;
export const ChartLegendItemPPQQ = ChartComponent;
export const ChartLegendItemPPQR = ChartComponent;
export const ChartLegendItemPPQU = ChartComponent;
export const ChartLegendItemPPQV = ChartComponent;
export const ChartLegendItemPPQX = ChartComponent;
