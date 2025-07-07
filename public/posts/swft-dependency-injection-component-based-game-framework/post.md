---
coverImage: /posts/swft-dependency-injection-component-based-game-framework/cover.jpg
date: "2010-06-13T16:22:34.000Z"
tags:
  - community
  - component
  - dependency injection
  - flash
  - flashpunk
  - flixel
  - framwork
  - games
  - ioc
  - opensource
  - pbe
  - personal projects
  - projects
  - swft
title: SWFt - Dependency Injection Component Based Game Framework
oldUrl: /programming/swft-dependency-injection-component-based-game-framework
openAIMikesBlogFileId: file-WzRsjm1mAkTOuKCehjQezZRG
---

This is my first post of what I suspect will be many on the subject of SWFt.

What is SWFt I hear you cry? Well in a nut shell SWFt is an Entity-Component based game framework powered by Dependency Injection. Still confused? Well basically its a really nice neat method for making flash games. Still interested? Read on!

<!-- more -->

First the history, if you arent interested in this then just skip on down to "What exactly is it?"

**History**

It started off as an idea I had while playing around with some RobotLegs code. For those not in the know, [RobotLegs ](https://www.robotlegs.org/) (RL) is an awsome Inversion of Control (IoC) or Dependency Injection (DI) MVCS framework for making Rich Internet Applications (I wrote a post on it [here](/posts/on-the-bleeding-edge/)). IoC and DI were new concepts to me and I was fascinated and excited by the power that they had especially when couppled with something like [AS3 Signals](https://github.com/robertpenner/as3-signals).

At the time of this discovery I was working on a game that used [Push Button Engine](https://pushbuttonengine.com/) (PBE) and [Mate ](https://mate.asfusion.com/)as the basis for development. Feeling dissatisfied with PBE and Mate I wondered if there was a way I could take all the cool things I was playing around with RobotLegs and apply them to some of the cool aspects of PBE.

The first thing I did was to check to see if anyone else has had the idea of using DI in a component based game engine. It looked like it hasnt been done in AS3 but it looks like it has already been thought about and documented in Java. There has been a paper written about it here: [https://portal.acm.org/citation.cfm?id=1658866.1658872](https://portal.acm.org/citation.cfm?id=1658866.1658872), I managed to get my greasy mitts on it and enjoyed the read however I think there was definitely room for improvement in AS3.

The next thing was to seek advice on whether it could even be done in RL. I decided that I should go straight to the source and I emailed one of the contributors to the RL project, Stray. It turns out stray is a very nice lady who is also from the north of the UK. She had some good words of advice but she recommendation that I repost my question to the RL mailing list where the other contributors to the project tend to lurk.

So I wrote up my query[ and posted it](https://groups.google.com/group/robotlegs/browse_thread/thread/f7e325c5caf14d93). I added in some diagrams of how I thought it may look:

[![](https://www.mikecann.blog/wp-content/uploads/2010/06/Relationships-1-300x259.png "Relationships 1")](https://www.mikecann.blog/wp-content/uploads/2010/06/Relationships-1.png)[![](https://www.mikecann.blog/wp-content/uploads/2010/06/Example-1-300x161.png "Example 1")](https://www.mikecann.blog/wp-content/uploads/2010/06/Example-1.png)

To cut a long story short, after [several months](https://groups.google.com/group/robotlegs/browse_thread/thread/4833ba99cd12b25a) of [posts](https://groups.google.com/group/robotlegs/browse_thread/thread/4d3eb6d8f8dd64bc#) back and forth with many excellent suggestions and contributions I felt it was time that the project migrated to its own home as not spam up the RL list too much. As such [SWft - Game Framework](https://groups.google.com/group/swft-framework) mailing list was born! Its still very new and as such there arent many posts yet but I hope for that to grow as the project progresses.

We also have a website: [https://www.swft.co.uk](https://www.swft.co.uk) but its meerly a holding page for now.

**What exactly is it?**

Okay so I promised I would talk about what SWFt actually is. Well without going into too much detail (more posts will follow that will flesh out examples etc) SWFt lets you make AS3 Flash games in a modular component based fashion like you do with [Push Button Engine](https://pushbuttonengine.com/) but it lets you keep the strict-type, compile-time checked game structure like you may find in [Flixel ](https://flixel.org/)or [Flash Punk](https://flashpunk.net/).

Its still very alpha and has alot more work left to do on it but you can follow progress on our GitHub page here: [https://github.com/mikecann/Swft](https://github.com/mikecann/Swft) and some examples can also be found here: [https://github.com/mikecann/Swift-Examples](https://github.com/mikecann/Swift-Examples) (the red-blue circle experiment is currently broken)

As I say, its still very early days, but I have been wanting to blog about it for a while as its a very exciting project im currently working on :)

**Contributions**

If you are interested in contributing code or thoughts or anything then shoot a message on the mailing list: [https://groups.google.com/group/swft-framework](https://groups.google.com/group/swft-framework)

Expect more posts in the coming weeks!
