import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    seed: "node  dist/prisma/seed.js",
  }
});



