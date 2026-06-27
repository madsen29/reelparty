const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const IG_UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function ogTag(html, prop) {
  const m =
    html.match(new RegExp(`property="${prop}" content="([^"]+)"`, "i")) ||
    html.match(new RegExp(`name="${prop}" content="([^"]+)"`, "i"));
  return m ? decodeHtml(m[1]) : "";
}

function detectPlatform(url) {
  const yt = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) return { platform: "youtube", videoId: yt[1] };
  if (/tiktok\.com/.test(url)) {
    const tt = url.match(/\/video\/(\d+)/);
    return { platform: "tiktok", videoId: tt?.[1] || null };
  }
  const ig = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  if (ig) return { platform: "instagram", videoId: ig[1] };
  return null;
}

function ytThumb(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function defaultTitle(platform) {
  if (platform === "tiktok") return "TikTok video";
  if (platform === "instagram") return "Instagram Reel";
  return "YouTube Short";
}

function parseInstagramCreator(title) {
  const m = title.match(/^(.+?) on Instagram:/);
  return m ? m[1].trim() : "";
}

async function resolveUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA } });
    return res.url || url;
  } catch {
    return url;
  }
}

async function fetchOembed(endpoint, url) {
  const res = await fetch(`${endpoint}${encodeURIComponent(url)}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.error || data?.code) return null;
  return data;
}

async function scrapeOg(url, userAgent = UA) {
  const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": userAgent } });
  if (!res.ok) return null;
  const html = await res.text();
  const thumbnail = ogTag(html, "og:image") || ogTag(html, "twitter:image");
  if (!thumbnail) return null;
  const title = ogTag(html, "og:title") || ogTag(html, "twitter:title");
  return { title, thumbnail, creator: "" };
}

export async function fetchMeta(rawUrl) {
  const url = (rawUrl || "").trim();
  const det = detectPlatform(url);
  if (!det) return { title: "Video", creator: "", thumbnail: "" };

  const { platform, videoId } = det;

  if (platform === "youtube") {
    const oembed = await fetchOembed("https://www.youtube.com/oembed?url=", url);
    if (oembed) {
      return {
        title: oembed.title || defaultTitle(platform),
        creator: oembed.author_name || "",
        thumbnail: oembed.thumbnail_url || ytThumb(videoId),
      };
    }
    return { title: defaultTitle(platform), creator: "", thumbnail: ytThumb(videoId) };
  }

  if (platform === "tiktok") {
    const resolved = await resolveUrl(url);
    const oembed = await fetchOembed("https://www.tiktok.com/oembed?url=", resolved);
    if (oembed?.thumbnail_url) {
      return {
        title: oembed.title || defaultTitle(platform),
        creator: oembed.author_name || "",
        thumbnail: oembed.thumbnail_url,
      };
    }
    const og = await scrapeOg(resolved);
    if (og) {
      return {
        title: og.title || defaultTitle(platform),
        creator: og.creator,
        thumbnail: og.thumbnail,
      };
    }
    return { title: defaultTitle(platform), creator: "", thumbnail: "" };
  }

  if (platform === "instagram") {
    const og = await scrapeOg(url, IG_UA);
    if (og) {
      return {
        title: og.title || defaultTitle(platform),
        creator: parseInstagramCreator(og.title),
        thumbnail: og.thumbnail,
      };
    }
    return { title: defaultTitle(platform), creator: "", thumbnail: "" };
  }

  return { title: defaultTitle(platform), creator: "", thumbnail: "" };
}
