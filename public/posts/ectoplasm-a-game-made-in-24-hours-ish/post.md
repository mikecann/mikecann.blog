---
coverImage: /posts/ectoplasm-a-game-made-in-24-hours-ish/cover.jpg
date: '2013-03-12T11:35:01.000Z'
tags:
  - 24hour
  - game
  - gamejam
  - ios
  - microphone
  - mobile
  - shipit
title: 'Ectoplasm, a Game Made in 24 hours (ish)'
oldUrl: /actionscript/ectoplasm-a-game-made-in-24-hours-ish
---

Just before [leaving Playdemic](/posts/goodbye-playdemic/)Â we had a company-wide ship-it-day. If you haven't done one of these before they are great and work veryÂ similarÂ to game jams like [Ludum Dare](https://www.ludumdare.com/). Basically you have 24 hours to create something related to the company then you have to present it.

<!-- more -->

I decided to team up with [Laura Whyte](https://www.voodoobeans.org/) a rather excellent artist colleague I have have worked with for years. I knew I wanted to make a quick mobile game using Adobe AIR and [Richard Lord's Ash framework](/posts/tinkering-with-ash/) but IÂ didn'tÂ really have any idea of what game specifically I wanted to make. She had the brilliant idea of making a clone of the classic "[helicopter](https://www.helicoptergame.net/)" game that you control with your voice.

So that's what we made. Check out a video of my playing it below:

<iframe src="https://www.youtube.com/embed/Zk4hdII35eM" height="366" width="650" allowfullscreen="" frameborder="0"></iframe>

You will have to excuse the fact I do sound a little like a drunk owl at some points in there.

By the end of the 8-hour day we pretty much had a working game. Since then I have spent a few more evenings here and there tidying up the source code and fixing a few bugs and submitting a build to Apple and Google. In total I would say that 24-hours is a fairÂ time frameÂ for the development of the game.

As previously mentioned we developed the game using Adobe AIR and Ash. The reason being was that I had previously experimented with cross-platform game development with [Mr Nibbles which was coded in Haxe and NME](/posts/mr-nibbles-the-post-mortem/) and I was keen to see how AIR would compare.

Im pleased to say it held up very well. Where I had a little difficulty was with the Ash Framework. Its a great framework however its still rather new and thereÂ aren'tÂ many examples out there for how to do certain parts of the game development such as menus and event handling. For this reason I have decided to open source the game so that others can have a look at how I went about constructing parts of the game in Ash.

Ectoplasm source:Â [https://github.com/mikecann/Ectoplasm](https://github.com/mikecann/Ectoplasm)

I plan on refining the source as I have discussions with others on the Ash Mailing List about how best to go about implementing some of the features, so I suspect that source code may change over the coming weeks.

Because the game is cross-platform that means that it will be accessible on the Apple App Store and Google Play store as soon as it gets approved, for now however you can play the web version over at:Â [/projects/ectoplasm/](/projects/ectoplasm/)[
](/projects/ectoplasm/current/)

You may want to toggle your microphone settings (or disable the microphone entirely ;))
