---
coverImage: /posts/new-tab-chrome-experiments-a-new-chrome-extension/cover.jpg
date: '2016-06-27T23:50:30.000Z'
tags:
  - chrome
  - css
  - extension
  - html
  - javascript
  - programming
  - typescript
title: New Tab Chrome Experiments - A new Chrome Extension
oldUrl: /new-tab-chrome-experiments/new-tab-chrome-experiments-a-new-chrome-extension
---

I really enjoy making Chrome Extension, I love how fast it is to go from idea to implementation then availability on the store.

My latest extension is called "New Tab Chrome Experiments" was only conceived of on Sunday evening. I then spent yesterday coding it up and now its up and available to[download on the store](https://chrome.google.com/webstore/detail/new-tab-chrome-experiment/ooopblodejpcihjoaepffbkkhfeeofhp).

<!-- more -->

As the name implies its an extension that replaces the "New Tab" page in chrome. I have always been a fan of the [ChromeExperiments.com](https://www.google.com.au/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjDnJ24scnNAhUEVZQKHazWAToQFggdMAA&url=https%3A%2F%2Fwww.chromeexperiments.com%2F&usg=AFQjCNEaGiHNhKCyriGCz9F5SW4LI9ufZw&sig2=BRh2RfR6Xe8Cj4cSKWZKTw) website and thought wouldnt it be cool if you could view one of those experiments each time a new tab is opened.

![screenshot02](https://www.mikecann.blog/wp-content/uploads/2016/06/screenshot02.png)

The extension works by first downloading the entire catalog of Chrome Experiments from the site. At first I thought I was going to have to scrape but then I went digging through the network traffic of [ChromeExperiments.com](https://ChromeExperiments.com) and found that they are using an un-published but nice API: "https://chromeexperiments-dat.appspot.com/_ah/api/experiments/v1/experiments".

![screenshot01](https://www.mikecann.blog/wp-content/uploads/2016/06/screenshot01.png)

With that data I could then randomly pick one experiment and load its URL in an iFrame each time a new tab is opened. I also present a little info box on the left hand side which tells you about what experiment you are looking at and provides a link to its page and its author.

![screenshot03](https://www.mikecann.blog/wp-content/uploads/2016/06/screenshot03.png)

I wrote the whole thing in Typescript using React and various other libs. I open-sourced it incase you were interested: [https://github.com/mikecann/new-tab-chrome-experiments](https://github.com/mikecann/new-tab-chrome-experiments)

You can download the extension from the Chrome Webstore here: [https://chrome.google.com/webstore/detail/new-tab-chrome-experiment/ooopblodejpcihjoaepffbkkhfeeofhp](https://chrome.google.com/webstore/detail/new-tab-chrome-experiment/ooopblodejpcihjoaepffbkkhfeeofhp)

Anyways it was a fun little experiment, I hope people enjoy it as much as I do!
