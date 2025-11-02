import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/schemas.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
} satisfies Config;
