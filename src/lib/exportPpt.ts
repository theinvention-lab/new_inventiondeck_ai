import type { PitchSlide } from '../types';
import type { DesignTemplate } from '../data/designTemplates';

export async function exportPitchDeckPpt(title: string, slides: PitchSlide[], template: DesignTemplate, filename: string) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'INVENTIONDECK', width: 10, height: 5.625 });
  pptx.layout = 'INVENTIONDECK';

  const primary = template.primary.replace('#', '');
  const ink = template.ink.replace('#', '');
  const bg = template.bg.replace('#', '');

  slides.forEach((slide, idx) => {
    const s = pptx.addSlide();
    s.background = { color: bg };

    if (idx === 0) {
      s.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: primary } });
      s.addText(title || slide.title, {
        x: 0.6,
        y: 2.2,
        w: 8.8,
        h: 1.2,
        fontSize: 32,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial',
      });
      s.addText(slide.bullets.join('  ·  '), { x: 0.6, y: 3.3, w: 8.8, h: 0.6, fontSize: 14, color: 'FFFFFF' });
      return;
    }

    s.addText(`${idx}. ${slide.title}`, {
      x: 0.5,
      y: 0.35,
      w: 9,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: primary,
      fontFace: 'Arial',
    });
    s.addShape('line', { x: 0.5, y: 0.95, w: 9, h: 0, line: { color: primary, width: 1.5 } });

    s.addText(
      slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
      { x: 0.6, y: 1.2, w: 8.8, h: 2.6, fontSize: 15, color: ink, valign: 'top' },
    );

    if (slide.note) {
      s.addText(slide.note, { x: 0.6, y: 4.9, w: 8.8, h: 0.5, fontSize: 10, italic: true, color: '8C8C8C' });
    }

    if (slide.chart && slide.chart !== 'none') {
      const sampleData = [
        {
          name: 'Series 1',
          labels: ['1월', '2월', '3월', '4월'],
          values: [10, 22, 35, 48],
        },
      ];
      s.addChart(slide.chart === 'bar' ? pptx.ChartType.bar : pptx.ChartType.line, sampleData, {
        x: 5.6,
        y: 1.3,
        w: 3.8,
        h: 2.4,
        chartColors: [primary],
      });
    }
  });

  await pptx.writeFile({ fileName: filename.endsWith('.pptx') ? filename : `${filename}.pptx` });
}
