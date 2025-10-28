export function getFaviconUrl(websiteUrl: string) {
  const domain = new URL(websiteUrl).hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
}
