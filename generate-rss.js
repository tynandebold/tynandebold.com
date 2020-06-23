const Feed = require('feed').Feed;
const fs = require('fs');
const fm = require('front-matter');
const path = require('path');

const pagesDir = './app/pages/';

fs.readdir(pagesDir, (err, files) => {
  if (err) throw err;

  const mdFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === '.md'
  );

  const feed = new Feed({
    title: 'Tynan DeBold',
    description: 'Random ramblings.',
    id: 'https://tynandebold.com/',
    link: 'https://tynandebold.com/',
    language: 'en',
    image: 'https://tynandebold.com/assets/dev/favicon.ico',
    favicon: 'https://tynandebold.com/assets/dev/favicon.ico',
    copyright: '© Tynan DeBold 2010-2020',
    feedLinks: {
      json: 'https://tynandebold.com/json',
      atom: 'https://tynandebold.com/atom',
    },
    author: {
      name: 'Tynan DeBold',
      link: 'https://tynandebold.com/',
    },
  });

  Promise.all(
    mdFiles.map((post) => {
      return new Promise((resolve, reject) => {
        fs.readFile(`${pagesDir}${post}`, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          } else {
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

            resolve();
          }
        });
      });
    })
  )
    .then(() => {
      fs.writeFile('./build/feeds/main.xml', feed.atom1(), (err) => {
        if (err) throw err;
        console.log('The atom file has been saved.');
      });

      fs.writeFile('./build/feeds/main.json', feed.json1(), (err) => {
        if (err) throw err;
        console.log('The json file has been saved.');
      });
    })
    .catch((err) => {
      console.log('err: ', err);
    });
});
