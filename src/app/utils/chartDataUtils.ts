// import { LeadData } from '../types/chart-types';

// export const processLeadData = (data: LeadData[]) => {
//   const sortedData = [...data].sort((a, b) => 
//     new Date(a._id).getTime() - new Date(b._id).getTime()
//   );

//   const monthlyData = sortedData.reduce((acc, curr) => {
//     const date = new Date(curr._id);
//     const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
//     if (!acc[monthKey]) {
//       acc[monthKey] = 0;
//     }
//     acc[monthKey] += curr.count;
//     return acc;
//   }, {} as Record<string, number>);

//   const lineChartData = {
//     dates: Object.keys(monthlyData).map(date => {
//       const [year, month] = date.split('-');
//       return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
//     }),
//     values: Object.values(monthlyData)
//   };
//   const totalLeads = sortedData.reduce((sum, curr) => sum + curr.count, 0);

//   const barChartData = {
//     labels: ['Totaal Leads'],
//     values: [totalLeads]
//   };

//   const pieChartData = [
//     { name: 'Direct', value: Math.round(totalLeads * 0.4) },
//     { name: 'Via Website', value: Math.round(totalLeads * 0.3) },
//     { name: 'Via Partners', value: Math.round(totalLeads * 0.2) },
//     { name: 'Overig', value: Math.round(totalLeads * 0.1) }
//   ];

//   return {
//     lineChartData,
//     barChartData,
//     pieChartData
//   };
// }; 