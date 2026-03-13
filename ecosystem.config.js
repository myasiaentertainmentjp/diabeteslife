module.exports = {
  apps: [
    {
      name: 'dlife-nextjs',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/diabeteslife',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
}
