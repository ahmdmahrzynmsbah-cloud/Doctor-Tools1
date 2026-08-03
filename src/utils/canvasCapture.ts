import html2canvas from 'html2canvas';

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  const card = (element.querySelector('#invoice-card') as HTMLElement) ||
               (element.querySelector('#pdf-export-card') as HTMLElement) ||
               (element.id === 'invoice-card' ? element : null) ||
               (element.firstElementChild as HTMLElement) ||
               element;

  const targetWidth = customWidth || 850;
  
  const images = Array.from(card.querySelectorAll('img'));
  await Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((res) => { 
      img.onload = res; 
      img.onerror = res; 
    });
  }));
  
  if (document.fonts) {
    try { await document.fonts.ready; } catch (e) {}
  }
  
  await new Promise(r => setTimeout(r, 800));

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
      onclone: (clonedDoc) => {
        const printArea = clonedDoc.getElementById('hidden-share-invoice-print');
        if (printArea) {
          printArea.style.opacity = '1';
        }
        
        const invoiceCard = clonedDoc.getElementById('invoice-card');
        if (invoiceCard) {
          invoiceCard.style.minHeight = '1150px';
        }

        const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden');
        hiddenElements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    });
    
    return canvas;
  } catch (error) {
    console.error('html2canvas failed:', error);
    throw error;
  }
}
