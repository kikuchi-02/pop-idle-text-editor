const { readFileSync } = require('fs');
const { join } = require('path');

const settingsStr = readFileSync(join(process.cwd(), 'env.json'), 'utf-8');
const settings = JSON.parse(settingsStr);

module.exports = {
  type: 'postgres',
  host: settings.DATABASE.HOST,
  port: settings.DATABASE.PORT,
  username: settings.DATABASE.USERNAME,
  password: settings.DATABASE.PASSWORD,
  database: settings.DATABASE.NAME,
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: true,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  timezone: 'Z',
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
