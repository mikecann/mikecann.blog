---
coverImage: ./header.jpg
date: '2019-04-12T14:51:40.000Z'
tags:
  - personal
  - website
  - blog
  - typescript
title: Migrating from Hexo to Gatsby
oldUrl: /blog/migrating-from-hexo-to-gatsby
---

Its been almost 2 years since I had to change anything with my blog but unfortunately 2 years is a long time in web development, and my blog needed some love.

<!-- more -->

# The Problem

So a few days ago I sat down to write a post on how we had just converted the entire backend of Markd over from Parse to GraphQL. I had recently upgraded my machine and thus I checked out the source from the [repo](https://github.com/mikecann/mikecann.blog) and started to build.

To my incredible frustration, no matter what I did, I couldn't get the project t build. I spent 2 hours wrestling with npm, hexo, gulp, grunt, saas, node-gyp and windows native compilation. Eventually I threw my hands in the air and decided enough was enough. Im just going to rebuild the site myself so I know exactly how everything works.

# Gatsby

I knew from my [last migration](http://mikecann.blog/blog/the-static-blog) that the key to a good performing blog was a staticly generated site. With that in mind I had heard much about [GatsbyJs](https://www.gatsbyjs.org/) the static site generator with a large following and so I decided to give it a shot.

One of the awesome things about Gatsby is the documentation is very thorough and there are plenty of third party tutorials so I found it pretty easy to do just about everything that I needed to do. 

I replicated pretty much everything from my old hexo-based blog and added a few other nice things.

I love it that my site is now all written in Typescript and React so I can very easily create custom components and things such as the Algolia powered search feature (see top right of this page).

# Conclusion

There are definitely going to be some minor things not working so if you see something please do contact me and let me know.
