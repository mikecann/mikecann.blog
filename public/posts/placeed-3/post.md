---
coverImage: /posts/placeed-3/cover.jpg
date: "2008-02-03T13:50:24.000Z"
tags: []
title: PlaceEd 3
oldUrl: /c/placeed-3
openAIMikesBlogFileId: file-4WqsRZM5tM7SjyFLRcsL9SuR
---

Recently I have been working on some small tools for the lads at work to aid them in designing mobile phone games.

One project I have been working on for a while (in my spare time at work and in the evenings at home) is a new version of PlaceEd. PlaceEd is a small app used by people at work who need to design levels with objects and paths in them.

<!-- more -->

The reason for making this new version was because the original was starting to show its age and after several modifications to customise it to certain projects it has become unreliable. A second version (PlaceEd2) was half coded by one of the other employees at rockpool though they ran out of time and didn&rsquo;t complete it.

So that&rsquo;s where I come in, and I wrote from scratch a new app and called it PlaceEd 3 (even though there wasn&rsquo;t really a fully released version of PlaceEd 2).

<!--more-->![](https://www.mikecann.blog/wp-content/uploads/2008/02/placeed3out01.png)

PlaceEd3 lets the user create a new project. This project can have levels added to it. Each level can have a certain number of layers. Layers can be either one large image or a tileset and tileset data. The user can then create objects and give them variables that can either be static (global to all objects of that type) or they can be local which means each object has its own value for that variable. Objects can then be placed on the level and moved and dragged about. Paths can also be placed on the level, this is useful for games that need to script specific movement sequences.

Once a level has been designed it can then be exported as a single binary file that is easily compressed and a java source file that gives a demonstration of how to load the binary data file.

The whole app is written in C# using WeifenLuo docking panels. For the rendering of the level I have integrated an XNA 2.0 panel for speed it gives.
