import html2canvas from 'html2canvas';

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
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

  // Deep clone node
  const clone = card.cloneNode(true) as HTMLElement;

  // Copy computed styles from original DOM elements onto clone so it renders independently of external CSS rules
  const sourceNodes = [card, ...Array.from(card.querySelectorAll('*'))] as HTMLElement[];
  const targetNodes = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];

  for (let i = 0; i < sourceNodes.length; i++) {
    const s = sourceNodes[i];
    const t = targetNodes[i];
    if (!s || !t) continue;

    const computed = window.getComputedStyle(s);
    for (let j = 0; j < computed.length; j++) {
      const prop = computed[j];
      if (prop.startsWith('--')) continue; // skip CSS custom variables that confuse html2canvas
      const val = computed.getPropertyValue(prop);
      if (val && val !== 'initial' && val !== 'unset') {
        try {
          t.style.setProperty(prop, val, computed.getPropertyPriority(prop));
        } catch (e) {
          // ignore invalid properties
        }
      }
    }
  }

  // Ensure top-level clone is fully opaque and visible
  clone.id = 'pdf-export-active-card';
  clone.style.position = 'static';
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

  // Staging wrapper attached to document.body
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
  await new Promise((res) => setTimeout(res, 100));

  const targetWidth = customWidth;
  const targetHeight = clone.offsetHeight || 1100;

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
        // Remove style elements from clonedDoc so html2canvas relies on inlined computed styles and never crashes on Tailwind v4 CSS
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((s) => s.remove());
      },
    });
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }

  return canvas;
}
