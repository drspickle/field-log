import { Line } from 'react-chartjs-2';
import { fmtDate } from '../../utils/stats';
import { chartOptsVo2 } from '../../utils/chartOptions';

export default function Vo2Chart({ vo2Entries }) {
  const vo2 = vo2Entries.slice(-10);
  const data = {
    labels: vo2.map((v) => fmtDate(v.date)),
    datasets: [
      {
        label: 'VO2 Max',
        data: vo2.map((v) => v.value),
        borderColor: '#e8a33d',
        backgroundColor: '#e8a33d',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };
  return <Line data={data} options={chartOptsVo2()} />;
}
