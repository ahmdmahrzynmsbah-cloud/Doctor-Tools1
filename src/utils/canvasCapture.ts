import { toPng } from 'html-to-image';

function dataUrlToCanvas(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  // Ensure web fonts are fully loaded
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

  // Explicitly reset positioning on clone so it sits cleanly at top-left
  clone.id = 'pdf-export-active-card';
  clone.style.position = 'relative';
  clone.style.top = '0px';
  clone.style.left = '0px';
  clone.style.right = 'auto';
  clone.style.bottom = 'auto';
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

  // Reset negative offsets on any child nodes inside clone
  const allNodes = Array.from(clone.querySelectorAll('*')) as HTMLElement[];
  allNodes.forEach((node) => {
    if (node.style) {
      if (node.style.position === 'fixed' || node.style.position === 'absolute') {
        const leftVal = parseInt(node.style.left, 10);
        const topVal = parseInt(node.style.top, 10);
        if (!isNaN(leftVal) && leftVal < -100) node.style.left = '0px';
        if (!isNaN(topVal) && topVal < -100) node.style.top = '0px';
      }
    }
  });

  // Staging wrapper attached to document.body at top-left
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

  // Delay for browser reflow
  await new Promise((res) => setTimeout(res, 200));

  const contentHeight = clone.offsetHeight || 1100;

  try {
    let dataUrl: string;
    try {
      dataUrl = await toPng(clone, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: customWidth,
        height: contentHeight,
        cacheBust: true,
        style: {
          margin: '0',
          transform: 'none',
          left: '0px',
          top: '0px',
          position: 'relative',
          opacity: '1',
          visibility: 'visible',
        },
      });
    } catch (primaryErr) {
      console.warn('toPng primary attempt failed, retrying without cacheBust...', primaryErr);
      dataUrl = await toPng(clone, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: customWidth,
        height: contentHeight,
        style: {
          margin: '0',
          transform: 'none',
          left: '0px',
          top: '0px',
          position: 'relative',
          opacity: '1',
          visibility: 'visible',
        },
      });
    }

    return await dataUrlToCanvas(dataUrl);
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }
}
