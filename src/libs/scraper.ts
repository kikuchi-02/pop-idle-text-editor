import { Page } from 'puppeteer';
import { ScrapedResult, SiteName } from '../typing';
import {
  hinatazakaBlog,
  hinatazakaBlog2,
  hinatazakaKoshiki,
  hinatazakaKoshiki2,
  nogizakaBlog,
  nogizakaBlog2,
  nogizakaKoshiki,
  nogizakaKoshiki2,
  sakurazakaBlog,
  sakurazakaBlog2,
  sakurazakaKoshiki,
  sakurazakaKoshiki2,
} from './scraper-utils/sites';
import { formatDate } from './scraper-utils/utils';

const switchSite = (
  site: SiteName
): ((page: Page) => Promise<ScrapedResult>) => {
  switch (site) {
    case 'nogizaka-koshiki':
      return nogizakaKoshiki;
    case 'nogizaka-blog':
      return nogizakaBlog;
    case 'sakurazaka-koshiki':
      return sakurazakaKoshiki;
    case 'sakurazaka-blog':
      return sakurazakaBlog;
    case 'hinatazaka-koshiki':
      return hinatazakaKoshiki;
    case 'hinatazaka-blog':
      return hinatazakaBlog;
    default:
      throw Error(`not implemented type ${site}`);
  }
};

const switchSite2 = (site: SiteName): (() => Promise<ScrapedResult>) => {
  switch (site) {
    case 'nogizaka-koshiki':
      return nogizakaKoshiki2;
    case 'nogizaka-blog':
      return nogizakaBlog2;
    case 'sakurazaka-koshiki':
      return sakurazakaKoshiki2;
    case 'sakurazaka-blog':
      return sakurazakaBlog2;
    case 'hinatazaka-koshiki':
      return hinatazakaKoshiki2;
    case 'hinatazaka-blog':
      return hinatazakaBlog2;
    default:
      throw Error(`not implemented type ${site}`);
  }
};

export const scrape = async ({
  page,
  data: data,
}: {
  page: Page;
  data: { site: SiteName };
}): Promise<ScrapedResult> => {
  console.log(`start ${data.site}`);
  const scrapedResult = await switchSite(data.site)(page).catch((err) => {
    console.error(`got error while scraping: ${data.site}`);
    return { siteTitle: data.site } as ScrapedResult;
  });
  (scrapedResult.posts || []).forEach((post) => {
    if (post.date) {
      post.hDate = formatDate(post.date);
    }
  });
  console.log(`end ${data.site}`);
  return scrapedResult;
};

export const scrape2 = async (site: SiteName): Promise<ScrapedResult> => {
  console.log(`start ${site}`);
  const scrapedResult = await switchSite2(site)().catch((err) => {
    console.error(`got error while scraping: ${site}, ${err}`);
    return { siteTitle: site } as ScrapedResult;
  });
  (scrapedResult.posts || []).forEach((post) => {
    if (post.date) {
      post.hDate = formatDate(post.date);
    }
  });
  console.log(`end ${site}`);
  return scrapedResult;
};
