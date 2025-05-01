import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../components/StatisticalFieldChart.css';

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
  const [period, setPeriod] = useState('lastweek'); 
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const path = window.location.pathname;
  const fieldId = path.split("/")[2];

  // Dohvata podatke sa API-a
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        // Dinamički pozovi API na osnovu ID-a terena
        const response = await axios.get(`http://127.0.0.1:8000/api/advertisements/${period}/field/${fieldId}/`);
        console.log(fieldId);
        setAdvertisements(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [fieldId, period]);


  // Funkcija za grupisanje oglasa po datumu
  const groupAdvertisementsByDate = (ads) => {
    return ads.reduce((acc, ad) => {
      const date = ad.date.split('T')[0]; // Uzimamo samo datum (bez vremena)
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});
  };

  // Grupirani podaci
  const groupedAdvertisements = groupAdvertisementsByDate(advertisements);


  // Podaci za graf
  const data = {
    labels: [],
    datasets: [
      {
        label: 'Oglasi na terenu',
        data: [],
        borderColor: '#F15A24', 
        backgroundColor: 'rgba(233, 236, 236, 0.2)', 
        tension: 0.4, 
      },
    ],
  };

  // Funkcija za generisanje podataka na temelju odabranog razdoblja
  const getDataForPeriod = (period) => {
    switch (period) {
      case 'lastweek':
        const today = new Date();
        const last7DaysLabels = [];
        const last7DaysData = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const day = date.getDate();
          const month = date.getMonth() + 1; 
          const year = date.getFullYear();
          const dateString = `${day}/${month}/${year}`;
          last7DaysLabels.push(dateString);

          // Broj oglasa za taj datum
          last7DaysData.push(0,0,0,0,0,1,1);
        }

        return {
          labels: last7DaysLabels,
          data: last7DaysData,
        };
      case 'lastmonth':
        return {
          labels: ['Početak mjeseca', '1. nedelja', '2. nedelja', '3. nedelja', '4. nedelja'],
          data: [150, 160, 170, 180, 190],
        };
      case 'last6months':
        return {
          labels: ['Novembar', 'Decembar', 'Januar', 'Februar', 'Mart', 'April'],
          data: [120, 150, 180, 90, 200, 220],
        };
      case 'alltime':
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

  // Ažurira podatke na temelju odabranog razdoblja
  const chartData = getDataForPeriod(period);

  // Opcije za graf
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistika oglasa na terenu',
      },
    },
  };

  return (
    <div>
      <h2>Oglasi na terenu</h2>
      <div>
        <button className="button" onClick={() => setPeriod('lastweek')}>
          Posljednjih 7 dana
        </button>
        <button className="button" onClick={() => setPeriod('lastmonth')}>
          Posljednjih mjesec dana
        </button>
        <button className="button" onClick={() => setPeriod('last6months')}>
          Posljednjih 6 mjeseci
        </button>
        <button className="button" onClick={() => setPeriod('alltime')}>
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
      <div>
      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <div>
          <pre>{JSON.stringify(groupedAdvertisements, null, 2)}</pre>
        </div>
      )}
    </div>
    </div>
  );
};

export default StatisticalChart;
