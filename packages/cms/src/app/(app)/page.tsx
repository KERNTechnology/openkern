import React from "react";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>OpenKERN</h1>
      <p>Your site is running. Visit <a href="/admin">/admin</a> to get started.</p>
    </main>
  );
}
