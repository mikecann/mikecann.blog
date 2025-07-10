---
coverImage: /posts/post-to-tumblr-5-9/cover.jpg
date: '2014-10-03T01:18:15.000Z'
tags:
  - image
  - post to tumblr
  - tumblr
  - upload
title: Post To Tumblr 5.9
oldUrl: /post-to-tumbr/post-to-tumblr-5-9
---

One thing that has always bothered me with Post To Tumblr ever since version 1.0, and I have finally fixed it in 5.9!

<!-- more -->

First I should explain how photo posting works in Post To Tumblr. Its pretty simple. First I take the URL of the image the user clicks on from Chrome, then send that URL to my server with some other information (such as formatting options) then I bundle all that up into an API call to Tumblr. Tumblr then takes that URL and downloads it, caching it to its own server returning a URL with the newly created post, I hand that back to the browser for the user to view and we are done.

Now the problem comes if Tumblr is unable to access that image. That could happen if the image is behind a password protected firewall such a GMail attachment or a private Facebook photo for example.

The solution is to upload the image bytes to Tumblr directly so that Tumblr doesn't have to go and try to download the image from a URL. The problem is that the Tumblr API is a NIGHTMARE. Im not kidding, I have struggled for years (off and on) to try to get this to work with no hope.

An idea came to me the other day however, why not just cache that image on my server temporarily then provide a URL that tumblr can definitely access and use to download the image. Well after an hour or two of hacking I have it working!

<iframe width="640" height="360" src="//www.youtube.com/embed/Fpn6MVzjqss?list=UU9-RJld8R0v5ywwBT8csdZA" frameborder="0" allowfullscreen></iframe>

Images are cached on my Parse.com backend and will be deleted after a certain period of time.

Im so happy to finally have this working. Now I have this in place I hope to get uploading from the desktop working soon!
