// Node modules.
import _ from 'lodash';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import urlJoin from 'url-join';
// Local modules.
import { hostUrl } from './utils';

interface Post {
  title: string;
  link: string;
  date: string;
  coverImageUrl: string;
}

const format = (rawText?: string) => {
  return rawText
    ? rawText.replace(/\n/g, '').trim()
    : '';
};


const getPosts = async (amount = 10, locale = 'zh_hant') => {
  const postUrl = urlJoin(hostUrl, `/${locale}/post/`);
  const res = await fetch(postUrl);
  const xml = await res.text();

  const root = parse(xml);
  // "2 * amount" means pair by pair.
  const bufferAmount = 5;
  const postItems = (root.querySelectorAll('.blogList__post') || [])
    .slice(0, 2 * (amount + bufferAmount));

  const posts: Post[] = [];

  console.log(postItems);
  
  for await (const postItem of postItems) {
    const title = format(postItem.querySelector('.blogList__post__content__title').rawText);
    const link = urlJoin(hostUrl, format(postItem.getAttribute('href')));
    const date = format(postItem.querySelector('.blogList__post__content__date').rawText);
    const coverImageUrl = format(postItem.querySelector('.image').getAttribute('src'));

    console.log(`Load post content ... (${title})`);

    if (title) {
      posts.push({
        title,
        link,
        date,
        coverImageUrl,
      });
    }
  }

  const filtereddPosts = posts.slice(0, amount);

  return filtereddPosts;
};

export {
  getPosts,
};
