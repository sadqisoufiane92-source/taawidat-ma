const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const sanitizeHtml = require("sanitize-html");

const postsDirectory = path.join(process.cwd(), "posts");

function normalizeDate(date) {
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  return date;
}

function getPostFileNames() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((fileName) => fileName.endsWith(".md"));
}

function getAllPosts() {
  const posts = getPostFileNames().map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      title: matterResult.data.title,
      date: normalizeDate(matterResult.data.date),
      excerpt: matterResult.data.excerpt,
      category: matterResult.data.category,
      calculator: matterResult.data.calculator,
      slug: matterResult.data.slug,
    };
  });

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error("Post not found: " + slug);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const { remark } = await import("remark");
  const html = (await import("remark-html")).default;

  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(matterResult.content);

  const contentHtml = sanitizeHtml(processedContent.toString());

  return {
    ...matterResult.data,
    date: normalizeDate(matterResult.data.date),
    contentHtml,
  };
}

module.exports = {
  getAllPosts,
  getPostBySlug,
};
