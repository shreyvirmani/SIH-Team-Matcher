// Lightweight GitHub verification for the optional "GitHub username" profile
// field (explicitly called out as future scope in the brief: "integrate
// GitHub profiles ... to verify skills directly from their repositories").
// This is intentionally shallow — just confirms the username is real and
// caches the public repo count — rather than trying to infer skills from
// repo languages, which would need a lot more API calls and rate-limit budget.

export interface GithubLookupResult {
  valid: boolean;
  publicRepos: number | null;
}

export async function lookupGithubUser(username: string): Promise<GithubLookupResult> {
  const clean = username.trim().replace(/^@/, "");
  if (!clean) return { valid: false, publicRepos: null };

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "sih-team-matcher" },
      // Unauthenticated GitHub API calls are capped at 60/hour per IP. Add a
      // GITHUB_TOKEN env var and an Authorization header here to raise that
      // to 5,000/hour for real production traffic.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { valid: false, publicRepos: null };
    const data = await res.json();
    return { valid: true, publicRepos: typeof data.public_repos === "number" ? data.public_repos : null };
  } catch {
    return { valid: false, publicRepos: null };
  }
}
