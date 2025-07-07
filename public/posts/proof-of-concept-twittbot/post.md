---
coverImage: /posts/proof-of-concept-twittbot/cover.jpg
date: "2009-04-30T19:49:32.000Z"
tags:
  - bot
  - c sharp
  - opensource
  - personal
  - plugin
  - projects
  - twitter
title: "Proof of Concept: TwittBot"
oldUrl: /c/proof-of-concept-twittbot
openAIMikesBlogFileId: file-raQD8xvByDejhUkOAeeODS7T
---

Well for the last few evenings I have been working on this little proof of concept. One of my work colleague Ade ([@6t8](https://twitter.com/6t8)) came up with the idea "someone should make a game that you can play over twitter". Well after abit of excitement and talk I decided to have a go at coding this idea. Once I had started I realised that it could be possible to do alot more with this, so I decided to make the project a little more generic and turn it into a pluggable bot for automating twitter.

<!-- more -->

After a few evenings work however I decided that this project was going to take up a bit too much of my time, especially when I had so much other work to do. So I have decided to release what I have done and let other take it and develop it if they wish.

You login using a twitter account:

![1](https://www.mikecann.blog/wp-content/uploads/2009/04/1.gif "1")

<!--more-->Once logged in you are presented with the main interface, plugins are loaded automatically from the directory and displayed as tabs. The reason for doing them as plugins is to allow users to pick and choose what functionality they want their twittbot to have. Also it allows for easy upgrading to newer plugin versions.

![2](https://www.mikecann.blog/wp-content/uploads/2009/04/2.gif "2")

Hangman was the primary idea for this project and is implemented as a simple plugin that consists of 3 simple commands:

![3](https://www.mikecann.blog/wp-content/uploads/2009/04/3.gif "3")

I have built a simple polling timer for checking new messages from Twitter:

![4](https://www.mikecann.blog/wp-content/uploads/2009/04/4.gif "4")

The interface uses docking panels provided by the[ .NET DockPanel Suite](https://sourceforge.net/projects/dockpanelsuite/). Docking is demonstrated below with the log window:

![5](https://www.mikecann.blog/wp-content/uploads/2009/04/5.gif "5")

The next shot shows me sending a direct message to the "[twittgames](https://www.twitter.com/twittgames)" account from my "[mikeysee](https://www.twitter.com/mikeysee)" account:

![6](https://www.mikecann.blog/wp-content/uploads/2009/04/6.gif "6")

After refreshing, the Hangman plugin then shows the active game states:

![7](https://www.mikecann.blog/wp-content/uploads/2009/04/7.gif "7")

Then you play the game by making guesses:

![8](https://www.mikecann.blog/wp-content/uploads/2009/04/8.gif "8")A

And the plugin responds to your guesses:

![9](https://www.mikecann.blog/wp-content/uploads/2009/04/9.gif "9")

It is far from complete but as a proof of concept I think it demonstrates the idea. There are many things that could be improved and/or worked upon, such as:

- Implement async calls rather than halting the thread when making a call
- Completing the Auto-follow plugin
- Implementing a database to log previously handled messages
- Enable back-messaging so you can search for previous messages and handle them
- Implement an interface for loading/unloading plugins
  For the technology side of things, its was developed in C# .NET 3.5 using the excellent [TweetSharp ](https://code.google.com/p/tweetsharp/)library for interfacing with Twitter. Docking panel functionality is provided by [DockPanel Suite](https://sourceforge.net/projects/dockpanelsuite/).

You can grab the binary for this here: [TwitterBot.zip](Files/TwitterBot.zip)

Source code is available on request. Email: mike.cann@gmail.com
