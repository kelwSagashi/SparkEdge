import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  // schema was previously pointing to ./src/schema/schemas.ts but our schemas live under ./src/entity
  schema: './src/entity/schemas.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
} satisfies Config;
