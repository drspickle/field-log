import { Line } from 'react-chartjs-2';
import { fmtDate, epley1RM } from '../../utils/stats';
import { chartOpts } from '../../utils/chartOptions';

export default function StrengthChart({ strengthTestEntries }) {
  const tests = strengthTestEntries.slice(-10);
  const data = {
    labels: tests.map((v) => fmtDate(v.date)),
    datasets: [
      {
        label: 'Est. 1RM (lb)',
        data: tests.map((v) => Math.round(epley1RM(v.weight, v.reps))),
        borderColor: '#e8a33d',
        backgroundColor: '#e8a33d',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };
  return <Line data={data} options={chartOpts()} />;
}
