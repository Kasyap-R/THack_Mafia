import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ChartTypes = {
  PIE_CHART: "pie_chart",
  BAR_CHART: "bar_chart",
  METRIC: "metric",
  BULLET_POINT: "bullet_point",
};

const FlipCard = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flip-card"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        perspective: "1000px",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        className="flip-card-inner"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.6s",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "",
        }}
      >
        <div
          className="flip-card-front"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>
        <div
          className="flip-card-back"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            overflow: "auto",
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};

const RelevantDocs = ({ rel_docs }) => (
  <div>
    <h3>llm citations</h3>
    <ul>
      {rel_docs.map((doc, index) => (
        <li key={index}>{doc}</li>
      ))}
    </ul>
  </div>
);

const PieChart = ({ title, values, labels, description }) => {
  const defaultColors = [
    "#005C8E", // TIAA Dark Blue
    "#00A3E0", // TIAA Light Blue
    "#78BE20", // TIAA Green
    "#00587C", // Darker Blue
    "#41B6E6", // Lighter Blue
    "#97D700", // Lighter Green
    "#003F5C", // Navy Blue
    "#58CCED", // Sky Blue
    "#007A99", // Teal
    "#89D9EF", // Pale Blue
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (_, index) => defaultColors[index % defaultColors.length]
        ),
        borderColor: "white",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    maintainAspectRatio: false, // This allows us to control the chart's height
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>{title}</h3>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Pie
          data={data}
          options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "0.9em",
          color: "#666",
        }}
      >
        {description}
      </p>
    </div>
  );
};

const BarChart = ({ title, values, labels, description }) => {
  const defaultColors = [
    "#005C8E", // TIAA Dark Blue
    "#00A3E0", // TIAA Light Blue
    "#78BE20", // TIAA Green
    "#00587C", // Darker Blue
    "#41B6E6", // Lighter Blue
    "#97D700", // Lighter Green
    "#003F5C", // Navy Blue
    "#58CCED", // Sky Blue
    "#007A99", // Teal
    "#89D9EF", // Pale Blue
  ];
  const data = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: labels.map(
          (_, index) => defaultColors[index % defaultColors.length]
        ),
      },
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>{title}</h3>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "0.9em",
          color: "#666",
        }}
      >
        {description}
      </p>
    </div>
  );
};

const Metric = ({ title, values, description, is_percent }) => {
  const [color, setColor] = useState("");

  const colors = [
    "#005C8E", // TIAA Dark Blue
    "#00A3E0", // TIAA Light Blue
    "#78BE20", // TIAA Green
    "#00587C", // Darker Blue
    "#41B6E6", // Lighter Blue
    "#97D700", // Lighter Green
    "#003F5C", // Navy Blue
    "#007A99", // Teal
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    setColor(getRandomColor());
  }, []);

  return (
    <div
      style={{
        backgroundColor: color,
        padding: "20px",
        borderRadius: "10px",
        color: "white",
      }}
    >
      <h3>{title}</h3>
      <h2>
        {values}
        {is_percent ? "%" : ""}
      </h2>
      <p>{description}</p>
    </div>
  );
};

const BulletPoints = ({ title, labels }) => {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {labels.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  );
};

const ChartCard = ({ data }) => {
  const frontContent = (() => {
    switch (data.type_of_chart) {
      case ChartTypes.PIE_CHART:
        return <PieChart {...data} />;
      case ChartTypes.BAR_CHART:
        return <BarChart {...data} />;
      case ChartTypes.METRIC:
        return <Metric {...data} />;
      case ChartTypes.BULLET_POINT:
        return <BulletPoints {...data} />;
      default:
        return null;
    }
  })();
  const backContent = <RelevantDocs rel_docs={data.rel_docs} />;

  return <FlipCard front={frontContent} back={backContent} />;
};

const DynamicChartDisplay = ({ chartData }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {chartData.map((data, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "15px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            height: "400px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChartCard data={data} />
        </div>
      ))}
    </div>
  );
};

DynamicChartDisplay.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      type_of_chart: PropTypes.oneOf(Object.values(ChartTypes)).isRequired,
      title: PropTypes.string.isRequired,
      values: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.number),
      ]).isRequired,
      labels: PropTypes.arrayOf(PropTypes.string),
      description: PropTypes.string,
      is_percent: PropTypes.bool,
      rel_docs: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};

export default DynamicChartDisplay;
