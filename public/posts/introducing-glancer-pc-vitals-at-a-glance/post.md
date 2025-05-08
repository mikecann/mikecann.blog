---
coverImage: /posts/introducing-glancer-pc-vitals-at-a-glance/cover.jpg
date: '2016-11-10T06:53:58.000Z'
tags:
  - app
  - c sharp
  - tool
  - util
  - windows
  - wpf
title: Introducing Glancer - PC Vitals at a Glance
oldUrl: /glancer/introducing-glancer-pc-vitals-at-a-glance
openAIMikesBlogFileId: file-fYjyKFPloW5a5KvFVFfN2vIQ
---

This post has been over 6 years in the making but im glad I can finally write it.

<!-- more -->

Way back in [March of 2010](https://www.mikecann.blog/myprojects/windows-7-taskbar-monitor/) I wrote about a new tool I had developed with the snappy name "Windows 7 Taskbar Monitor". It was a little tool that used Windows' Performance Counter to show you what the current CPU, Memory and Network usage is:

![taskbar-monitor-sceenshot01](https://www.mikecann.blog/wp-content/uploads/2016/11/taskbar-monitor-sceenshot01.gif)

The cunning thing however is that I piggybacked on the new (at the time) "progress" value that you could get which would give you a nice visual indication of the current value for each monitor:

![taskbar-monitor-screenshot02](https://www.mikecann.blog/wp-content/uploads/2016/11/taskbar-monitor-screenshot02.gif)

To my surprise this little tool has more than justified its effort to create. I have used it every day for the past 6 years and has been an invaluable tool in working out "what the hell is my computer doing?" sort of problems.

Over the years I haven't really changed it much and 4 years ago I even open-sourced it: [https://github.com/mikecann/Windows7-Taskbar-Monitor](https://github.com/mikecann/Windows7-Taskbar-Monitor)

With the advent of Windows 8 and the App Store I thought it would bring greater visibility to my little tool if I could publish it to the store. Unfortunately however Microsoft imposed some pretty strict rules with their store which meant that I couldnt use the progress-tasbar APIs that were central to the app.

Fast-forward a few more years to Windows 10 anniversary edition and Microsoft release something called "Desktop App Converter" (formally Project Centennial). This project would allow you to take just about any existing windows app, then wrap it and convert it so that it was safe to use on the store.

Perfect, this was just what I needed to bring Taskbar Monitor to the store. Well (after a number of lengthy hurdles) I finally achieved it. I totally rewrote the tool to use a more modern Microsoft framework and gave it a new name, Glancer:

[![taskbar-feature2-compressor](https://www.mikecann.blog/wp-content/uploads/2016/11/taskbar-feature2-compressor-1024x638.gif)](https://www.mikecann.blog/wp-content/uploads/2016/11/taskbar-feature2-compressor.gif)

[![storescreenshot01](https://www.mikecann.blog/wp-content/uploads/2016/11/StoreScreenshot01-300x169.png)](https://www.mikecann.blog/wp-content/uploads/2016/11/StoreScreenshot01.png)[![storescreenshot03](https://www.mikecann.blog/wp-content/uploads/2016/11/StoreScreenshot03-300x169.png)](https://www.mikecann.blog/wp-content/uploads/2016/11/StoreScreenshot03.png)[![storescreenshot02](https://www.mikecann.blog/wp-content/uploads/2016/11/StoreScreenshot02-300x169.png)](https://www.mikecann.blog/wp-content/uploads/2016/11/StoreScreenshot02.png)

The basic functionality is the same, its just wrapped up in a prettier package and has a few more options.

At this stage its just an MVP. I have plans to add a whole bunch more cool functionality and monitors but I just wanted to get it out there first and see what people thought and then hopefully iterate on it as I go.

Ill be using it daily now so very much have an incentive to improve it :)

Currently its totally free but im thinking at some point in the future ill monetize it, probably with a free-trial but perhaps with a "freemium" model.

I also built a website for the project here: [https://www.glancer.co/](https://www.glancer.co/) its a bit basic at the moment but I plan on iterating that as I go.

Anyways, give it a download, let me know what you think!

[https://www.microsoft.com/en-us/store/p/glancer-your-pc-vitals-at-a-glance/9nblggh43gvm](https://www.microsoft.com/en-us/store/p/glancer-your-pc-vitals-at-a-glance/9nblggh43gvm)

Until next time.
