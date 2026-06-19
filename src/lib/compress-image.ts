/** Shrinks large photos before upload so admin saves feel instant on slow links. */
export async function compressImageForUpload(
  file: File,
  opts?: { maxSide?: number; quality?: number; maxBytes?: number },
): Promise<File> {
  const maxSide = opts?.maxSide ?? 1920;
  const quality = opts?.quality ?? 0.82;
  const maxBytes = opts?.maxBytes ?? 500_000;

  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }
  if (file.size <= maxBytes) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > maxSide ? maxSide / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}
