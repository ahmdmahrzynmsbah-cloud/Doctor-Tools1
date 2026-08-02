import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

function copyComputedStyles(src: HTMLElement, dst: HTMLElement) {
  try {
    const computed = window.getComputedStyle(src);
    if (!computed) return;

    if (computed.color) dst.style.color = computed.color;
    if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
      dst.style.backgroundColor = computed.backgroundColor;
    } else {
      dst.style.backgroundColor = '#ffffff';
    }

    if (computed.borderColor) dst.style.borderColor = computed.borderColor;
    if (computed.borderTopColor) dst.style.borderTopColor = computed.borderTopColor;
    if (computed.borderRightColor) dst.style.borderRightColor = computed.borderRightColor;
    if (computed.borderBottomColor) dst.style.borderBottomColor = computed.borderBottomColor;
    if (computed.borderLeftColor) dst.style.borderLeftColor = computed.borderLeftColor;

    if (computed.fontFamily) dst.style.fontFamily = computed.fontFamily;
    if (computed.fontSize) dst.style.fontSize = computed.fontSize;
    if (computed.fontWeight) dst.style.fontWeight = computed.fontWeight;
    if (computed.lineHeight) dst.style.lineHeight = computed.lineHeight;
    if (computed.textAlign) dst.style.textAlign = computed.textAlign;

    if (computed.borderRadius) dst.style.borderRadius = computed.borderRadius;
    if (computed.padding) dst.style.padding = computed.padding;
    if (computed.display) dst.style.display = computed.display;
    if (computed.flexDirection) dst.style.flexDirection = computed.flexDirection;
    if (computed.justifyContent) dst.style.justifyContent = computed.justifyContent;
    if (computed.alignItems) dst.style.alignItems = computed.alignItems;
    if (computed.gap) dst.style.gap = computed.gap;
  } catch (e) {
    // Ignore non-critical computed style failures
  }
}

function applyComputedStylesToTree(source: HTMLElement, target: HTMLElement) {
  copyComputedStyles(source, target);
  const sourceChildren = Array.from(source.querySelectorAll('*'));
  const targetChildren = Array.from(target.querySelectorAll('*'));

  for (let i = 0; i < sourceChildren.length; i++) {
    const srcEl = sourceChildren[i] as HTMLElement;
    const tgtEl = targetChildren[i] as HTMLElement;
    if (srcEl && tgtEl && srcEl.nodeType === Node.ELEMENT_NODE) {
      copyComputedStyles(srcEl, tgtEl);
    }
  }
}

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  // 1. Locate the target invoice card
  const card = (element.querySelector('#invoice-card') as HTMLElement) ||
               (element.querySelector('#pdf-export-card') as HTMLElement) ||
               (element.id === 'invoice-card' ? element : null) ||
               (element.firstElementChild as HTMLElement) ||
               element;

  const targetWidth = customWidth || card.offsetWidth || 850;
  const targetHeight = Math.max(card.offsetHeight, card.scrollHeight, 1150);

  // 2. Wait for fonts and images
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check skipped:', e);
    }
  }

  const images = Array.from(card.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  // Method 1: Use html-to-image toPng (Browser native SVG foreignObject renderer)
  try {
    const pngDataUrl = await toPng(card, {
      width: targetWidth,
      height: targetHeight,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
          return false;
        }
        return true;
      },
    });

    if (pngDataUrl && pngDataUrl.length > 1000) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = pngDataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || targetWidth * 2;
      canvas.height = img.naturalHeight || targetHeight * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        console.log('Canvas generated using toPng engine successfully');
        return canvas;
      }
    }
  } catch (err) {
    console.warn('toPng engine failed, switching to html2canvas computed style fallback:', err);
  }

  // Method 2: Fallback to html2canvas with computed inline styles
  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'fixed';
  cloneWrapper.style.top = '0px';
  cloneWrapper.style.left = '0px';
  cloneWrapper.style.width = `${targetWidth}px`;
  cloneWrapper.style.zIndex = '99999999';
  cloneWrapper.style.backgroundColor = '#ffffff';
  cloneWrapper.style.visibility = 'visible';
  cloneWrapper.style.opacity = '1';
  cloneWrapper.style.pointerEvents = 'none';

  const clonedCard = card.cloneNode(true) as HTMLElement;
  applyComputedStylesToTree(card, clonedCard);

  clonedCard.style.visibility = 'visible';
  clonedCard.style.opacity = '1';
  clonedCard.style.display = 'block';
  clonedCard.style.transform = 'none';
  clonedCard.style.margin = '0';
  clonedCard.style.width = `${targetWidth}px`;
  clonedCard.style.backgroundColor = '#ffffff';

  cloneWrapper.appendChild(clonedCard);
  document.body.appendChild(cloneWrapper);

  await new Promise((res) => setTimeout(res, 200));

  try {
    const canvas = await html2canvas(clonedCard, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: targetWidth,
      height: targetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });
    console.log('Canvas generated using html2canvas fallback successfully');
    return canvas;
  } finally {
    if (cloneWrapper.parentNode) {
      cloneWrapper.parentNode.removeChild(cloneWrapper);
    }
  }
}
