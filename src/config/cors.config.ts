export function configCors(nodeEnv: string) {
  const isProduction = nodeEnv === "production";
  const allowedOrigins = isProduction
    ? ["https://example.ru", "https://www.example.ru"]
    : ["http://localhost:3000"];

  return {
    origin: allowedOrigins,
    credentials: true
  };
}
