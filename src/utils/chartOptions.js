export function chartOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b9198', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#2c3337' } },
      y: { ticks: { color: '#8b9198', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#2c3337' }, beginAtZero: true },
    },
  };
}

export function chartOptsVo2() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b9198', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#2c3337' } },
      y: { min: 45, max: 50, ticks: { stepSize: 0.5, color: '#8b9198', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#2c3337' } },
    },
  };
}

export function chartOptsDualAxis() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#8b9198', font: { family: 'IBM Plex Mono', size: 10 }, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: '#8b9198', font: { family: 'IBM Plex Mono', size: 10 } }, grid: { color: '#2c3337' } },
      x1: { type: 'category', offset: false, display: false },
      y: {
        position: 'left',
        ticks: { color: '#e8a33d', font: { family: 'IBM Plex Mono', size: 10 } },
        grid: { color: '#2c3337' },
        beginAtZero: true,
        title: { display: true, text: 'Calories', color: '#e8a33d', font: { family: 'IBM Plex Mono', size: 10 } },
      },
      y1: {
        position: 'right',
        ticks: { color: '#5c7a68', font: { family: 'IBM Plex Mono', size: 10 } },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
        title: { display: true, text: 'Protein (g)', color: '#5c7a68', font: { family: 'IBM Plex Mono', size: 10 } },
      },
    },
  };
}
