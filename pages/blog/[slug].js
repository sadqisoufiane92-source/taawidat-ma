import Head from "next/head";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { getAllPosts, getPostBySlug } from "../../lib/posts";

const calculatorRoutes = {
  labor: { label: "حاسبة نزاعات الشغل", href: "/labor" },
  travail: { label: "حاسبة حوادث الشغل", href: "/travail" },
  "avp-victime": { label: "حاسبة حوادث السير — الضحية", href: "/avp-victime" },
  "avp-ayants-droit": { label: "حاسبة حوادث السير — ذوو الحقوق", href: "/avp-ayants-droit" },
};

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

export async function getStaticPaths() {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({
    params: {
      slug: post.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);

  return {
    props: {
      post,
    },
  };
}

export default function BlogPost({ post }) {
  const calculator = calculatorRoutes[post.calculator] || calculatorRoutes.labor;

  return (
    <>
      <Head>
        <title>{post.title} | taawidat.ma</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://taawidat.ma/blog/${post.slug}`} />
      </Head>

      <div className="post-page" dir="rtl">
        <SiteNav current="/blog" />

        <header className="post-hero">
          <span className="post-badge" style={categoryStyles[post.category]}>
            {post.category}
          </span>
          <h1>{post.title}</h1>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </header>

        <main className="post-main">
          <article
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <section className="post-cta">
            <div>
              <h2>احسب تعويضاتك الآن</h2>
              <p>{calculator.label}</p>
            </div>
            <Link href={calculator.href} legacyBehavior>
              <a>ابدأ الحساب</a>
            </Link>
          </section>
        </main>

        <footer className="post-footer">
          هذه الحاسبة للاستئناس فقط ولا تغني عن استشارة محامٍ مختص
        </footer>
      </div>

      <style jsx>{`
        .post-page {
          min-height: 100vh;
          background: oklch(0.975 0.008 90);
          color: oklch(0.18 0.04 155);
          font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
        }
        .post-hero {
          background: oklch(0.20 0.07 155);
          color: #fff;
          text-align: center;
          padding: 66px 24px 58px;
        }
        .post-badge {
          display: inline-flex;
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 18px;
        }
        .post-hero h1 {
          max-width: 820px;
          margin: 0 auto 16px;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.4;
          font-weight: 900;
        }
        .post-hero time {
          color: oklch(1 0 0 / 0.58);
          font-size: 14px;
          font-weight: 700;
        }
        .post-main {
          max-width: 820px;
          margin: 0 auto;
          padding: 54px 24px 76px;
        }
        .post-content {
          max-width: 720px;
          margin: 0 auto;
          direction: rtl;
          font-family: 'Cairo', 'Noto Kufi Arabic', system-ui, sans-serif;
          font-size: 17px;
          line-height: 2.0;
          color: oklch(0.24 0.04 155);
        }
        .post-content :global(h2) {
          color: oklch(0.26 0.09 155);
          font-weight: 900;
          margin: 2em 0 0.75em;
          line-height: 1.5;
        }
        .post-content :global(p) {
          margin: 0 0 1.4em;
        }
        .post-cta {
          max-width: 720px;
          margin: 44px auto 0;
          padding: 26px;
          background: oklch(0.20 0.07 155);
          color: #fff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .post-cta h2 {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 900;
        }
        .post-cta p {
          margin: 0;
          color: oklch(1 0 0 / 0.64);
          font-size: 14px;
        }
        .post-cta a {
          flex-shrink: 0;
          background: oklch(0.72 0.12 75);
          color: oklch(0.20 0.07 155);
          text-decoration: none;
          border-radius: 10px;
          padding: 11px 18px;
          font-size: 14px;
          font-weight: 900;
        }
        .post-footer {
          background: oklch(0.20 0.07 155);
          color: oklch(1 0 0 / 0.48);
          padding: 24px;
          text-align: center;
          font-size: 13px;
        }
        @media (max-width: 700px) {
          .post-main {
            padding: 40px 18px 64px;
          }
          .post-hero {
            padding: 52px 20px 46px;
          }
          .post-cta {
            align-items: stretch;
            flex-direction: column;
          }
          .post-cta a {
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
