import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  // schema was previously pointing to ./src/schema/schemas.ts but our schemas live under ./src/entity
  schema: './src/db/schemas.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:monitor.db',
  },
} satisfies Config;





