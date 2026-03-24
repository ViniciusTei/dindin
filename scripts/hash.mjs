import argon2 from 'argon2';

(async () => {
  try {
    const hash = await argon2.hash('password123', { salt: Buffer.from('ix6JdAKb7zmXxt1Oz00XQZWAJ+xt2p5yyGRfTOq4T58=') });
    console.log(hash);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
