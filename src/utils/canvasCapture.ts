import html2canvas from 'html2canvas';

export async function captureElementToCanvas(containerEl: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  // Try to specifically target the invoice card
  let element = document.getElementById('invoice-card') as HTMLElement;
  
  if (!element) {
    element = (containerEl.querySelector('#invoice-card') as HTMLElement) ||
           (containerEl.querySelector('#pdf-export-card') as HTMLElement) ||
           (containerEl.id === 'invoice-card' ? containerEl : null) ||
           (containerEl.firstElementChild as HTMLElement) ||
           containerEl;
  }

  // Force wrapper to visible if using the hidden share print ref
  const parent = element.closest('#hidden-share-invoice-print') as HTMLElement;
  if (parent) {
     parent.style.opacity = '1';
     parent.style.zIndex = '9999';
  }

  console.log(element);
  console.log(element.outerHTML);
  console.log(element.getBoundingClientRect());
  console.log(getComputedStyle(element).display);
  console.log(getComputedStyle(element).visibility);
  console.log(getComputedStyle(element).opacity);

  element.style.outline = "5px solid red";
  await new Promise(r => setTimeout(r, 3000));

  const targetWidth = customWidth || 850;
  
  // Wait for all images within the card to fully load
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((res) => { 
      img.onload = res; 
      img.onerror = res; 
    });
  }));
  
  // Wait for fonts to be ready
  if (document.fonts) {
    try { await document.fonts.ready; } catch (e) {}
  }
  
  // Give React additional time to finish any pending rendering cycles
  await new Promise(r => setTimeout(r, 800));

  const targetHeight = element.scrollHeight || element.offsetHeight || 1150;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution output
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden');
        hiddenElements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    });
    
    // Clean up
    element.style.outline = "";
    if (parent) {
       parent.style.opacity = '0.01';
       parent.style.zIndex = '-9999';
    }
    
    return canvas;
  } catch (error) {
    console.error('Canvas capture failed:', error);
    element.style.outline = "";
    throw error;
  }
}
