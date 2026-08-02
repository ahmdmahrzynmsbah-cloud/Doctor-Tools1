import html2canvas from 'html2canvas';

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  // Ensure web fonts are fully loaded before capturing
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // ignore font loading errors
    }
  }

  // Extract actual invoice card or target element
  const card = (element.querySelector('#invoice-card') as HTMLElement) ||
               (element.id === 'invoice-card' ? element : null) ||
               (element.firstElementChild as HTMLElement) ||
               element;

  // Deep clone card node
  const clone = card.cloneNode(true) as HTMLElement;

  // Ensure top-level clone is fully opaque, visible and properly styled
  clone.id = 'pdf-export-active-card';
  clone.style.position = 'relative';
  clone.style.top = '0px';
  clone.style.left = '0px';
  clone.style.margin = '0 auto';
  clone.style.transform = 'none';
  clone.style.width = `${customWidth}px`;
  clone.style.minWidth = `${customWidth}px`;
  clone.style.maxWidth = `${customWidth}px`;
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#1E293B';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.display = 'block';

  // Staging wrapper attached to document.body so browser performs natural layout
  const wrapper = document.createElement('div');
  wrapper.id = 'export-staging-container';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0px';
  wrapper.style.left = '0px';
  wrapper.style.width = `${customWidth}px`;
  wrapper.style.height = 'auto';
  wrapper.style.zIndex = '9999999';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.opacity = '1';
  wrapper.style.visibility = 'visible';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.overflow = 'visible';
  wrapper.dir = 'rtl';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Ensure images in clone are loaded
  const images = Array.from(wrapper.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  // Short delay for layout settle
  await new Promise((res) => setTimeout(res, 200));

  const targetWidth = customWidth;
  const targetHeight = Math.max(clone.offsetHeight, clone.scrollHeight, 1050);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Remove style tags containing @theme rules if present to prevent html2canvas parsing errors
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((s) => {
          if (s.textContent?.includes('@theme')) {
            s.remove();
          }
        });

        // Ensure Cairo font is explicitly available in clonedDoc
        const fontStyle = clonedDoc.createElement('style');
        fontStyle.textContent = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap'); * { font-family: "Cairo", system-ui, sans-serif !important; }`;
        clonedDoc.head.appendChild(fontStyle);
      },
    });
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }

  return canvas;
}
