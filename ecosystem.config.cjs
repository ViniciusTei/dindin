module.exports = {
  apps: [
    {
      name: "financeiro",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        // Ajuste no servidor:
        // DATABASE_URL: "postgres://...",
        // SESSION_SECRET: "...",
      },
    },
  ],
};
