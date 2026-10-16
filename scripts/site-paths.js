export function siteBase(env = process.env) {
  if (env.BASE_PATH !== undefined) return `/${env.BASE_PATH.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '') || '/';
  const [owner, repo] = (env.GITHUB_REPOSITORY || '').split('/');
  return repo && repo.toLowerCase() !== `${owner.toLowerCase()}.github.io` ? `/${repo}` : '/';
}
export function assetUrl(url, base) {
  if (!url.startsWith('/assets/')) return url;
  return `${base.replace(/\/$/, '')}${url}`;
}
