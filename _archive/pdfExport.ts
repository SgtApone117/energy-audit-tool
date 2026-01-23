import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import type { ReportData } from "./reportGenerator";
import { EUI_BENCHMARK_RANGES, getEUIContextLabel } from "./benchmarks/euiBenchmarks";

// Theme colors matching modern web UI
const THEME = {
  primary: [37, 99, 235] as [number, number, number], // Blue-600
  secondary: [75, 85, 99] as [number, number, number], // Gray-600
  accent: [243, 244, 246] as [number, number, number], // Gray-100 (Backgrounds)
  text: [17, 24, 39] as [number, number, number], // Gray-900
  border: [229, 231, 235] as [number, number, number], // Gray-200
};

export async function generatePDF(data: ReportData) {
  try {
    // Sanity check: Ensure jspdf-autotable plugin is available
    if (!autoTable || typeof autoTable !== "function") {
      throw new Error("jspdf-autotable plugin is missing. Did you run 'npm install jspdf-autotable'?");
    }

    // Create a loading indicator
    const loadingElement = document.createElement("div");
    loadingElement.style.position = "fixed";
    loadingElement.style.top = "50%";
    loadingElement.style.left = "50%";
    loadingElement.style.transform = "translate(-50%, -50%)";
    loadingElement.style.padding = "20px";
    loadingElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    loadingElement.style.color = "white";
    loadingElement.style.borderRadius = "8px";
    loadingElement.style.zIndex = "10000";
    loadingElement.textContent = "Generating PDF...";
    document.body.appendChild(loadingElement);

    // Wait a moment to ensure everything is rendered
    await new Promise((resolve) => setTimeout(resolve, 300));

    // PDF Constants
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const MARGIN_MM = 15;
    const FOOTER_HEIGHT_MM = 15;
    const LINE_HEIGHT = 7; // mm per line
    const SECTION_SPACING = 8; // mm between sections
    const CARD_PADDING_MM = 6; // Padding for text positioning (legacy from card-based layout)

    // Initialize PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Vertical cursor tracking
    let currentY = MARGIN_MM;
    const pageHeight = A4_HEIGHT_MM;
    const contentWidth = A4_WIDTH_MM - MARGIN_MM * 2;
    const cardContentWidth = contentWidth - CARD_PADDING_MM * 2; // Width inside card
    let hasContentOnPage1 = false; // Track if content has been printed on page 1
    let pageHasContent = false; // Track if current page has any content

    // Helper: Draw header (blue bar with white title)
    const drawHeader = () => {
      const headerBarHeight = 20;
      pdf.setFillColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
      pdf.rect(0, 0, A4_WIDTH_MM, headerBarHeight, "F");
      
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("Energy Audit Report", A4_WIDTH_MM / 2, 12, { align: "center" });
    };

    // Helper: Check if we need a new page
    const checkPageBreak = (requiredHeight: number) => {
      const currentPage = pdf.getCurrentPageInfo().pageNumber;
      const isFirstPage = currentPage === 1;
      
      if (currentY + requiredHeight > pageHeight - FOOTER_HEIGHT_MM) {
        // Only add a new page if we actually have content to add
        if (requiredHeight > 0) {
          // Protect page 1: don't add a new page if we're still on page 1
          // Allow content to start on page 1 even if it might overflow
          if (!isFirstPage) {
            // Only add page if current page has content
            if (pageHasContent) {
              pdf.addPage();
              currentY = MARGIN_MM;
              drawHeader();
              currentY = 20 + SECTION_SPACING;
              pageHasContent = false;
            }
          }
        }
      }
    };

    // Helper: Ensure space for a section (heading + first content item)
    const ensureSpaceForSection = (minHeight: number) => {
      if (currentY + minHeight > pageHeight - FOOTER_HEIGHT_MM) {
        if (pageHasContent) {
          pdf.addPage();
          currentY = MARGIN_MM;
          drawHeader();
          currentY = 20 + SECTION_SPACING;
          pageHasContent = false;
        }
      }
    };

    // Helper: Add footer to a specific page
    const addFooter = (pageNum: number, totalPages: number) => {
      pdf.setPage(pageNum);
      const reportDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const toolName = "Energy Audit Tool";

      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${reportDate} | ${toolName}`,
        A4_WIDTH_MM / 2,
        pageHeight - 8,
        { align: "center" }
      );
      pdf.text(
        `Page ${pageNum} of ${totalPages}`,
        A4_WIDTH_MM / 2,
        pageHeight - 4,
        { align: "center" }
      );
    };

    // Helper: Estimate text height (for look-ahead logic)
    const estimateTextHeight = (
      text: string,
      fontSize: number = 11,
      useCardPadding: boolean = true
    ): number => {
      const textWidth = useCardPadding ? cardContentWidth : contentWidth;
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, textWidth);
      return lines.length * LINE_HEIGHT * (fontSize / 11);
    };

    // Helper: Print a line of text with wrapping (adjusted for card padding)
    const printLine = (
      text: string,
      fontSize: number = 11,
      isBold: boolean = false,
      color: [number, number, number] = THEME.text,
      useCardPadding: boolean = true
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(color[0], color[1], color[2]);

      const textWidth = useCardPadding ? cardContentWidth : contentWidth;
      const xOffset = useCardPadding ? MARGIN_MM + CARD_PADDING_MM : MARGIN_MM;

      const lines = pdf.splitTextToSize(text, textWidth);
      checkPageBreak(lines.length * LINE_HEIGHT * (fontSize / 11));

      lines.forEach((line: string) => {
        // Check if we need a new page during printing (handles overflow)
        if (currentY + LINE_HEIGHT * (fontSize / 11) > pageHeight - FOOTER_HEIGHT_MM) {
          const currentPage = pdf.getCurrentPageInfo().pageNumber;
          // Add new page if: we're past page 1, OR we're on page 1 and content has already been printed
          if (currentPage > 1 || (currentPage === 1 && hasContentOnPage1)) {
            pdf.addPage();
            drawHeader();
            currentY = 20 + SECTION_SPACING;
          }
        }
        pdf.text(line, xOffset, currentY);
        pageHasContent = true;
        if (pdf.getCurrentPageInfo().pageNumber === 1) {
          hasContentOnPage1 = true;
        }
        currentY += LINE_HEIGHT * (fontSize / 11);
      });

      return lines.length * LINE_HEIGHT * (fontSize / 11);
    };

    // Helper: Draw section divider (thin horizontal line)
    const drawSectionDivider = (useCardPadding: boolean = true) => {
      const xOffset = useCardPadding ? MARGIN_MM + CARD_PADDING_MM : MARGIN_MM;
      const dividerWidth = useCardPadding ? cardContentWidth : contentWidth;
      
      pdf.setDrawColor(THEME.border[0], THEME.border[1], THEME.border[2]);
      pdf.setLineWidth(0.5);
      pdf.line(xOffset, currentY, xOffset + dividerWidth, currentY);
      currentY += 2; // Small spacing after divider
    };

    // Helper: Draw left accent bar for section headings
    const drawAccentBar = (y: number, height: number, useCardPadding: boolean = true) => {
      const xOffset = useCardPadding ? MARGIN_MM + CARD_PADDING_MM : MARGIN_MM;
      pdf.setFillColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
      pdf.rect(xOffset - 4, y, 2, height, "F"); // 2mm wide accent bar, 4mm to the left of text
    };

    // Helper: Print a heading with divider and optional accent bar
    const printHeading = (
      text: string,
      level: 1 | 2 | 3 = 2,
      useCardPadding: boolean = true,
      withDivider: boolean = true
    ) => {
      const fontSize = level === 1 ? 18 : level === 2 ? 14 : 12;
    
      checkPageBreak(LINE_HEIGHT * 2);
    
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(THEME.text[0], THEME.text[1], THEME.text[2]);
    
      const xOffset = useCardPadding ? MARGIN_MM + CARD_PADDING_MM : MARGIN_MM;
      pdf.text(text, xOffset, currentY);
      pageHasContent = true;
    
      // Draw divider immediately after heading
      if (withDivider) {
        const dividerY = currentY + 2;
        pdf.setDrawColor(THEME.border[0], THEME.border[1], THEME.border[2]);
        pdf.setLineWidth(0.5);
        pdf.line(
          xOffset,
          dividerY,
          xOffset + (useCardPadding ? cardContentWidth : contentWidth),
          dividerY
        );
      }
    
      currentY += LINE_HEIGHT;
    };

    // Helper: Print a bullet point
    const printBullet = (text: string, indent: number = 5, useCardPadding: boolean = true) => {
      // Defensive check: skip empty text
      if (!text || text.trim().length === 0) {
        return;
      }

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(THEME.text[0], THEME.text[1], THEME.text[2]);

      const textWidth = (useCardPadding ? cardContentWidth : contentWidth) - indent - 3;
      const xOffset = (useCardPadding ? MARGIN_MM + CARD_PADDING_MM : MARGIN_MM) + indent;

      // Print text with wrapping first to get line count
      const lines = pdf.splitTextToSize(text, textWidth);
      
      // Check page break before drawing bullet to prevent orphan bullets
      if (currentY + lines.length * LINE_HEIGHT > pageHeight - FOOTER_HEIGHT_MM) {
        const currentPage = pdf.getCurrentPageInfo().pageNumber;
        if (currentPage > 1 || (currentPage === 1 && hasContentOnPage1)) {
          if (pageHasContent) {
            pdf.addPage();
            currentY = MARGIN_MM;
            drawHeader();
            currentY = 20 + SECTION_SPACING;
            pageHasContent = false;
          }
        }
      }

      // Draw bullet
      pdf.text("•", xOffset - 3, currentY);
      pageHasContent = true;

      lines.forEach((line: string) => {
        // Check if we need a new page during printing (handles overflow)
        if (currentY + LINE_HEIGHT > pageHeight - FOOTER_HEIGHT_MM) {
          const currentPage = pdf.getCurrentPageInfo().pageNumber;
          // Add new page if: we're past page 1, OR we're on page 1 and content has already been printed
          if (currentPage > 1 || (currentPage === 1 && hasContentOnPage1)) {
            if (pageHasContent) {
              pdf.addPage();
              currentY = MARGIN_MM;
              drawHeader();
              currentY = 20 + SECTION_SPACING;
              pageHasContent = false;
            }
          }
        }
        pdf.text(line, xOffset + 3, currentY);
        pageHasContent = true;
        if (pdf.getCurrentPageInfo().pageNumber === 1) {
          hasContentOnPage1 = true;
        }
        currentY += LINE_HEIGHT;
      });
    };

    // Helper: Add chart image
    const addChartImage = async (chartId: string) => {
      try {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) {
          console.warn(`Chart element with ID "${chartId}" not found - skipping chart in PDF`);
          return;
        }

        // Fix charts: Set overflow hidden on recharts wrappers
        const rechartsWrappers = chartElement.querySelectorAll('.recharts-wrapper, [class*="recharts"]');
        rechartsWrappers.forEach((wrapper) => {
          (wrapper as HTMLElement).style.overflow = 'hidden';
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.9);
        const imgWidthMM = (canvas.width * 0.264583) / 2;
        const imgHeightMM = (canvas.height * 0.264583) / 2;

        // Constrain to content width
        const maxWidthMM = contentWidth;
        const finalWidthMM = Math.min(imgWidthMM, maxWidthMM);
        const finalHeightMM = (imgHeightMM * finalWidthMM) / imgWidthMM;

        checkPageBreak(finalHeightMM + SECTION_SPACING + CARD_PADDING_MM * 2);

        pdf.addImage(imgData, "JPEG", MARGIN_MM + CARD_PADDING_MM, currentY, finalWidthMM, finalHeightMM);
        pageHasContent = true;
        currentY += finalHeightMM + SECTION_SPACING;

        // Clean up
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (chartError) {
        console.error(`Failed to capture chart "${chartId}":`, chartError);
        // Continue PDF generation without this chart
        console.warn(`Skipping chart "${chartId}" and continuing PDF generation`);
      }
    };

    // ===== PDF GENERATION STARTS HERE =====

    // 1. Draw header on first page
    drawHeader();
    currentY = 20 + SECTION_SPACING;
    
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    printLine(`Report Generated: ${reportDate}`, 10, false, THEME.secondary, false);
    currentY += SECTION_SPACING * 1.5;

    // 2. AI Executive Summary (if available) - (Measure -> Check -> Print)
    if (data.aiSummary) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Executive Summary heading
      requiredHeight += estimateTextHeight(data.aiSummary.overview, 11);
      requiredHeight += SECTION_SPACING;
      
      requiredHeight += LINE_HEIGHT * 2; // Energy Performance Snapshot heading
      data.aiSummary.energyPerformanceSnapshot.forEach((item) => {
        requiredHeight += estimateTextHeight(item, 11) + LINE_HEIGHT * 0.3;
      });
      requiredHeight += SECTION_SPACING;
      
      requiredHeight += LINE_HEIGHT * 2; // Key Findings heading
      data.aiSummary.keyFindings.forEach((finding) => {
        requiredHeight += estimateTextHeight(finding, 11) + LINE_HEIGHT * 0.3;
      });
      requiredHeight += SECTION_SPACING;
      
      requiredHeight += LINE_HEIGHT * 2; // Recommended Focus Areas heading
      data.aiSummary.recommendedFocusAreas.forEach((area) => {
        requiredHeight += estimateTextHeight(area, 11) + LINE_HEIGHT * 0.3;
      });
      requiredHeight += SECTION_SPACING;
      
      requiredHeight += LINE_HEIGHT * 2; // Top Energy Conservation Measures heading
      requiredHeight += estimateTextHeight(data.aiSummary.topEnergyConservationMeasures, 11);
      requiredHeight += SECTION_SPACING;
      
      requiredHeight += LINE_HEIGHT * 2; // Business Impact Summary heading
      requiredHeight += estimateTextHeight(data.aiSummary.businessImpactSummary, 11);
      requiredHeight += SECTION_SPACING;
      
      requiredHeight += estimateTextHeight(data.aiSummary.disclaimer, 9);
      
      // Check: Page break if needed
      checkPageBreak(requiredHeight);
      
      // Print: Content
      printHeading("Executive Summary", 2);
      printLine(data.aiSummary.overview);
      currentY += SECTION_SPACING;

      printHeading("Energy Performance Snapshot", 3);
      data.aiSummary.energyPerformanceSnapshot.forEach((item) => {
        printBullet(item);
      });
      currentY += SECTION_SPACING;

      printHeading("Key Findings", 3);
      data.aiSummary.keyFindings.forEach((finding) => {
        printBullet(finding);
      });
      currentY += SECTION_SPACING;

      printHeading("Recommended Focus Areas", 3);
      data.aiSummary.recommendedFocusAreas.forEach((area) => {
        printBullet(area);
      });
      currentY += SECTION_SPACING;

      printHeading("Top Energy Conservation Measures", 3);
      printLine(data.aiSummary.topEnergyConservationMeasures);
      currentY += SECTION_SPACING;

      printHeading("Business Impact Summary", 3);
      printLine(data.aiSummary.businessImpactSummary);
      currentY += SECTION_SPACING;

      printLine(data.aiSummary.disclaimer, 9, false, THEME.secondary);
      currentY += SECTION_SPACING;
    }

    // 3. Key Insights & Highlights - in a card (Measure -> Check -> Draw -> Print)
    if (data.insights.length > 0) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Heading
      data.insights.forEach((insight) => {
        const cleanText = insight.text.replace(/\*\*(.*?)\*\*/g, "$1");
        requiredHeight += estimateTextHeight(cleanText, 11) + LINE_HEIGHT * 0.3; // Bullet spacing
      });
      
      // Check: Page break if needed
      checkPageBreak(requiredHeight);
      
      // Print: Content
      printHeading("Key Insights & Highlights", 2, true, true);
      data.insights.forEach((insight) => {
        // Remove markdown formatting for PDF
        const cleanText = insight.text.replace(/\*\*(.*?)\*\*/g, "$1");
        printBullet(cleanText);
      });
      currentY += SECTION_SPACING * 1.5;
    }

    // 4. Total Savings Summary - (Measure -> Check -> Print)
    if (data.ecmResults && data.ecmResults.length > 0) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height
      const paybackText = data.blendedPaybackPeriod === Infinity 
        ? "—" 
        : data.blendedPaybackPeriod.toFixed(1);
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Heading
      requiredHeight += estimateTextHeight(`Total Annual Energy Savings: ${Math.round(data.totalEnergySavings).toLocaleString()} kWh/year`, 11);
      requiredHeight += estimateTextHeight(`Total Annual Cost Savings: $${data.totalCostSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year`, 11);
      requiredHeight += estimateTextHeight(`Estimated Implementation Cost: $${Math.round(data.totalImplementationCost).toLocaleString()} (one-time)`, 11);
      requiredHeight += estimateTextHeight(`Estimated Simple Payback: ${paybackText} years`, 11);
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
      printHeading("Total Savings Summary", 2, true, true);
      printLine(`Total Annual Energy Savings: ${Math.round(data.totalEnergySavings).toLocaleString()} kWh/year`, 11, true);
      printLine(`Total Annual Cost Savings: $${data.totalCostSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year`, 11, true, THEME.primary);
      printLine(`Estimated Implementation Cost: $${Math.round(data.totalImplementationCost).toLocaleString()} (one-time)`, 11, true);
      printLine(`Estimated Simple Payback: ${paybackText} years`, 11, true);
      currentY += SECTION_SPACING * 1.5;
    }

    // 5. EUI Benchmark Context (if applicable) - in a card (Measure -> Check -> Draw -> Print)
    if (data.eui !== null && data.businessType && data.floorArea > 0) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Heading
      requiredHeight += estimateTextHeight(`Calculated EUI: ${data.eui.toFixed(1)} kWh/sq ft/year`, 11);
      
      const benchmarkRange = EUI_BENCHMARK_RANGES[data.businessType as keyof typeof EUI_BENCHMARK_RANGES];
      if (benchmarkRange) {
        requiredHeight += estimateTextHeight(`Typical Range for ${benchmarkRange.label}: ${benchmarkRange.min}–${benchmarkRange.max} kWh/sq ft/year`, 10);
        const contextLabel = getEUIContextLabel(data.eui, benchmarkRange);
        requiredHeight += estimateTextHeight(`Performance Context: ${contextLabel}`, 10);
      }
      
      requiredHeight += estimateTextHeight(
        "EUI provides a normalized view of energy use relative to building size. Typical ranges vary based on building usage patterns, operating hours, and equipment mix.",
        9
      );
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
      printHeading("Energy Use Intensity (EUI) Context", 2);
      printLine(`Calculated EUI: ${data.eui.toFixed(1)} kWh/sq ft/year`, 11, true);
      
      if (benchmarkRange) {
        printLine(`Typical Range for ${benchmarkRange.label}: ${benchmarkRange.min}–${benchmarkRange.max} kWh/sq ft/year`, 10);
        const contextLabel = getEUIContextLabel(data.eui, benchmarkRange);
        printLine(`Performance Context: ${contextLabel}`, 10);
      }
      
      printLine(
        "EUI provides a normalized view of energy use relative to building size. Typical ranges vary based on building usage patterns, operating hours, and equipment mix.",
        9,
        false,
        THEME.secondary
      );
      currentY += SECTION_SPACING;
    }

    // 6. Building Summary - (Measure -> Check -> Print)
    {
      const buildingSectionStartY = currentY;
      
      // Measure: Calculate required height
      let requiredHeight = 0; // Top and bottom padding
      requiredHeight += LINE_HEIGHT * 2; // Heading
      requiredHeight += estimateTextHeight(`Building Name: ${data.buildingName}`, 11);
      requiredHeight += estimateTextHeight(`Business Type: ${data.businessType || "—"}`, 11);
      requiredHeight += estimateTextHeight(`Floor Area: ${data.floorArea.toLocaleString()} sq ft`, 11);
      requiredHeight += estimateTextHeight(`ZIP Code: ${data.zipCode || "—"}`, 11);
      requiredHeight += estimateTextHeight(`Construction Year: ${data.constructionYear || "—"}`, 11);
      requiredHeight += estimateTextHeight(`Primary Heating Fuel: ${data.primaryHeatingFuel || "—"}`, 11);
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
    printHeading("Building Summary", 2, true, true);
    printLine(`Building Name: ${data.buildingName}`, 11);
    printLine(`Business Type: ${data.businessType || "—"}`, 11);
    printLine(`Floor Area: ${data.floorArea.toLocaleString()} sq ft`, 11);
    printLine(`ZIP Code: ${data.zipCode || "—"}`, 11);
    printLine(`Construction Year: ${data.constructionYear || "—"}`, 11);
    printLine(`Primary Heating Fuel: ${data.primaryHeatingFuel || "—"}`, 11);
    currentY += SECTION_SPACING * 1.5;
    }

    // 7. Energy Baseline - in a card (Measure -> Check -> Draw -> Print)
    if (data.annualEnergyUse !== null) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Heading
      requiredHeight += estimateTextHeight(`Estimated Annual Energy Use: ${data.annualEnergyUse.toLocaleString()} kWh/year`, 11);
      if (data.annualEnergyCost !== null) {
        requiredHeight += estimateTextHeight(
          `Estimated Annual Energy Cost: $${data.annualEnergyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year`,
          11
        );
      }
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
      printHeading("Energy Baseline", 2, true, true);
      printLine(`Estimated Annual Energy Use: ${data.annualEnergyUse.toLocaleString()} kWh/year`, 11, true);
      if (data.annualEnergyCost !== null) {
        printLine(
          `Estimated Annual Energy Cost: $${data.annualEnergyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year`,
          11,
          true,
          THEME.primary
        );
      }
      currentY += SECTION_SPACING * 1.5;
    }

    // 8. Energy Breakdown (text + chart) - (Measure -> Check -> Print)
    if (data.endUseBreakdown) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height (estimate chart at 60mm)
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Heading
      Object.entries(data.endUseBreakdown).forEach(([category, kwh]) => {
        requiredHeight += estimateTextHeight(`${category}: ${Math.round(kwh).toLocaleString()} kWh/year`, 11);
      });
      requiredHeight += SECTION_SPACING;
      requiredHeight += 60; // Estimated chart height
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
      printHeading("Energy Breakdown", 2);
      
      // Text breakdown
      Object.entries(data.endUseBreakdown).forEach(([category, kwh]) => {
        printLine(`${category}: ${Math.round(kwh).toLocaleString()} kWh/year`, 11);
      });
      currentY += SECTION_SPACING;

      // Chart image (wrapped in try/catch to prevent chart failures from crashing PDF)
      try {
        await addChartImage("energy-breakdown-chart");
      } catch (chartError) {
        console.error("Error adding energy breakdown chart:", chartError);
        // Continue without chart - text breakdown is already printed above
      }
      
      currentY += SECTION_SPACING;
    }

    // 9. Savings Opportunities Table - in a card (Measure -> Check -> Draw -> Print)
    if (data.ecmResults && data.ecmResults.length > 0) {
      const sectionStartY = currentY;
      
      // Measure: Calculate required height (estimate table: header ~8mm + rows ~6mm each)
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Heading
      requiredHeight += 8; // Table header row
      requiredHeight += data.ecmResults.length * 6; // Table body rows (estimate 6mm per row)
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
      printHeading("Savings Opportunities", 2, true, true);

      autoTable(pdf, {
        startY: currentY,
        head: [
          [
            "Measure",
            "Energy Saved\n(kWh/year)",
            "Annual Cost Savings\n($/year)",
            "Estimated Cost\n($)",
            "Payback\n(years)",
            "Priority",
          ],
        ],
        body: data.ecmResults.map((ecm) => [
          ecm.name,
          Math.round(ecm.energySaved).toLocaleString(),
          `$${ecm.costSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `$${Math.round(ecm.implementationCost).toLocaleString()}`,
          ecm.paybackPeriod === Infinity ? "—" : ecm.paybackPeriod.toFixed(1),
          ecm.priority,
        ]),
        theme: "plain", // Clean theme without default grid
        headStyles: { 
          fillColor: [THEME.primary[0], THEME.primary[1], THEME.primary[2]], 
          textColor: [255, 255, 255], 
          fontStyle: "bold", 
          fontSize: 9,
          lineWidth: 0,
        },
        bodyStyles: { 
          textColor: [THEME.text[0], THEME.text[1], THEME.text[2]], 
          fontSize: 9,
          lineWidth: 0,
        },
        alternateRowStyles: { 
          fillColor: [THEME.accent[0], THEME.accent[1], THEME.accent[2]],
        },
        margin: { left: MARGIN_MM, right: MARGIN_MM },
        styles: { cellPadding: 3, fontSize: 9 },
      });

      // Update currentY after table
      // @ts-expect-error - lastAutoTable is added by jspdf-autotable plugin
      const finalY = pdf.lastAutoTable?.finalY || currentY;
      pageHasContent = true;
      currentY = finalY + SECTION_SPACING;
    }

    // 10. Assumptions & Methodology - (Measure -> Check -> Print)
    {
      const assumptionsSectionStartY = currentY;
      
      // Measure: Calculate required height
      let requiredHeight = 0;
      requiredHeight += LINE_HEIGHT * 2; // Main heading
      data.assumptions.forEach((category) => {
        requiredHeight += LINE_HEIGHT * 2; // Category heading
        category.items.forEach((item) => {
          requiredHeight += estimateTextHeight(item, 11) + LINE_HEIGHT * 0.3; // Bullet spacing
        });
        requiredHeight += SECTION_SPACING * 0.5;
      });
      
      // Check: Page break if needed
      ensureSpaceForSection(requiredHeight);

      // Print: Content
      printHeading("Assumptions & Methodology", 2, true, true);
      data.assumptions.forEach((category) => {
        printHeading(category.title, 3, true, false);
        category.items.forEach((item) => {
          printBullet(item);
        });
        currentY += SECTION_SPACING * 0.5;
      });
      currentY += SECTION_SPACING * 1.5;
    }

    // Remove empty last page if it exists
    // Check if the last page is empty (currentY is still at or near the top margin)
    const totalPagesBeforeCheck = pdf.getNumberOfPages();
    if (totalPagesBeforeCheck > 1 && currentY <= MARGIN_MM + 10) {
      // The last page appears to be empty, remove it
      pdf.deletePage(totalPagesBeforeCheck);
    }

    // Add footers to all pages (two-pass logic)
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      addFooter(i, totalPages);
    }

    // Remove loading indicator
    document.body.removeChild(loadingElement);

    // Generate filename
    const date = new Date().toISOString().split("T")[0];
    const sanitizedName = data.buildingName.replace(/[^a-zA-Z0-9]/g, "_") || "Building";
    const filename = `Energy_Audit_Report_${sanitizedName}_${date}.pdf`;

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Remove loading indicator on error
    const loadingElement = document.querySelector('[style*="z-index: 10000"]') as HTMLElement;
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.parentNode.removeChild(loadingElement);
    }
    // Re-throw error so caller can display detailed message
    throw error;
  }
}
