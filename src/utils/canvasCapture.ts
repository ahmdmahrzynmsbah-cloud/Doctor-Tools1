import html2canvas from 'html2canvas';

export async function captureElementToCanvas(element: HTMLElement, customWidth?: number): Promise<HTMLCanvasElement> {
  // Ensure fonts are loaded
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Deep clone node
  const clone = element.cloneNode(true) as HTMLElement;

  // Copy computed styles from original DOM elements onto clone so it renders independently of Tailwind stylesheet
  const sourceNodes = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];
  const targetNodes = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];

  for (let i = 0; i < sourceNodes.length; i++) {
    const s = sourceNodes[i];
    const t = targetNodes[i];
    if (!s || !t) continue;

    const computed = window.getComputedStyle(s);
    for (let j = 0; j < computed.length; j++) {
      const prop = computed[j];
      if (prop.startsWith('--')) continue; // skip custom variables that confuse html2canvas
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

  const targetWidth = customWidth || element.offsetWidth || 850;

  // Explicitly set clone layout overrides
  clone.style.position = 'static';
  clone.style.margin = '0 auto';
  clone.style.transform = 'none';
  clone.style.width = `${targetWidth}px`;
  clone.style.minWidth = `${targetWidth}px`;
  clone.style.maxWidth = `${targetWidth}px`;
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = '#ffffff';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';

  // Staging container
  const wrapper = document.createElement('div');
  wrapper.id = 'html2canvas-staging-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0px';
  wrapper.style.left = '0px';
  wrapper.style.width = `${targetWidth}px`;
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.zIndex = '999999';
  wrapper.style.opacity = '1';
  wrapper.style.visibility = 'visible';
  wrapper.style.pointerEvents = 'none';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Ensure images are fully loaded inside the staging clone
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

  await new Promise((resolve) => setTimeout(resolve, 100));

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
        // Remove all stylesheet/style nodes from clonedDoc so html2canvas relies on inlined computed styles and never crashes on Tailwind v4 CSS
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
