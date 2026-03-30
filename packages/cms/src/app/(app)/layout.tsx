import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenKERN Site",
  description: "Built with OpenKERN — Payload CMS + Next.js on AWS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
