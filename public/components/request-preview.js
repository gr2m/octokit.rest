export function requestPreview({ token, owner, repo, issue_number, lock_reason }) {
  return `
    <section>
      <h3>Request</h3>
    <pre><code>PUT https://api.github.com/repos/${owner || "{owner}"}/${repo || "{repo}"}/issues/${issue_number || "{issue_number}"}/lock
Authorization: token ${token || ""}

{
  "lock_reason": "${lock_reason || ""}"
}
</code></pre>
    </section>
  `;
}


