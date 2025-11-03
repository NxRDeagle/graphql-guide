import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BOOKINGS_BUCKETS = {
  Cheap: {
    min: 0,
    max: 100,
  },
  Normal: {
    min: 100,
    max: 200,
  },
  Expensive: {
    min: 200,
    max: 10000000,
  },
};

const BookingsChart = (props) => {
  const labels = [];
  const data = [];

  for (const bucket in BOOKINGS_BUCKETS) {
    const filteredBookingsCount = props.bookings.reduce((prev, current) => {
      if (
        current.event.price > BOOKINGS_BUCKETS[bucket].min &&
        current.event.price < BOOKINGS_BUCKETS[bucket].max
      ) {
        return prev + 1;
      }
      return prev;
    }, 0);

    labels.push(bucket);
    data.push(filteredBookingsCount);
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Bookings",
        data: data,
        backgroundColor: "rgba(220,220,220,0.5)",
        borderColor: "rgba(220,220,220,0.8)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BookingsChart;
