import React from 'react';
import fileDownload from 'js-file-download';

const ExportButtonComponent = () => {
  const handleDownload = () => {
    const filePath = '../../environmental_impact_report (7)';
    
    fetch(filePath)
      .then(response => response.blob())
      .then(blob => {
        fileDownload(blob, 'environmental_impact_report.pdf');
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  };

  const styles = {
    generatePdfButton: {
      backgroundColor: '#08238C', // Dark blue color
      color: '#ffffff', // White text
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      font: 'RingsideNarrow',
      fontSize: '16px',
      transition: 'background-color 0.3s ease',
    },
  };
  
  return (
    <div>
      <button style={styles.generatePdfButton} onClick={handleDownload}>
        Download Report
      </button>
    </div>
  );
};

export default ExportButtonComponent;