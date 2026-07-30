import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    // Generated files (payload generate:types / generate:importmap)
    ignores: ["src/payload-types.ts", "src/app/(payload)/admin/importMap.js"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Theme components use <a> for CMS-driven nav links (URLs come from DB,
      // not known at compile time). next/link is only useful for client-side
      // transitions which we don't need in server components.
      "@next/next/no-html-link-for-pages": "off",
      // Theme components use <img> for CMS media since the image URLs may be
      // external (Unsplash, customer CDN). next/image requires explicit
      // loader config for external domains.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
