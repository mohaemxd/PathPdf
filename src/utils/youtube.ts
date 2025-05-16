export async function isYouTubeVideoAvailable(videoId: string, apiKey: string): Promise<boolean> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    const data = await response.json();
    if (!data.items || data.items.length === 0) return false;
    const status = data.items[0].status;
    // Check if video is public and not deleted/removed
    return status.privacyStatus === 'public' && !status.uploadStatus?.includes('rejected');
  } catch (e) {
    return false;
  }
} 