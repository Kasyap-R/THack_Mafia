import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fileDownload from 'js-file-download';
import { API_ENDPOINTS } from '../config/api';
import { useMeetingStore } from '../stores/MeetingStore';

const ExportButtonComponent = () => {
  const [pdfCreated, setPdfCreated] = useState(false);
  const {chatHistory} = useMeetingStore((state) => ({
    chatHistory: state.chatHistory,
    }))

  const generatePDF = async () => {
    try {
    
          const request = {
            logs: JSON.stringify(chatHistory)
          };
      
          const response = await fetch(API_ENDPOINTS.AI.SUMMARY, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });
          const responseData = await response.json();

      const cleanedData = cleanJsonData(responseData.Data);
      console.log('Cleaned JSON Data:', cleanedData);
      console.log(responseData);

      const summary = responseData.Summary;

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const drawTable = (page, data, startY, title) => {
        const { width, height } = page.getSize();
        const margin = 50;
        const cellPadding = 5;
        const fontSize = 10;
        const titleFontSize = 14;
        const headerFontSize = 12;

        // Draw title
        page.drawText(title, {
          x: margin,
          y: startY,
          size: titleFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        let y = startY - 20;

        // Calculate column widths
        const keys = Object.keys(data);
        const columnWidth = (width - 2 * margin) / 2;  // Two columns: Key and Value

        // Draw header
        page.drawText("Key", {
          x: margin + cellPadding,
          y: y,
          size: headerFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText("Value", {
          x: margin + columnWidth + cellPadding,
          y: y,
          size: headerFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        y -= 20;

        // Draw data
        for (const [key, value] of Object.entries(data)) {
          // Draw key
          page.drawText(key, {
            x: margin + cellPadding,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });

          // Draw value
          let valueText;
          if (Array.isArray(value)) {
            valueText = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            valueText = JSON.stringify(value);
          } else {
            valueText = String(value);
          }

          const lines = splitTextToLines(valueText, columnWidth - 2 * cellPadding, font, fontSize);
          lines.forEach((line, index) => {
            page.drawText(line, {
              x: margin + columnWidth + cellPadding,
              y: y - index * 12,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          });

          y -= Math.max(lines.length * 12, 20);

          // Check if we need a new page
          if (y < 50) {
            page = pdfDoc.addPage();
            y = page.getSize().height - 50;
          }
        }

        // Draw table lines
        page.drawLine({
          start: { x: margin, y: startY - 15 },
          end: { x: width - margin, y: startY - 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        return y - 30; // Return the new Y position
      };

      const splitTextToLines = (text, maxWidth, font, fontSize) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const width = font.widthOfTextAtSize(currentLine + ' ' + words[i], fontSize);
          if (width < maxWidth) {
            currentLine += ' ' + words[i];
          } else {
            lines.push(currentLine);
            currentLine = words[i];
          }
        }
        lines.push(currentLine);
        return lines;
      };

      let page = pdfDoc.addPage();
      let yPosition = page.getSize().height - 50;

      // Draw main title
      page.drawText("Environmental Impact Data", {
        x: 50,
        y: yPosition,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 30;

      // Draw summary
      const summaryLines = summary.split('\n');
      summaryLines.forEach(line => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
      });

      yPosition -= 20; // Additional space after summary

      for (const [reportName, reportData] of Object.entries(cleanedData)) {
        // Add a new page if there's not enough space
        if (yPosition < 100) {
          page = pdfDoc.addPage();
          yPosition = page.getSize().height - 50;
        }

        // Draw report name
        page.drawText(reportName, {
          x: 50,
          y: yPosition,
          size: 16,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= 30;

        for (const [sectionName, sectionData] of Object.entries(reportData)) {
          // Add a new page if there's not enough space
          if (yPosition < 100) {
            page = pdfDoc.addPage();
            yPosition = page.getSize().height - 50;
          }

          yPosition = drawTable(page, sectionData, yPosition, sectionName);
        }

        yPosition -= 20; // Add some space between reports
      }

      const pdfBytes = await pdfDoc.save();
      fileDownload(pdfBytes, 'environmental_impact_report.pdf');
      setPdfCreated(true);
      console.log('PDF Created and Download Triggered');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>
      <button onClick={generatePDF}>Generate PDF</button>
      {pdfCreated && <p>PDF created successfully.</p>}
    </div>
  );
};

export default ExportButtonComponent;

const cleanJsonData = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => cleanJsonData(item)).filter(item => item !== null && item !== undefined);
  } else if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      const cleanedValue = cleanJsonData(data[key]);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
  }
  return data;
};