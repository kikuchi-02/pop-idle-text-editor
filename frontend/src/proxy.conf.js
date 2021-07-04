const PROXY_CONFIG = [
  {
    context: ['/api/auth'],
    target: 'http://localhost:3000',
    secure: false,
  },
  {
    context: ['/api/v1'],
    target: 'http://localhost:3000',
    secure: false,
  },
  {
    context: ['/api/v2'],
    target: 'http://localhost:8000',
    secure: false,
  },
];

module.exports = PROXY_CONFIG;
