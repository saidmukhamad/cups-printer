module.exports = {
  apps: [
    {
      name: "printer",
      script: "server/index.ts",
      interpreter: "bun",
      cwd: __dirname,
      env: {
        PORT: 4000,
      },
    },
  ],
};
