module.exports = {
  apps: [
    {
      name: 'dlife-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/diabeteslife-nextjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/log/dlife-nextjs/error.log',
      out_file: '/var/log/dlife-nextjs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
