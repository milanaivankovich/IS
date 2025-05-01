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
          const label = `${day}/${month}/${year}`;
          last7DaysLabels.push(label);

          const key = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const adsCount = groupedAdvertisements[key] || 0;
          last7DaysData.push(adsCount);
        }

        return {
          labels: last7DaysLabels,
          data: last7DaysData,
        };
        
        case 'lastmonth':
          const todayLM = new Date();
          const last28Days = [];
        
          for (let i = 27; i >= 0; i--) {
            const date = new Date(todayLM);
            date.setDate(todayLM.getDate() - i);
            last28Days.push(date.toISOString().split('T')[0]);
          }
        
          const weeksLM = [0, 0, 0, 0];
        
          last28Days.forEach((dateStr, index) => {
            const groupIndex = Math.floor(index / 7); 
            if (groupedAdvertisements[dateStr]) {
              weeksLM[groupIndex] += groupedAdvertisements[dateStr];
            }
          });
        
          return {
            labels: ['1. sedmica', '2. sedmica', '3. sedmica', '4. sedmica'],
            data: weeksLM,
          };
        
          case 'last6months':
            const today6M = new Date();
            const monthsLabels = [];
            const monthsData = [0, 0, 0, 0, 0, 0];
          
            const monthKeys = [];
            for (let i = 5; i >= 0; i--) {
              const date = new Date(today6M.getFullYear(), today6M.getMonth() - i, 1);
              const month = date.toLocaleString('default', { month: 'long' });
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              monthsLabels.push(month.charAt(0).toUpperCase() + month.slice(1)); 
              monthKeys.push(monthKey);
            }
          
            Object.entries(groupedAdvertisements).forEach(([dateStr, count]) => {
              const [year, month] = dateStr.split('-');
              const key = `${year}-${month}`;
              const index = monthKeys.indexOf(key);
              if (index !== -1) {
                monthsData[index] += count;
              }
            });
          
            return {
              labels: monthsLabels,
              data: monthsData,
            };
          
            case 'alltime':
              const alltimeLabels = [
                'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
                'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
              ];
            
              const alltimeData = Array(12).fill(0); 
              const currentYear = new Date().getFullYear();
            
              Object.entries(groupedAdvertisements).forEach(([dateStr, count]) => {
                const [year, month] = dateStr.split('-');
                if (parseInt(year) === currentYear) {
                  const index = parseInt(month, 10) - 1; 
                  alltimeData[index] += count;
                }
              });
            
              return {
                labels: alltimeLabels,
                data: alltimeData,
              };            
      default:
        return null;
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
        null
      )}
    </div>
    </div>
  );
};

export default StatisticalChart;
