import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registrujte potrebne komponente u Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatisticalChart = () => {
  // Podaci za graf
  const data = {
    labels: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni'], // Meseci
    datasets: [
      {
        label: 'Poseta Sajtu',
        data: [120, 150, 180, 90, 200, 220], // Poseta za svaki mesec
        borderColor: 'rgba(75, 192, 192, 1)', // Boja linije
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Boja podloge
        tension: 0.4, // Glatkoća linije
      },
    ],
  };

  // Opcije za graf
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistika Poseta',
      },
    },
  };

  return (
    <div>
      <h2>Statistika Poseta Sajtu</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default StatisticalChart;
