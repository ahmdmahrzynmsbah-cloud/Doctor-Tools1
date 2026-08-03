import html2canvas from 'html2canvas';

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  const card = (element.querySelector('#invoice-card') as HTMLElement) ||
               (element.querySelector('#pdf-export-card') as HTMLElement) ||
               (element.id === 'invoice-card' ? element : null) ||
               (element.firstElementChild as HTMLElement) ||
               element;

  const targetWidth = customWidth || card.offsetWidth || 850;
  
  if (document.fonts) {
    try { await document.fonts.ready; } catch (e) {}
  }
  
  const images = Array.from(card.querySelectorAll('img'));
  await Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((res) => { img.onload = res; img.onerror = res; });
  }));
  
  // Give ample time for React to render and images to load
  await new Promise(r => setTimeout(r, 600));

  const targetHeight = card.scrollHeight || card.offsetHeight || 1150;

  try {
    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (node) => {
        if (node.classList && node.classList.contains('print:hidden')) {
          return true;
        }
        return false;
      }
    });
    return canvas;
  } catch (error) {
    console.error('html2canvas failed:', error);
    throw error;
  }
}
