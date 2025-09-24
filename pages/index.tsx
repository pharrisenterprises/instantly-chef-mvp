export default function IndexPage() {
  return (
    <main style={{
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Instantly Chef MVP
      </h1>
      <p style={{ marginTop: "1rem", fontSize: "1.25rem" }}>
        ✅ Fallback Page Router route is live.
      </p>
    </main>
  );
}
