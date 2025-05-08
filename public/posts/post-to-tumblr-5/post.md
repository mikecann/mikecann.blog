---
coverImage: /posts/post-to-tumblr-5/cover.jpg
date: '2014-08-18T10:10:10.000Z'
tags:
  - chrome
  - extension
  - parse.com
  - typescript
title: Post To Tumblr 5
oldUrl: /post-to-tumbr/post-to-tumblr-5
openAIMikesBlogFileId: file-cjD1eoOVjQcP8ak76Bplafpl
---

Almost exactly [6 months ago I released Post To Tumblr 4](https://www.mikecann.blog/myprojects/post-to-tumbr/post-to-tumblr-v-4/) and today im proud to have pushed the 5th version of my popular Chrome Extension to the [Chrome app store](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah?hl=en).

<!-- more -->

About a week ago Tumblr decided to change its security model which meant that my 34,000 ish users were now stuck. Unfortunately to get PTT to work required an entire rewrite of the way I handled users and posting to tumblr. Under the pressure of from tons of emails from angry users every day I set to work restructuring it all.

Now with version 5 users must authenticate with my backend:

![screenshot_003](https://www.mikecann.blog/wp-content/uploads/2014/08/screenshot_003.png)

Then they can add one or more tumblr accounts to the PTT account:

![screenshot_001](https://www.mikecann.blog/wp-content/uploads/2014/08/screenshot_001.png)

Which then seamlessly integrates into the app:

![screenshot_010](https://www.mikecann.blog/wp-content/uploads/2014/08/screenshot_010.png)

The backend authenticates the tumblr accounts and stores the oauth access keys so that it can make calls to tumblr on the user's behalf in the future. Its a much simpler system than I had previously, and it allows for multiple tumblr accounts which has been requested many times in the past.

The backend is built upon parse.com's cloud service. Its pretty much a hosted node.js environment but I really like it because its really fast and easy to work with and has a very generous free tier :)

[![screenshot_011](https://www.mikecann.blog/wp-content/uploads/2014/08/screenshot_011-1024x572.png)](https://www.mikecann.blog/wp-content/uploads/2014/08/screenshot_011.png)

I wrote the entire backend using Typescript which compiles down to JS which runs on parse, so that means that the entirety, client and server of Post To Tumblr is written in Typescript. A great feeling and utility as it allowed me to share code between the client and server.

I have an almost complete Parse.com type definition file now, surprisingly it isnt actually available on DefinitelyTyped but when I get round to it ill upload it myself.

In addition to the backend changes I totally restructured most of the client to use requireJS for nice modular JS loading. Im much happier with the structure of the client as a result and it feel less like guesswork and global-variable-spaghetti!

I hope my users enjoy it!
