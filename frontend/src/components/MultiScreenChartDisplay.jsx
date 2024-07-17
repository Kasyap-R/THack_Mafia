import React, { useState } from "react";
import PropTypes from "prop-types";
import DynamicChartDisplay from "./AdvancedGraphLoader";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenState } from "../stores/MeetingStore";

const MultiScreenChartDisplay = ({ screenStates }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const goToPreviousScreen = () => {
    setCurrentScreenIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : screenStates.length - 1
    );
  };

  const goToNextScreen = () => {
    setCurrentScreenIndex((prevIndex) =>
      prevIndex < screenStates.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <div style={styles.outerContainer}>
      <button onClick={goToPreviousScreen} style={styles.arrowButton}>
        <ChevronLeft size={24} color="white" />
      </button>
      <div style={styles.container}>
        <div style={styles.content}>
          <DynamicChartDisplay chartData={screenStates[currentScreenIndex]} />
        </div>
        <div style={styles.pageIndicator}>
          {currentScreenIndex + 1} / {screenStates.length}
        </div>
      </div>
      <button onClick={goToNextScreen} style={styles.arrowButton}>
        <ChevronRight size={24} color="white" />
      </button>
    </div>
  );
};

const styles = {
  outerContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "calc(100% - 120px)", // Subtract arrow width from both sides
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  content: {
    width: "100%",
    height: "calc(100% - 40px)", // Subtract space for page indicator
    overflow: "auto",
    padding: "0px",
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "24px",
    padding: "10px 15px",
    background: "rgba(0, 0, 0, 0.5)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    outline: "none",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s ease",
  },
  pageIndicator: {
    alignSelf: "center",
    background: "rgba(0, 0, 0, 0.5)",
    color: "white",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "14px",
    marginBottom: "10px",
  },
};

// Add specific styles for left and right arrows
styles.leftArrow = { ...styles.arrowButton, left: "10px" };
styles.rightArrow = { ...styles.arrowButton, right: "10px" };

const ChartTypes = {
  PIE_CHART: "pie_chart",
  BAR_CHART: "bar_chart",
  METRIC: "metric",
  BULLET_POINT: "bullet_point",
};

MultiScreenChartDisplay.propTypes = {
  screenStates: PropTypes.arrayOf(
    PropTypes.arrayOf(
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
    )
  ).isRequired,
};

export default MultiScreenChartDisplay;