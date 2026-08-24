module.exports = {
  apps: [{
    name: 'quiz-api',
    script: 'server.js',
    cwd: '/var/www/RP',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
