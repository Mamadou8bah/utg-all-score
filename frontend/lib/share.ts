export async function sharePage(title: string, url: string, text?: string): Promise<string | null> {
  try {
    if (navigator.share) {
      await navigator.share({ title, url, text });
      return null;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${title}\n${url}`);
      return "Link copied.";
    }
    return "Sharing is not supported on this device.";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    return "Unable to share. Please try again.";
  }
}
