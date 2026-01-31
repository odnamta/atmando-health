# v0.9 - Growth Charts - Design

**Version:** v0.9.0

## Page Structure

```
/members/[id]/growth    → Growth charts tab
```

## Component Hierarchy

```
GrowthPage
├── GrowthSummary
│   ├── CurrentHeight (with percentile)
│   ├── CurrentWeight (with percentile)
│   └── CurrentBMI (with percentile)
├── ChartTabs
│   ├── HeightChart
│   ├── WeightChart
│   └── BMIChart
├── MilestoneSection
│   ├── MilestoneTimeline
│   └── AddMilestoneButton
└── ExportButton
```

## Growth Chart Component

```typescript
interface GrowthChartProps {
  type: 'height' | 'weight' | 'bmi'
  gender: 'male' | 'female'
  birthDate: string
  data: Array<{
    date: string
    value: number
  }>
}
```

Features:
- WHO percentile bands (3rd, 15th, 50th, 85th, 97th)
- Child's data points connected
- Age on X-axis (months/years)
- Value on Y-axis
- Interactive tooltips

## WHO Data Structure

```typescript
// WHO LMS parameters for percentile calculation
interface WHOData {
  ageMonths: number
  L: number // Box-Cox power
  M: number // Median
  S: number // Coefficient of variation
}

// Calculate percentile from measurement
function calculatePercentile(
  value: number,
  L: number,
  M: number,
  S: number
): number {
  const z = L !== 0
    ? (Math.pow(value / M, L) - 1) / (L * S)
    : Math.log(value / M) / S
  
  // Convert Z-score to percentile
  return normalCDF(z) * 100
}
```

## Chart Rendering

```typescript
// Using Recharts with WHO bands
<ResponsiveContainer width="100%" height={400}>
  <ComposedChart data={chartData}>
    {/* WHO percentile bands */}
    <Area dataKey="p97" fill="#fee2e2" stroke="none" />
    <Area dataKey="p85" fill="#fef3c7" stroke="none" />
    <Area dataKey="p50" fill="#d1fae5" stroke="none" />
    <Area dataKey="p15" fill="#fef3c7" stroke="none" />
    <Area dataKey="p3" fill="#fee2e2" stroke="none" />
    
    {/* Percentile lines */}
    <Line dataKey="p97" stroke="#ef4444" strokeDasharray="3 3" />
    <Line dataKey="p50" stroke="#22c55e" strokeWidth={2} />
    <Line dataKey="p3" stroke="#ef4444" strokeDasharray="3 3" />
    
    {/* Child's data */}
    <Line 
      dataKey="childValue" 
      stroke="#3b82f6" 
      strokeWidth={2}
      dot={{ fill: '#3b82f6', r: 4 }}
    />
    
    <XAxis dataKey="ageMonths" />
    <YAxis />
    <Tooltip />
  </ComposedChart>
</ResponsiveContainer>
```

## Milestone Timeline

```
Birth ─────●───────●───────●───────●─────▶ Now
           │       │       │       │
        First   First   First   First
        smile   word    steps   sentence
        (2mo)   (10mo)  (12mo)  (18mo)
```

## PDF Export

```typescript
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

async function exportGrowthPDF(memberId: string) {
  const chartElement = document.getElementById('growth-chart')
  const canvas = await html2canvas(chartElement)
  
  const pdf = new jsPDF('p', 'mm', 'a4')
  pdf.addImage(canvas, 'PNG', 10, 10, 190, 0)
  
  // Add summary text
  pdf.setFontSize(12)
  pdf.text(`Height: ${height} cm (${heightPercentile}th percentile)`, 10, 200)
  pdf.text(`Weight: ${weight} kg (${weightPercentile}th percentile)`, 10, 210)
  
  pdf.save(`growth-chart-${memberName}.pdf`)
}
```
