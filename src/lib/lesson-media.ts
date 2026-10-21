const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov)$/i;

export function normalizeLessonVideoUrl(value: string): string | null {
  let url: URL;
  try { url = new URL(value.trim()); } catch { return null; }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (VIDEO_EXTENSIONS.test(url.pathname)) return url.href;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (["youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be"].includes(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = host === "youtu.be" ? parts[0]
      : parts[0] === "watch" ? url.searchParams.get("v")
      : ["embed", "shorts"].includes(parts[0]) ? parts[1] : null;
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (["vimeo.com", "player.vimeo.com"].includes(host)) {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = host === "player.vimeo.com" && parts[0] === "video" ? parts[1] : parts[0];
    if (!id || !/^\d+$/.test(id)) return null;
    const player = new URL(`https://player.vimeo.com/video/${id}`);
    const privacyHash = url.searchParams.get("h") || (host === "vimeo.com" ? parts[1] : null);
    if (privacyHash && /^[\da-f]+$/i.test(privacyHash)) player.searchParams.set("h", privacyHash);
    return player.href;
  }
  return null;
}

export function isDirectLessonVideo(value: string): boolean {
  try { return VIDEO_EXTENSIONS.test(new URL(value).pathname); } catch { return false; }
}
