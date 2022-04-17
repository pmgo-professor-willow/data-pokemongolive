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

const getPost = async (url: string) => {
  const res = await fetch(url);
  const xml = await res.text();

  const root = parse(xml);

  const defaultCoverImageUrl = root.querySelector('img.image__image')?.getAttribute('src');
  const youtubeVideoUrl = root.querySelector('.youtube-container iframe')?.getAttribute('src');

  let coverImageUrl = '';

  if (defaultCoverImageUrl) {
    coverImageUrl = defaultCoverImageUrl;
  } else if (youtubeVideoUrl) {
    const { 1: videoId } = youtubeVideoUrl.match(/www\.youtube\.com\/embed\/(.+)/)!;
    coverImageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } else {
    coverImageUrl = 'https://raw.githubusercontent.com/pmgo-professor-willow/data-pokemongolive/main/assets/default.jpeg';
  }

  return {
    coverImageUrl,
  };
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

    console.log(`Load post content ... (${title})`);

    const postContent = await getPost(link);

    if (title) {
      posts.push({
        title,
        link,
        date,
        coverImageUrl: postContent.coverImageUrl,
      });
    }
  }

  const filtereddPosts = posts.slice(0, amount);

  return filtereddPosts;
};

export {
  getPosts,
};
