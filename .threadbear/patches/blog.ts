// Threadbear patch (Threadbear's docs/protocol.md, "Patches"): the blog a click away, and its post
// checks run by themselves after a turn that changed a post, taking about a second. The agent hears
// about an error from the hook, so there's no button to press.
export default {
  icon: "text.book.closed",
  actions: [
    { title: "Blog", icon: "safari", url: "https://mikecann.blog/" },
    {
      title: "Sentry",
      icon: "exclamationmark.triangle",
      url: "https://mikec.sentry.io/issues/?project=4512336957800448",
    },
  ],
  hooks: [
    {
      title: "Validate posts",
      on: "turn.end",
      run: "setopt pipefail; bun run validatePosts 2>&1 | tail -5",
      edited: "public/posts/**",
      tell: "failures",
    },
  ],
};
