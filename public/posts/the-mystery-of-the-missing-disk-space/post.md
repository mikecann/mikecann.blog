---
coverImage: /images/fallback-post-header.png
date: '2014-02-15T11:31:48.000Z'
tags:
  - disk space
  - solution
  - windows
title: The Mystery of the Missing Disk Space
oldUrl: /misc/the-mystery-of-the-missing-disk-space
openAIMikesBlogFileId: file-ryZ3r9960H2NuHGIxJWnc82R
---

![screenshot_06](/wp-content/uploads/2014/02/screenshot_06.png)

For ages now I have been plagued with missing disk space. No matter how much space I freed up it always seemed to disappear but finally I have managed to solve it!

<!-- more -->

I have 120gig SSD drive which should be enough for me to run Windows and a few key apps no problem however it seemed to fill up all the time without me installing anything.

![screenshot_02](/wp-content/uploads/2014/02/screenshot_02.png)

This lack of space was having a big problem on my machine, I couldn't open more than a couple of programs at once, things were crashing oddly.

![photoshop-scratch-disk-is-full](/wp-content/uploads/2014/02/photoshop-scratch-disk-is-full.jpg)

I tried everything to make more space, deleting the few apps I had installed on the drive, running disk cleanup, even disabling the hibernation and pagefile systems (really not a good idea). Still to no avail.

Thats when I noticed something odd was going on. I only have 8 root folders on the drive:

![screenshot_07](/wp-content/uploads/2014/02/screenshot_07.png)

So I right-clicked and inspected the properties of each:

[![screenshot_01](/wp-content/uploads/2014/02/screenshot_01-1024x603.png)](/wp-content/uploads/2014/02/screenshot_01.png)

Hang on... Those sizes dont total up to be 106gig.. Infact they are only 43.04gig, what's going on here? Because im an old-school windows user I thought it may be fragmentation issue so I ran defrag, nope no where near enough space freed up there.

Thats when I decided to use a program I had used to years, TreeSize free. This app is supposed to show you where your drive is using its space. But no, it too was reporting that only 47gig of my drive was being used.. Weird!

In desperation I downloaded another app called SpaceSniffer which was supposed to be very similar to TreeSize. I ran it and encountered a whole load of access denied error messages, so I re-ran it as administrator (i'm not sure why you have to do this when you are on an Admin account anyways) and:

[![screenshot_03](/wp-content/uploads/2014/02/screenshot_03-1024x602.png)](/wp-content/uploads/2014/02/screenshot_03.png)

Whats this? 64.8 gig being taken up in my c:windowstemp directory? Specifically a load of 2meg MSI\*\*\*\*.LOG files! Here is my missing space! I opened the temp folder and sure enough here was the culprit

![screenshot_04](/wp-content/uploads/2014/02/screenshot_04.png)

But what on earth are these things? Opening one reveals:

![screenshot_05](/wp-content/uploads/2014/02/screenshot_05.png)

Hmm they looks like .NET log files, strange. I have no idea what is producing them and Googling has no clear answer. It seems safe to delete them and I have done so, so for now that solves my problem. If they come back ill have a deeper look into what is producing them.

I hope this helps other people that may be having similar issues!
