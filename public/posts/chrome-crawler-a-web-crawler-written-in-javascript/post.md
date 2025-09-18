---
coverImage: /images/fallback-post-header.png
date: "2010-12-06T18:28:57.000Z"
tags:
  - chrome
  - crawl
  - download
  - extension
  - files
  - google
  - options
  - project
  - simple
  - spider
title: Chrome Crawler - A web-crawler written in Javascript
oldUrl: /chrome-crawler/chrome-crawler-a-web-crawler-written-in-javascript
---

[![](https://www.mikecann.blog/wp-content/uploads/2010/12/700.jpg "700")](https://www.mikecann.blog/wp-content/uploads/2010/12/700.jpg)

**EDIT: I now have a newer, better version of this called "[Recursive](/posts/recursive/)"**

Depending on your level of geekness you may or may not enjoy this one.

<!-- more -->

I proudly present [Chrome Crawler](https://chrome.google.com/extensions/detail/amjiobljggbfblhmiadbhpjbjakbkldd), my latest Google Chrome extension:

[![](https://www.mikecann.blog/wp-content/uploads/2010/12/Shot_002.png "Shot_002")](https://www.mikecann.blog/wp-content/uploads/2010/12/Shot_002.png)

The idea is simple really. You just give it a URL, it then goes off and finds all the links on that page then follows them to more pages then gets all the links and follows them and so on and so on.

Along the way it checks each page to see if there are any 'interesting' files linked there, if it finds an interesting link it will flag it for you so you can check it out.

Theres an options page that lets you customise the way it all works:

[![](https://www.mikecann.blog/wp-content/uploads/2010/12/Shot_004.png "Shot_004")](https://www.mikecann.blog/wp-content/uploads/2010/12/Shot_004.png)

If you are still confused check out the video below:

<iframe width="100%" height="400" src="https://www.youtube.com/embed/ceeQEMTSD0I" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

So why did I make this? Well to be frank, I made it mostly "just 'cause I can"!

Also having learned from my last Chrome Extension project [PostToTumblr](/posts/my-first-chrome-extension-post-to-tumblr/) I realised the Chrome API allowed you to do some things that you wouldn't normally be allowed to do on a website (nameley the [Cross-Origin XHR](https://code.google.com/chrome/extensions/xhr.html)) and I wanted to do something to take advantage of it.

It didnt take me long to knock out this project, one lazy Saturday for the majority of the code and today for a quick fix or two and to write this post and make the video. As such I expect there to be many bugs and problems so if you encounter one drop me an email (my address is found in the options page).

Oh finally, I wouldnt try using this on a google page as you will likely end up seeing this quite often:

[![](https://www.mikecann.blog/wp-content/uploads/2010/12/Shot_003.png "Shot_003")](https://www.mikecann.blog/wp-content/uploads/2010/12/Shot_003.png)

Anyways you can grab it over on the [Chrome extensions gallery here](https://chrome.google.com/extensions/detail/amjiobljggbfblhmiadbhpjbjakbkldd). If you enjoy it please leave me a review / comment, much love!
