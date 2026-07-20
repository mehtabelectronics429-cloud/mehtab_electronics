"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/** Rasterise the invoice sheet element into a real (A4) PDF File. */
export async function generateInvoicePdfFile(el: HTMLElement, filename: string): Promise<File> {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH <= pageH) {
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
  } else {
    // Slice a tall invoice across multiple pages by offsetting the same image.
    let position = 0;
    while (position < imgH) {
      pdf.addImage(imgData, "JPEG", 0, -position, imgW, imgH);
      position += pageH;
      if (position < imgH) pdf.addPage();
    }
  }

  const blob = pdf.output("blob");
  return new File([blob], filename, { type: "application/pdf" });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
