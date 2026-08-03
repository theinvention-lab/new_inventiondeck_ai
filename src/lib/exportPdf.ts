import type { PlanSection } from '../types';
import type { DesignTemplate } from '../data/designTemplates';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export async function exportBizPlanPdf(title: string, sections: PlanSection[], template: DesignTemplate, filename: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  const [pr, pg, pb] = hexToRgb(template.primary);
  const [ir, ig, ib] = hexToRgb(template.ink);

  // Cover page
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageWidth, 180, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('BUSINESS PLAN', margin, 70);
  doc.setFontSize(26);
  doc.text(title || '사업계획서', margin, 110, { maxWidth: contentWidth });
  doc.setFontSize(11);
  doc.text(new Date().toLocaleDateString('ko-KR'), margin, 150);

  let y = 230;
  doc.setTextColor(ir, ig, ib);

  sections.forEach((section, idx) => {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.setFontSize(14);
    doc.setTextColor(pr, pg, pb);
    doc.text(`${idx + 1}. ${section.title}`, margin, y);
    y += 20;

    doc.setFontSize(10.5);
    doc.setTextColor(ir, ig, ib);
    const lines: string[] = doc.splitTextToSize(section.content || '(작성된 내용이 없습니다)', contentWidth);
    for (const line of lines) {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, margin, y);
      y += 15;
    }
    y += 18;
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
