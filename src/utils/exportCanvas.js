import html2canvas from 'html2canvas';

async function renderCanvas(nodeRef, state) {
  const node = nodeRef.current;
  if (!node) return null;
  return html2canvas(node, {
    scale: state.export.scale,
    width: state.size.width,
    height: state.size.height,
    backgroundColor: null,
    useCORS: true,
    onclone: (clonedDoc) => {
      // The live preview shrinks the frame with a CSS transform so it fits
      // on screen. Undo that in the clone so exports render at true resolution.
      const stage = clonedDoc.querySelector('.canvas-stage');
      if (stage) stage.style.transform = 'none';
    },
  });
}

export async function exportToImage(nodeRef, state) {
  const canvas = await renderCanvas(nodeRef, state);
  if (!canvas) return;

  const format = state.export.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = state.export.format === 'jpeg' ? state.export.quality : undefined;
  const dataUrl = canvas.toDataURL(format, quality);

  const link = document.createElement('a');
  const ext = state.export.format === 'jpeg' ? 'jpg' : 'png';
  link.download = `hatercent-graphic-${Date.now()}.${ext}`;
  link.href = dataUrl;
  link.click();
}

export async function copyToClipboard(nodeRef, state) {
  const canvas = await renderCanvas(nodeRef, state);
  if (!canvas) return;

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  }, state.export.format === 'jpeg' ? 'image/jpeg' : 'image/png', state.export.quality);
}
