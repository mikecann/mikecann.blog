const fs = require("fs");
const { join } = require("path");
const matter = require("gray-matter");

const postsDirectory = join(process.cwd(), "public/posts");

module.exports = {
  // Turbopack configuration (optional)
  turbopack: {
    // Add any Turbopack-specific configuration here if needed
    // For example:
    // moduleIds: 'named',
    // treeShaking: true,
  },

  async redirects() {
    const redirects = [];

    for (let slug of fs.readdirSync(postsDirectory)) {
      const postDir = join(postsDirectory, slug);
      const absPostPath = join(postDir, `post.md`);
      const fileContents = fs.readFileSync(absPostPath, "utf8");

      const { data, content } = matter(fileContents);

      if (!data.oldUrl) continue;

      redirects.push({
        source: data.oldUrl,
        destination: `/posts/${slug}`,
        permanent: true,
      });
    }

    return redirects;
  },

  async rewrites() {
    return [
      {
        source: "/wp-content/:splat*",
        destination: "http://d18l99bmg6trdn.cloudfront.net/wp-content/:splat*",
      },
    ];
  },
};
