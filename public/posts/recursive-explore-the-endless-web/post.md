---
coverImage: /posts/recursive-explore-the-endless-web/cover.jpg
date: "2012-12-04T08:37:41.000Z"
tags:
  - chrome
  - chrome crawler
  - crawler
  - download
  - extension
  - files
  - l-system
  - node
  - spider
  - typescript
  - visualise
  - web
  - website
title: Recursive - Explore the endless web
oldUrl: /html/recursive-explore-the-endless-web
openAIMikesBlogFileId: file-XirTT68MwLMiId5p3hCon7nv
---

Wow, well that took longer than expected! [44 days ago I blogged](/posts/tinkering-with-typescript/) that I had started work on a second version of my Chrome Crawler extension and have only just managed to get it to a state I was happy with enough to release it. To be fair I had been on [a trip to New York](/posts/new-york-new-york/) during that period so perhaps I can be excused. Having said that however I think the time has been well spent and am fairly proud of the result.

<!-- more -->

### TL;DR

Recursive is an experimental tool for visualising the world wide web. Given a URL it downloads the page search for links and then recursively downloads those. The information is then displayed in a node-based graph.

<!--more-->

### The Name

So what's this all about? Why is it called 'Recursive', why not 'Chrome Crawler 2'?

Although I would like to have called the spiritual successor to ['Chrome Crawler'](/posts/chrome-crawler-a-web-crawler-written-in-javascript/), 'Chrome Crawler 2' Chrome's [branding guidelines](https://developers.google.com/chrome/web-store/branding) forbid using the Chrome name or logo (they brought this in since the launch of Chrome Crawler 1).

With that in mind I decided that rather bend Chrome Crawler's name and logo to fit the guidelines I would create a whole new logo, name and app. The app is a total rewrite from the previous iteration anyway so I thought it justified.

According to dictionary.com there is no definition for "Recursive" or "Recurse" but there is one for "Recursion":

> 2\. the application of a function to its own values to generate an infinite sequence of values.
> So a tool that downloads pages, follows the links on that page to download other pages seemed like a rather apt description of something that is "Recursive".

### Video

Before I go much further, I put together this little video demonstrating some of the extensions core functionality:

<iframe width="640" height="360" src="https://www.youtube.com/embed/oNdpoM5Vhsc" frameborder="0" allowfullscreen></iframe>

### Installing

Installing and upgrading is dead simple thanks to how Google Chrome's extension system works. Just head over to this link and hit install:

[https://chrome.google.com/webstore/detail/recursive/hbgbcmcmpiiciafmolmoapfgegbhbmcc](https://chrome.google.com/webstore/detail/recursive/hbgbcmcmpiiciafmolmoapfgegbhbmcc)

Then to launch it visit any website and hit the little icon in the Omnibox:

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_008.png "Screenshot_008")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_008.png)

### How it works

Recursive works by taking in a starting URL which it uses to download the page it points to:

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/03.jpg "03")](https://www.mikecann.blog/wp-content/uploads/2012/12/03.jpg)

Once that page is downloaded Recursive parses it looking for links and files. If it finds things it thinks are files then it records them against that URL. It then proceeds to visit all the links in turn, downloading the page then parsing the for yet more files and links.

This cycle continues until a certain "depth" is reached which is the maximum number of links away from the starting URL. You can set the maximum depth allowed in the settings:

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/04.jpg "04")](https://www.mikecann.blog/wp-content/uploads/2012/12/04.jpg)

One of the key improvements of Recursive over Chrome Crawler is the way it visualises the data as it is returned:

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/05.jpg "05")](https://www.mikecann.blog/wp-content/uploads/2012/12/05.jpg)

Every page is grouped by its domain and is represented by a circular "node".

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_013.png "Screenshot_013")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_013.png)

So for example "/posts/tinkering-with-typescript/" would be grouped under the "mikecann.blog" domain. Any other pages found while running that match this domain are added as little page icons inside the host node.

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_014.png "Screenshot_014")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_014.png)

Any files that are found on a given page are given an appropriate icon and added to that page's domain node.

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_015.png "Screenshot_015")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_015.png)

As Recursive downloads pages and follows links it records the path it takes. It then draws lines between the nodes that are linked:

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/06.jpg "06")](https://www.mikecann.blog/wp-content/uploads/2012/12/06.jpg)

### Interacting

Using the mouse wheel you can zoom in and out to get a better perspective. Click and drag to move about the recursive space. You can also run the app in fullscreen if you so desire.

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_017.png "Screenshot_017")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_017.png)

If you click on a node it tells Recursive to explore that node for one extra level depth.

Right clicking a node opens a menu that lets you either open all the pages contained in that node or view the files for that node.

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_019.png "Screenshot_019")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_019.png)

### Files

By using the context menu for a node you can checkout all the files that Recursive found for that node. The files are separated into various categories which you can toggle on or off:

[![](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_020.png "Screenshot_020")](https://www.mikecann.blog/wp-content/uploads/2012/12/Screenshot_020.png)

Then if you wish you can download all the files as a zip.

### More

If you would like to read more on recursive, then checkout these posts:
[catlist id=30 numberposts=100]
