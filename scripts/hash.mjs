import argon2 from 'argon2';

(async () => {
  try {
    // Generate an argon2 hash with a random salt (recommended)
    const hash = await argon2.hash('password123');
    console.log(hash);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
