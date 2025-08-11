module.exports = {
  apps: [
    {
      name: "azure-site",
      script: "npm",
      args: "start",
      cwd: "/var/www/azure-site",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/azure-site-error.log",
      out_file: "/var/log/pm2/azure-site-out.log",
      log_file: "/var/log/pm2/azure-site-combined.log",
      time: true,
    },
  ],
}
