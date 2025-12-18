import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDF(element: HTMLElement, buildingName: string = "Building") {
  try {
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

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      allowTaint: false,
      removeContainer: false,
    });

    // Remove loading indicator
    document.body.removeChild(loadingElement);

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    const totalPages = Math.ceil(imgHeight / pageHeight);
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add report metadata to footer on all pages
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const toolName = "Energy Audit Tool";

    // Add footer to all pages
    for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${reportDate} | ${toolName}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Generate filename with building name and date
    const date = new Date().toISOString().split("T")[0];
    const sanitizedName = buildingName.replace(/[^a-zA-Z0-9]/g, "_") || "Building";
    const filename = `Energy_Audit_Report_${sanitizedName}_${date}.pdf`;

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}

