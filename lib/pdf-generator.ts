import { jsPDF } from "jspdf";
import { PhotoStripProject } from "@/types/photobooth";
import { renderPhotoStripToCanvas } from "./canvas-renderer";

export async function generatePhotoStripPdf(project: PhotoStripProject): Promise<Blob> {
  const canvas = await renderPhotoStripToCanvas(project, 3);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const isVertical = project.layout === "strip-3" || project.layout === "strip-4";

  const doc = isVertical
    ? new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [2, 6],
      })
    : new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, 6],
      });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

  return doc.output("blob");
}

export async function downloadPhotoStripPdf(project: PhotoStripProject, filename: string = "together-booth.pdf"): Promise<void> {
  const blob = await generatePhotoStripPdf(project);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
