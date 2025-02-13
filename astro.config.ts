import { defineConfig } from 'astro/config'
// Adapter
// if you want deploy on vercel
import vercel from '@astrojs/vercel/serverless'
// ---
// if you want deploy locally
// import node from '@astrojs/node'
// Integrations
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import icon from 'astro-icon'
// Markdown
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import { remarkAlert } from 'remark-github-blockquote-alert'
import remarkMath from 'remark-math'
import remarkUnwrapImages from 'remark-unwrap-images'
import { siteConfig } from './src/site.config.ts'
import { addCopyButton, addLanguage } from './src/utils/shiki.ts'
import { remarkGithubCards, remarkReadingTime, remarkArxivCards } from './src/utils/remarkParser.ts'


// https://astro.build/config
export default defineConfig({
  // Top-Level Options
  site: siteConfig.site,
  // base: '/docs',
  trailingSlash: 'never',
  output: 'server',
  // if you want deploy on vercel
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  // ---
  // if you want deploy locally
  // adapter: node({
  //   mode: 'standalone'
  // }),
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    sitemap(),
    mdx(),
    icon(),
    (await import('@playform/compress')).default({
      SVG: false,
      Exclude: ['index.*.js']
    })
  ],
  // root: './my-project-directory',

  // Prefetch Options
  prefetch: true,
  // Server Options
  server: {
    host: true
  },
  // Markdown Options
  markdown: {
    remarkPlugins: [
      remarkUnwrapImages,
      remarkMath,
      remarkReadingTime,
      remarkAlert,
      remarkGithubCards,
      remarkArxivCards
    ],
    rehypePlugins: [
      [rehypeKatex, {}],
      [
        rehypeExternalLinks,
        {
          ...(siteConfig.externalLinkArrow && { content: { type: 'text', value: ' ↗' } }),
          target: '_blank',
          rel: ['nofollow, noopener, noreferrer']
        }
      ]
    ],
    remarkRehype: {
      footnoteLabelProperties: {
        className: ['']
      }
    },
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light'
      },
      transformers: [addLanguage(), addCopyButton(2000)]
    }
  }
})
