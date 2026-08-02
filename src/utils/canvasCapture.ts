import html2canvas from 'html2canvas';

export async function captureElementToCanvas(element: HTMLElement, customWidth = 850): Promise<HTMLCanvasElement> {
  // 1. Locate the target invoice card
  const card = (element.querySelector('#invoice-card') as HTMLElement) ||
               (element.querySelector('#pdf-export-card') as HTMLElement) ||
               (element.id === 'invoice-card' ? element : null) ||
               (element.firstElementChild as HTMLElement) ||
               element;

  const targetWidth = customWidth || card.offsetWidth || 850;

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

  // Check if element is currently mounted and visible in document
  const isElementInDoc = document.body.contains(card) && card.offsetWidth > 0;

  let captureTarget = card;
  let wrapper: HTMLDivElement | null = null;

  if (!isElementInDoc) {
    wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0px';
    wrapper.style.left = '0px';
    wrapper.style.width = `${targetWidth}px`;
    wrapper.style.zIndex = '-99999';
    wrapper.style.opacity = '1';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.backgroundColor = '#ffffff';

    const clone = card.cloneNode(true) as HTMLElement;
    clone.style.width = `${targetWidth}px`;
    clone.style.margin = '0';
    clone.style.visibility = 'visible';
    clone.style.display = 'block';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    captureTarget = clone;
    await new Promise((res) => setTimeout(res, 150));
  }

  try {
    const canvas = await html2canvas(captureTarget, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: targetWidth,
      windowWidth: targetWidth,
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.querySelector('#invoice-card') as HTMLElement || clonedDoc.body.firstElementChild as HTMLElement;
        if (clonedCard) {
          clonedCard.style.width = `${targetWidth}px`;
          clonedCard.style.maxWidth = 'none';
          clonedCard.style.margin = '0';
          clonedCard.style.transform = 'none';
        }
      },
    });

    return canvas;
  } finally {
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}

