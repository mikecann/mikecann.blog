---
coverImage: /images/fallback-post-header.png
date: "2010-04-13T21:44:56.000Z"
tags:
  - hosting
  - news
  - personal
  - plesk
  - webfusion
  - websites
  - wordpress
title: mikecann.blog moved.. again.. too!
oldUrl: /websites/mikecann-co-uk-moved-again-too
---

[![](https://www.mikecann.blog/wp-content/uploads/2010/04/ScreenHunter_01-Apr.-13-21.27.jpg "ScreenHunter_01 Apr. 13 21.27")](https://www.mikecann.blog/wp-content/uploads/2010/04/ScreenHunter_01-Apr.-13-21.27.jpg)[![](https://www.mikecann.blog/wp-content/uploads/2010/04/ScreenHunter_02-Apr.-13-21.29.jpg "ScreenHunter_02 Apr. 13 21.29")](https://www.mikecann.blog/wp-content/uploads/2010/04/ScreenHunter_02-Apr.-13-21.29.jpg)

Well as my previous post was about how I had moved my personal presence I thought I would mention the move of my virtual presence too.

<!-- more -->

For a while I have been hosting my sites on Slicehost, and things having been going okay. Slicehost however is a basic VPS that simply gives you root access and then you are expected to know what to do next. I spent a long time setting it up in the beginning following various tutorials. I learnt alot of Linux along the way but unfortunately I dont think im ever going to have the time to learn enough to maintain this box, especially now that I have 7 domains of my own and am hosting two by other people.

So I recently started looking for a better solution. Thats when my partner in crime [olip.co.u](https://olip.co.uk)k recommendation that I checkout Web Fusion, so I did and was mightily impressed. For a very similar price to Slicehost I get a much bigger box with much more features, and ofcourse the awesome Plesk 9.0 admin tool.

So the last few days I have been moving over, its gone pretty smooth but there have been a coupple of growing pains, which others may wish to learn from:

**Shared Rather Than Exclusive Hosting**

If you wish to be able to create new clients using Plesk then allow those clients to create domains you must remember to set your VPS as "shared" rather than "exclusive" right at the beginning before doing anything. I found out the hard way that if you make domains on an "Exclusive" IP VPS then you can no longer set that IP as "shared" and therefore clients cannot make domains. The solution I was forced to take was to ring support (which was generally helpful, ive seen worse _cough_ BT _cough_) and they were able to sort it for me.

**Mod_Rewrite and .htaccess**

This blog is wordpress and I wanted the pretty perma-links that Wordpress is capable of so* https://www.mikecann.blog/about/* rather than \_https://www.mikecann.blog/?page=about. \_To achieve this I tried many different things before I hit on the correct solution which was to use FTP to modify the permissions on the httpdocs folder to 777 then go to the perma-links section of the Wordpress settings and allow Wordpress to setup .htaccess for me! I then just went back and changed the permissions back to 750, simples!
