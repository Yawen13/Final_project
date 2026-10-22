// Hashtags actually used in post text, most used first.
export function hashtagsFrom(posts) {
  const counts = new Map();

  posts.forEach((post) => {
    const found = new Set((post.text || '').match(/#[\p{L}\p{N}_]+/gu) ?? []);
    found.forEach((tag) => {
      const key = tag.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
