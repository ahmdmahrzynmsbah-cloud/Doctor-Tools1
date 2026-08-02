import html2canvas from 'html2canvas';

let dummyCtx: CanvasRenderingContext2D | null = null;

function getDummyCtx(): CanvasRenderingContext2D | null {
  if (!dummyCtx && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    dummyCtx = canvas.getContext('2d');
  }
  return dummyCtx;
}

/**
 * Converts modern CSS color syntax (e.g. oklch, color(srgb...)) into standard hex/rgba
 * strings using the browser's native canvas color evaluation engine.
 */
export function convertOklchToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  if (!colorStr.includes('oklch') && !colorStr.includes('color(')) return colorStr;

  const ctx = getDummyCtx();
  if (!ctx) return colorStr;

  return colorStr.replace(/(oklch\([^)]+\)|color\([^)]+\))/gi, (match) => {
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = match;
      const converted = ctx.fillStyle;
      if (converted) {
        return converted;
      }
    } catch (e) {
      // ignore parsing errors
    }
    return match;
  });
}

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

      let val = computed.getPropertyValue(prop);
      if (val && val !== 'initial' && val !== 'unset') {
        val = convertOklchToRgb(val);
        try {
          t.style.setProperty(prop, val, computed.getPropertyPriority(prop));
        } catch (e) {
          // ignore invalid properties
        }
      }
    }

    // Explicitly guarantee essential visual properties
    t.style.color = convertOklchToRgb(computed.color);
    t.style.backgroundColor = convertOklchToRgb(computed.backgroundColor);
    t.style.borderColor = convertOklchToRgb(computed.borderColor);
    t.style.opacity = computed.opacity || '1';
    t.style.visibility = computed.visibility || 'visible';

    const tagName = s.tagName.toLowerCase();
    if (tagName === 'svg' || s.parentElement?.tagName.toLowerCase() === 'svg') {
      t.style.fill = convertOklchToRgb(computed.fill);
      t.style.stroke = convertOklchToRgb(computed.stroke);
    }
  }

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
  await new Promise((res) => setTimeout(res, 120));

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
        // Remove style elements that contain tailwind v4 @theme/@import rules to prevent html2canvas crash
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((s) => {
          if (
            s.textContent?.includes('tailwindcss') ||
            s.textContent?.includes('@theme') ||
            s.getAttribute('href')?.includes('tailwind')
          ) {
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
