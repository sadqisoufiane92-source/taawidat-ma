import Head from "next/head";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { getAllPosts } from "../../lib/posts";

const categoryStyles = {
  "نزاعات الشغل": {
    background: "oklch(0.95 0.04 155)",
    color: "oklch(0.36 0.12 155)",
  },
  "حوادث الشغل": {
    background: "oklch(0.95 0.05 35)",
    color: "oklch(0.40 0.12 35)",
  },
  "حوادث السير": {
    background: "oklch(0.94 0.04 290)",
    color: "oklch(0.36 0.12 290)",
  },
};

function formatDate(date) {
  return new Date(date).toLocaleDateString("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getStaticProps() {
  const posts = getAllPosts();

  return {
    props: {
      posts,
    },
  };
}

export default function BlogIndex({ posts }) {
  return (
    <>
      <Head>
        <title>دليلك القانوني | taawidat.ma</title>
        <meta
          name="description"
          content="مقالات قانونية حول التعويضات في المغرب — نزاعات الشغل، حوادث السير، وحوادث الشغل."
        />
      </Head>

      <div className="blog-page" dir="rtl">
        <SiteNav current="/blog" />

        <header className="blog-hero">
          <p className="blog-eyebrow">taawidat.ma</p>
          <h1>دليلك القانوني</h1>
          <p>مقالات قانونية لمساعدتك على فهم حقوقك وحساب تعويضاتك</p>
        </header>

        <main className="blog-main">
          <div className="blog-grid">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} legacyBehavior>
                <a className="blog-card">
                  <span className="blog-badge" style={categoryStyles[post.category]}>
                    {post.category}
                  </span>
                  <h2>{post.title}</h2>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </a>
              </Link>
            ))}
          </div>
        </main>

        <footer className="blog-footer">
          هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص
        </footer>
      </div>

      <style jsx>{`
        .blog-page {
          min-height: 100vh;
          background: oklch(0.975 0.008 90);
          color: oklch(0.18 0.04 155);
          font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
        }
        .blog-hero {
          background: oklch(0.20 0.07 155);
          color: #fff;
          text-align: center;
          padding: 72px 24px 64px;
        }
        .blog-eyebrow {
          color: oklch(0.72 0.12 75);
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 12px;
        }
        .blog-hero h1 {
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.25;
          margin: 0 0 16px;
          font-weight: 900;
        }
        .blog-hero p:last-child {
          max-width: 620px;
          margin: 0 auto;
          color: oklch(1 0 0 / 0.68);
          line-height: 1.9;
          font-size: 16px;
        }
        .blog-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 56px 24px 80px;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        .blog-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #fff;
          border: 1.5px solid oklch(0.91 0.02 155);
          border-radius: 20px;
          padding: 26px;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 2px 12px oklch(0.20 0.07 155 / 0.08);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          border-color: oklch(0.65 0.14 155);
          box-shadow: 0 16px 40px oklch(0.20 0.07 155 / 0.16);
        }
        .blog-badge {
          width: fit-content;
          border-radius: 7px;
          padding: 4px 11px;
          font-size: 12px;
          font-weight: 800;
        }
        .blog-card h2 {
          margin: 0;
          font-size: 21px;
          line-height: 1.55;
          font-weight: 900;
          color: oklch(0.20 0.07 155);
        }
        .blog-excerpt {
          margin: 0;
          color: oklch(0.45 0.04 155);
          line-height: 1.85;
          font-size: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        time {
          color: oklch(0.62 0.03 155);
          font-size: 13px;
          font-weight: 700;
          margin-top: auto;
        }
        .blog-footer {
          background: oklch(0.20 0.07 155);
          color: oklch(1 0 0 / 0.48);
          padding: 24px;
          text-align: center;
          font-size: 13px;
        }
        @media (max-width: 760px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-hero {
            padding: 56px 20px 48px;
          }
          .blog-main {
            padding: 40px 18px 64px;
          }
        }
      `}</style>
    </>
  );
}
