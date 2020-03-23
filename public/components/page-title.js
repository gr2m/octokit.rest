export function pageTitle(query) {
  if (query) {
    return `Search: "${query}"`;
  }

  return `octokit.rest`;
}
