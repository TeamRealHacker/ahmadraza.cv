/** Shrinks an uploaded photo to a compact data-URI before storing it.
 *  Browser-only — call from a client component. */
export function prepareImage(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve({ src: canvas.toDataURL("image/jpeg", 0.82), width: w, height: h });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
