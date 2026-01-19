import { Feed } from 'feed';
import { readdir, readFile, writeFile } from 'fs/promises';
import fm from 'front-matter';
import path from 'path';

const pagesDir = './app/pages/';

async function generateRss() {
  const files = await readdir(pagesDir);

  const mdFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === '.md',
  );

  const feed = new Feed({
    title: 'Tynan DeBold',
    description: 'Random ramblings.',
    id: 'https://tynandebold.com/',
    link: 'https://tynandebold.com/',
    language: 'en',
    image: 'https://tynandebold.com/assets/dev/favicon.ico',
    favicon: 'https://tynandebold.com/assets/dev/favicon.ico',
    copyright: '© Tynan DeBold 2010-2026',
    feedLinks: {
      json: 'https://tynandebold.com/json',
      atom: 'https://tynandebold.com/atom',
    },
    author: {
      name: 'Tynan DeBold',
      link: 'https://tynandebold.com/',
    },
  });

  await Promise.all(
    mdFiles.map(async (post) => {
      const data = await readFile(`${pagesDir}${post}`, 'utf8');
      const content = fm(data);

      feed.addItem({
        title: content.attributes.title,
        id: content.attributes.url || '',
        link: content.attributes.url || '',
        description: content.attributes.description || '',
        content: content.body,
        author: [
          {
            name: 'Tynan DeBold',
          },
        ],
        date: new Date(content.attributes.parseDate),
      });
    }),
  );

  await writeFile('./build/feeds/main.xml', feed.atom1());
  console.log('The atom file has been saved.');

  await writeFile('./build/feeds/main.json', feed.json1());
  console.log('The json file has been saved.');
}

generateRss().catch((err) => {
  console.error('Error generating RSS:', err);
  process.exit(1);
});
