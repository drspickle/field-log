import { Chart } from 'react-chartjs-2';
import { fmtDate, average } from '../../utils/stats';
import { chartOptsDualAxis } from '../../utils/chartOptions';

export default function NutritionChart({ dietDaily }) {
  const dietRecent = dietDaily.slice(-7);
  const avgCalories = average(dietDaily.map((d) => d.calories));
  const avgProtein = average(dietDaily.map((d) => d.protein));

  const data = {
    labels: dietRecent.map((d) => fmtDate(d.date)),
    datasets: [
      { type: 'bar', label: 'Calories', data: dietRecent.map((d) => Math.round(d.calories)), backgroundColor: '#e8a33d', yAxisID: 'y' },
      { type: 'bar', label: 'Protein', data: dietRecent.map((d) => Math.round(d.protein)), backgroundColor: '#5c7a68', yAxisID: 'y1' },
      {
        type: 'line',
        label: 'Avg Calories',
        data: dietRecent.map(() => (avgCalories ? Math.round(avgCalories) : null)),
        borderColor: '#e8a33d',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        xAxisID: 'x1',
        yAxisID: 'y',
        fill: false,
      },
      {
        type: 'line',
        label: 'Avg Protein',
        data: dietRecent.map(() => (avgProtein ? Math.round(avgProtein) : null)),
        borderColor: '#5c7a68',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        xAxisID: 'x1',
        yAxisID: 'y1',
        fill: false,
      },
    ],
  };
  return <Chart type="bar" data={data} options={chartOptsDualAxis()} />;
}
