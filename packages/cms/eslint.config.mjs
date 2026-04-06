import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals"),
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
