import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { Header } from "./globals/Header";
import { Footer } from "./globals/Footer";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.SERVER_URL || "",
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      ssl: { rejectUnauthorized: false },
    },
  }),

  collections: [Users, Media, Pages, Posts],
  globals: [Header, Footer, SiteSettings],

  secret: process.env.PAYLOAD_SECRET || "",
  sharp,

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  plugins: [
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          prefix: "media",
        },
      },
      bucket: process.env.S3_BUCKET || "",
      config: {
        region: process.env.S3_REGION || "eu-central-1",
        // When running on Lambda, credentials come from the IAM role automatically.
        // For local development, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.
      },
    }),
  ],
});
