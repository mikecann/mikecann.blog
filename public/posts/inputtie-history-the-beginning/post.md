---
coverImage: /images/fallback-post-header.png
date: "2010-10-09T14:09:19.000Z"
tags:
  - development
  - history
  - java
  - planning
  - project
title: Inputtie History - The Beginning
oldUrl: /inputtie/inputtie-history-the-beginning
openAIMikesBlogFileId: file-MCZmzFfAqyAUNVLNVwrdLlBE
---

I [promised in a previous post to post](/posts/announcing-inputtie/) to talk about the Inputtie development process a little, the various challenges encountered and how I attempted to solve them.

<!-- more -->

In this post im going to talk about the very beginning of the project and what I knew I wanted to have in the final version. Subsequent posts will elaborate on the various technical hurdles and my attempts to solve them.

## The Problem

[caption id="attachment_1372" align="alignright" width="229" caption="Various Inputtie Attempts"]![Various Inputtie Attempts](https://www.mikecann.blog/wp-content/uploads/2010/10/ScreenHunter_02-Oct.-09-13.46.jpg "Various Inputtie Attempts")](https://www.mikecann.blog/wp-content/uploads/2010/10/ScreenHunter_02-Oct.-09-13.46.jpg)[/caption]

I have already talked about the problem [in my previous post](/posts/announcing-inputtie/) but ill recap.

About a year ago I was doing a lot of work at home that involved working both on my desktop PC and my MacbookPro. Often I would find myself using my mouse and keyboard on my PC then having to lean accross to use the trackpad and keyboard on my MBP. Now, I hate trackpads so what I started doing was unplugging my keyboard and mouse from my desktop then plugging back into my MBP when I wanted to use it.

This situation was obviously less than ideal, so I started looking around for other solutions. I had heard of hardware you can buy that involves flipping a switch when you want to change which device you want your input to go to. I considered this but thought there must be a more elegant software solution. I had an idea in my head where I wanted you to simply move my mouse pointer off my desktop monitor and it would then magically appear on the laptop screen.

It was at this point I found out about [Synergy](https://synergy2.sourceforge.net/). I took a good look at it but for the life of me could not get it to work no matter how hard I tried. It also involved lots of fiddley messing around with IP addresses / hostnames and command line parameters (it has improved in a year, but more on that later). So I thought to myself surely there is a better way of doing this, surely its not a tough technical problem to solve!?

## Technical Hurdles

So starting back in October 2009 I decided to undertake the problem, it shouldn't take more than a few evenings to put something together surely?

First I tried to identify the core features I knew I wanted the tool to have:

1.  Work on the three major operating systems, Windows, OSX, Linux.
2.  Be appealing and simple to use without any fiddly configuration file editing.
3.  Without any effort on the part of the user detect other available devices on the network.
4.  Capture low-level input, mouse &amp; keyboard.
5.  Transfer the input to the other device and have it applied.
    With the core features roughly sketched out I could now start thinking about the various technologies I would need to implement them.

My initial thoughts were that Java should be the ideal language to do this in. I could capture the input from one device (somehow) then I could send it to another device and use the Robot class in Java to simulate the input. Because its Java it will work across all operating systems seamlessly so people using it on windows / mac / linux would all get exactly the same experience and I wouldn't have to lift an extra coding finger as Java would take care of all the nasties for me.

It also helped that I was very familiar with Java having worked on severl personal and professional projects in the language. From my [Chain Reaction project](/posts/chainreaction-binarysource-release/) I knew it was possible to create relatively nice user interfaces probably it would take some work to make them look as good as I wanted but surely it wouldn't be too hard.

So with some confidence I decided to get cracking on development.

**Edit: I am breaking this up into several posts as this was getting to be rather large and difficult to read ;) So check out the posts in the coming weeks for more.**
