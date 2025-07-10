---
coverImage: /images/fallback-post-header.png
date: '2009-07-03T19:57:55.000Z'
tags:
  - server
  - web
title: 'Panic over, nginx comes to the rescue'
oldUrl: /websites/panic-over-nginx-comes-to-the-rescue
---

A while back I changed my hosting over from the worse than dismal streamline.net over to the much better slicehost service. Slicehost offer alot more power by giving your own server with root access. All well and good if you are knowing what you are doing in Linux, i dont, so I struggled for some time getting Apache and php and all the rest running nice.

<!-- more -->

Well all was fine and dandy for a while but suddenly a month or so back I started having alot of drop-outs and poor service. After much pain and [forum posting](https://forum.slicehost.com/comments.php?DiscussionID=3629) I finally found out the route cause of the problem was that Apache was using too much memory and just bringing everything to a crawl on my 256meg slice. After much more pain I got the alternative nginx web server going, and touch wood everything seems to be running nice and smooth again, yey!

I would like to give a big thank you to this article which was invaluable: [https://www.mensk.com/webmaster-toolbox/perfect-ubuntu-hardy-nginx-mysql5-php5-wordpress/](https://www.mensk.com/webmaster-toolbox/perfect-ubuntu-hardy-nginx-mysql5-php5-wordpress/)
