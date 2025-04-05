import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../components/StatisticalFieldChart.css';

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
  // Stanje za izbor vremenskog razdoblja
  const [period, setPeriod] = useState('all-time'); // Default je sve vreme

  // Podaci za graf
  const data = {
    labels: [],
    datasets: [
      {
        label: 'Posjeta terenu',
        data: [],
        borderColor: '#F15A24', // Boja linije
        backgroundColor: 'rgba(233, 236, 236, 0.2)', // Boja podloge
        tension: 0.4, // Glatkoća linije
      },
    ],
  };

  // Funkcija za generisanje podataka na temelju odabranog razdoblja
  const getDataForPeriod = (period) => {
    switch (period) {
      case 'last-7-days':
        return {
          labels: ['Prije 7 dana', 'Prije 6 dana', 'Prije 5 dana', 'Prije 4 dana', 'Prije 3 dana', 'Prije 2 dana', 'Danas'],
          data: [80, 90, 100, 110, 120, 130, 140],
        };
      case 'last-month':
        return {
          labels: ['Početak mjeseca', '1. nedelja', '2. nedelja', '3. nedelja', '4. nedelja'],
          data: [150, 160, 170, 180, 190],
        };
      case 'last-6-months':
        return {
          labels: ['Novembar', 'Decembar', 'Januar', 'Februar', 'Mart', 'April'],
          data: [120, 150, 180, 90, 200, 220],
        };
      case 'all-time':
        return {
          labels: [
            'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 
            'Oktobar', 'Novembar', 'Decembar'
          ],
          data: [
            120, 150, 180, 90, 200, 220, 250, 230, 210, 190, 170, 160 // Podaci za svaki mjesec
          ],
        };
      default:
        return {
          labels: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun'],
          data: [120, 150, 180, 90, 200, 220],
        };
    }
  };

  // Ažuriraj podatke na temelju odabranog razdoblja
  const chartData = getDataForPeriod(period);

  // Opcije za graf
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistika posjeta terenu',
      },
    },
  };

  return (
    <div>
      <h2>Posjete terenu</h2>
      <div>
        <button className="button" onClick={() => setPeriod('last-7-days')}>
          Posljednjih 7 dana
        </button>
        <button className="button" onClick={() => setPeriod('last-month')}>
          Posljednjih mjesec dana
        </button>
        <button className="button" onClick={() => setPeriod('last-6-months')}>
          Posljednjih 6 mjeseci
        </button>
        <button className="button" onClick={() => setPeriod('all-time')}>
          Sve vrijeme
        </button>
      </div>
      <Line
        data={{
          ...data,
          labels: chartData.labels,
          datasets: [
            {
              ...data.datasets[0],
              data: chartData.data,
            },
          ],
        }}
        options={options}
      />
    </div>
  );
};

export default StatisticalChart;
