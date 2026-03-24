import argon2 from 'argon2';
import { env } from '../app/lib/env.server.js';

(async () => {
  try {
    const hash = await argon2.hash('password123', { salt: Buffer.from(env.SESSION_SECRET) });
    console.log(hash);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
