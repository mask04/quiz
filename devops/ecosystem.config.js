module.exports = {
  apps: [{
    name: 'quiz-api',
    script: 'server.js',
    cwd: '/var/www/RP/quiz',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3046
    }
  }]
};
