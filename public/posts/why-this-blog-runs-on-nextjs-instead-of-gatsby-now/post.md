---
coverImage: ./header.jpg
date: '2021-01-29T07:31:40.000Z'
tags:
  - typescript
  - blog
  - performance
title: Why This Blog Runs on NextJS Instead of Gatsby Now
---

Its no secret that im a bit of a tinker'er and this blog seems to bear the brunt of my experiments.

<!-- more -->

# TLDR;

This site now uses [NextJS](https://nextjs.org/) hosted on [Vercel](https://vercel.com/).

# History

This blog started [way back in feb 2003](https://mikecann.blog/posts/snakez-2003) with some simple flash experiments. Back then it was itself a flash site (they all were at the time!). Over the years however it went through many iterations. 

Some time in 2006 it became a Wordpress site, which it stayed for quite some time. I never was happy with the performance on Wordpress however so [in 2017](https://mikecann.blog/posts/the-static-blog) I decided to move the blog to Hexo a static site generator. This allowed the site to be super fast because all the posts and pages were pre-rendered as simple HTML pages during build time then served from the AWS CDN close to the user.

Although I was happy with the performance I wasn't happy with the development process with Hexo, it felt very messy and archaic using bower for dependency management. It also took ages to build the blog which by that point has amassed 14 years of posts.

So [in 2019](https://mikecann.blog/posts/migrating-from-hexo-to-gatsby) I moved from Hexo to the popular Gatsby static site generator. This was definitely more modern and was highly configurable however I personally am not a fan of using GraphQL for accessing assets locally, it all just felt very complicated. It also took a long time to build everything.

# Now

So now enter NextJS. This is a very "in" framework at the moment that allows you to write your "app" in React but have parts of it rendered server-side and parts of it run locally in the browser. 

"But, but, Mike!" I hear you cry "server side rendering, wont that be like going back to the slow-old-days of wordpress where everything has to go to a central server before being rendered and delivered to the client?". Ah you see I thought that too that I discovered that the creators of NextJS, Vercel, have a cloud offering that solves that.

Vercel cloud uses "edge" servers to render the page then deliver it to the client. These "edge" server run very close to the client requesting the page and thus like a CDN they are able to load, render and deliver very quickly to the client. I dont think it can ever be quite as fast as a CDN but its pretty indistinguishable from what I can tell.

# Result

So the result is I now have a blisteringly fast blog that is a joy to develop in and builds quickly!

Hopefully I dont need to move again for a long time, but then again I think I said that last time :P
