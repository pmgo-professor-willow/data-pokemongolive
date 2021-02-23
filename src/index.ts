// Node modules.
import { mkdirp, writeFile } from 'fs-extra';
// Local modules.
import { getPosts } from './post';

const main = async () => {
  const outputPath = './artifacts';
  await mkdirp(outputPath);

  // Researches.
  try {
    const posts = await getPosts();
    await writeFile(`${outputPath}/posts.json`, JSON.stringify(posts, null, 2));
    await writeFile(`${outputPath}/posts.min.json`, JSON.stringify(posts));
  } catch (e) {
    console.error(e);
  }
};

main();
