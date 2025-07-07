---
coverImage: /images/fallback-post-header.png
date: "2010-11-28T19:14:10.000Z"
tags:
  - as3
  - code
  - component
  - flex
  - label
  - mxml
  - spark
  - tip
title: "Multi-Line Flex Label [MXML]"
oldUrl: /flex/multi-line-flex-label-mxml
openAIMikesBlogFileId: file-izllAq04B2dtn1twAQMVihgu
---

Just stumbled across this one while writing some mxml for a personal project and thought I would share.

Have you ever wanted to have multi-line text in your label component in spark and thought the following should work?

```

<s:Label text="I like text on the n next line" />

```

But all it produces is:

[![](https://www.mikecann.blog/wp-content/uploads/2010/11/Shot_001.png "Shot_001")](https://www.mikecann.blog/wp-content/uploads/2010/11/Shot_001.png)

Yep me too.

After some playing however I stumbled accross the following solution:

```

<s:Label text="I like text on the {'n'} next line" />

```

It then produces the expected result:

[![](https://www.mikecann.blog/wp-content/uploads/2010/11/Shot_0021.png "Shot_002")](https://www.mikecann.blog/wp-content/uploads/2010/11/Shot_0021.png)

Im just guessing but I suspect its something to do with the black art of the flex life cycle. By adding the {'n'} we are turning the property initialisation on the label component from a simple literal assignment into a delayed binding assignment and therefore gets parsed differently.

Just a guess, let me know if im way off.
