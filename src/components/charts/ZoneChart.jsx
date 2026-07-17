import { Bar } from 'react-chartjs-2';
import { weeklyZone2Series } from '../../utils/stats';
import { chartOpts } from '../../utils/chartOptions';

export default function ZoneChart({ entries }) {
  const buckets = weeklyZone2Series(entries, 8);
  const data = {
    labels: buckets.map((b) => b.label),
    datasets: [{ label: 'Zone 2 minutes', data: buckets.map((b) => b.value), backgroundColor: '#e8a33d' }],
  };
  return <Bar data={data} options={chartOpts()} />;
}
