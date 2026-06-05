import "dotenv/config";

export const config = {
  jwtSecret:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error("JWT_SECRET is not set");
    })(),
  databaseUrl:
    process.env.DATABASE_URL ??
    (() => {
      throw new Error("DATABASE_URL is not set");
    })(),
  port: Number(process.env.PORT) || 3000,
};
