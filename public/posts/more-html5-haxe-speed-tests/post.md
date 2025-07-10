---
coverImage: /images/fallback-post-header.png
date: "2011-07-10T19:13:25.000Z"
tags:
  - canvas
  - haxe
  - html5
  - performance
  - programming
  - project
  - speed
title: More HTML5 & HaXe Speed Tests
oldUrl: /haxe/more-html5-haxe-speed-tests
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/07/header.png "header")](https://www.mikecann.blog/wp-content/uploads/2011/07/header.png)

Ive spent a little more time this weekend looking at some more Â HTML5 with HaXe. Following on from [my previous experiments with WebGL](/posts/chrome-crawler-haxe-three-js-webgl-and-2d-sprites/)Â I decided to give HTML5's Canvas a a look as it was supposed to be designed specifically for the purpose of doing 2D.

<!-- more -->

I had heard from the HaXe mailing list that the [Jeash project](https://haxe.org/com/libs/jeash) was a common way ofÂ interactingÂ with the canvas in HaXe. Jeash is a remapping of the Flash API into JS so in effect I should beable to take any of my usual flash code, Sprite's, Â BitmapData's, etc and it should run on the canvas no problems. Nice!

So I coded up a quick blitting example to see what sort of performance I would get:

[/projects/HTML5SpeedTests/HaXeJeash/bin/](/projects/HTML5SpeedTests/HaXeJeash/bin/)

The results were okay (I get about 11FPS with 5,000 crawlers) however I was interested to know what sort of cost HaXe adds. So I decided to code up a second example, this time using pure JS:

[/projects/HTML5SpeedTests/JSCanvas/](/projects/HTML5SpeedTests/JSCanvas/)

The results this time were better (14FPS with 5,000 crawlers) so I now wondered what happens if I do without Jeash and just code up the example using pure HaXe. I was expecting to see the same sort of performance hit as Jeash:

[/projects/HTML5SpeedTests/HaXeCanvas/bin/](/projects/HTML5SpeedTests/HaXeCanvas/bin/)

Surprisingly it actually runs faster (17FPS with 5,000 crawlers) ! This is quite a surprise andÂ totallyÂ contradictsÂ my notion that going from HaXe -> JS wouldÂ incurÂ a cost. I was expecting some cost, but a performance increase?! I can only speculate that behind the scenes the JS engine in the browser is able to JIT compile the HaXe JS much better than the hand-crafted JS and hence more speed.

If you are interested in the source then I have uploaded it here:Â [/projects/HTML5SpeedTests/HTML5SpeedTests_1.zip](/projects/HTML5SpeedTests/HTML5SpeedTests_1.zip)

P.S. All the test were run on Windows 7 x64 in Chrome 14 (dev)
