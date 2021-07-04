import {
  BlogLink,
  IdleKind,
  Member,
  MemberLinks,
  ScrapedResult,
  SiteName,
  idleKinds,
  siteNames,
  Magazine,
} from './typing';
import { Cacher, getCache } from './cache';
import {
  createPuppeteerCluster,
  scrape2,
  searchTweets,
  switchTwitterAccount,
} from './scraper';

import express from 'express';
import { getBlogLinks, getBlogLinks2 } from './scraper-utils/links/blog';
import { getMemberTable } from './scraper-utils/wiki';
import { getWikiLinks } from './scraper-utils/links/wiki';
import { launch } from 'puppeteer';
import { todaysMagazines } from './magazine';
import { TextLintEngine } from 'textlint';
import { join } from 'path';

import { createConnection, getConnection } from 'typeorm';
import { User } from './entity/User';
import { dbConfig } from './conf';

(async () => {
  const router = express.Router();
  const textLintEngine = new TextLintEngine();
  // const cluster = await createPuppeteerCluster();
  const connection = await createConnection(dbConfig);

  router.get('*', (req, res, next) => {
    console.log('request', req.path);

    // TODO
    // const cacher = new Cacher<ScrapedResult>(req.originalUrl);
    // const cache = await cacher.getCache();
    // if (cache) {
    //   res.send();
    // }
    next();
  });

  router.get('/login', async (req, res) => {
    console.log('hello');
    const result = await connection
      // .manager.find(User)
      .createQueryBuilder()
      .select('count(*)')
      .from(User, 'user')
      .getRawOne();
    console.log('result', result);
    res.send('hello');
  });

  router.get('/twitter', async (req, res) => {
    const kind = req.query.kind;
    if (!idleKinds.includes(kind as IdleKind)) {
      res.sendStatus(400).end();
      return;
    }
    const account = switchTwitterAccount(kind as IdleKind);
    const cacher = new Cacher<ScrapedResult>(account);
    const cache = await cacher.getCache();
    if (cache) {
      res.send(JSON.stringify(cache));
      return;
    }
    const value = await searchTweets(account);
    if (!value) {
      res.sendStatus(400).end();
      return;
    }
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 1);
    await cacher.saveCache(value as ScrapedResult, tomorrow);
    res.send(JSON.stringify(value));
    return;
  });

  router.get('/site', async (req, res) => {
    const query = req.query.kind;
    if (!siteNames.includes(query as SiteName)) {
      res.sendStatus(400).end();
      return;
    }
    const cacher = new Cacher<ScrapedResult>(query as string);
    const cache = await cacher.getCache();
    if (cache) {
      res.send(JSON.stringify(cache));
      return;
    }

    const value = await scrape2(query as SiteName);
    if (!value) {
      res.sendStatus(400).end();
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await cacher.saveCache(value as ScrapedResult, tomorrow);
    res.send(JSON.stringify(value));
    return;
  });

  router.get('/member-table', async (req, res) => {
    const kind = req.query.kind;
    if (!idleKinds.includes(kind as IdleKind)) {
      res.sendStatus(400).end();
      return;
    }
    const cacher = new Cacher<string[]>(`${kind}-member-table`);
    const cache = await cacher.getCache();
    if (cache) {
      res.send(JSON.stringify(cache));
      return;
    }
    const tables: string[] = await getMemberTable(kind as IdleKind);
    if (!tables) {
      res.sendStatus(400).end();
      return;
    }
    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate() + 10);
    await cacher.saveCache(tables, tommorow);
    res.send(JSON.stringify(tables));
    return;
  });

  router.get('/magazines', async (req, res) => {
    const date = req.query.date;
    let magazines: Magazine[][];
    if (date) {
      magazines = await todaysMagazines(date as string);
    } else {
      magazines = await todaysMagazines();
    }
    res.send(JSON.stringify(magazines));
    return;
  });

  router.get('/member-links', async (req, res) => {
    const kind = req.query.kind;
    if (!idleKinds.includes(kind as IdleKind)) {
      res.sendStatus(400).end();
      return;
    }
    const tommorow = new Date();
    tommorow.setMonth(tommorow.getMonth() + 6);
    const cache = await getCache<MemberLinks[]>(
      `${kind}-member-link`,
      tommorow,
      async () => {
        const linksForSites = await Promise.all([
          getBlogLinks2(kind as IdleKind),
          getWikiLinks(kind as IdleKind),
        ]);
        const links: { [key: string]: string[] } = {};
        linksForSites.forEach((site) => {
          site
            .filter((nameLink) => !!nameLink.link)
            .forEach((nameLink) => {
              const link = nameLink.link as string;
              const targetName = nameLink.name.replace(/\s+/, '');
              if (!links[targetName]) {
                links[targetName] = [link];
              } else {
                links[targetName].push(link);
              }
            });
        });
        return Object.entries(links)
          .map(([name, links]) => {
            return { name, links } as MemberLinks;
          })
          .sort((a, b) => {
            if (a < b) {
              return -1;
            } else if (a > b) {
              return 1;
            } else {
              return 0;
            }
          });
      }
    );
    if (cache) {
      res.send(JSON.stringify(cache));
      return;
    }
    res.sendStatus(500);
    return;
  });

  router.post('/textlint', async (req, res) => {
    const text = req.body?.text;
    if (!text) {
      res.sendStatus(400).end();
      return;
    }
    const result = await textLintEngine.executeOnText(text);
    res.send(result).end();
  });

  const app = express();
  app.use(express.json());
  app.use('/api/v1', router);

  if (process.env.STATIC_SERVE) {
    app.use(express.static(join(process.cwd(), 'frontend/dist/frontend')));
    app.get('*', (req, res) => {
      res.sendFile(join(process.cwd(), 'frontend/dist/frontend/index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  console.log(`server listen ${port}`);
  app.listen(port);
})();
