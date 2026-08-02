import { toCanvas } from 'html-to-image';

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

  // Render using html-to-image which natively supports all CSS (like oklch, grid, flex) by using the browser's own rendering engine via SVG foreignObject.
  // We use `card` directly without appending clones to the body because html-to-image does all that internally and perfectly.
  const canvas = await toCanvas(card, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    width: customWidth,
    skipFonts: false, // Make sure fonts are processed
    style: {
      transform: 'none',
      width: `${customWidth}px`,
      minWidth: `${customWidth}px`,
      maxWidth: `${customWidth}px`,
      margin: '0',
    },
  });

  return canvas;
}
