---
coverImage: /posts/announcing-inputtie/cover.jpg
date: "2010-09-09T17:58:03.000Z"
tags:
  - air
  - clipboard
  - donate
  - java
  - keyboard
  - mouse
  - personal
  - project
  - sync
  - tool
title: Announcing Inputtie
oldUrl: /inputtie/announcing-inputtie
---

For the last year or so my major personal-project has been under wraps but after a few intense weeks its finally time to talk about it!

First before I explain exactly what Inputtie is I will talk about why I started this project and the problem I was trying to solve.

<!-- more -->

(If you aren't interested in all the background fluff and just want to find out what Inputtie is, head over to [inputtie.com](https://www.inputtie.com))

## **The Problem**

About a year ago I was doing a lot of work at home that involved working both on my desktop PC and my MacbookPro. Often I would find myself using my mouse and keyboard on my PC then having to lean accross to use the trackpad and keyboard on my MBP. Now, I hate trackpads so what I started doing was unplugging my keyboard and mouse from my desktop then plugging back into my MBP when I wanted to use it.

This situation was obviously less than ideal, so I started looking around for other solutions. I had heard of hardware you can buy that involves flipping a switch when you want to change which device you want your input to go to. I considered this but thought there must be a more elegant software solution. I had an idea in my head where I wanted you to simply move my mouse pointer off my desktop monitor and it would then magically appear on the laptop screen.

It was at this point I found out about [Synergy](https://synergy2.sourceforge.net/). I took a good look at it but for the life of me could not get it to work no matter how hard I tried. It also involved lots of fiddley messing around with IP addresses / hostnames and command line parameters (it has improved in a year, but more on that later). So I thought to myself surely there is a better way of doing this, surely its not a tough technical problem to solve!?

## The Solution

I had originally intended to talk about the myriad of attempts, blind alleys, different languages and general headaches I endured to get to this point however its a very lengthy topic. So instead in this post im just going to talk about the final solution talk about the previous attempts in later posts.

So without any further ado I present a screenshot of Inputtie, so you can get an idea of whats going on:

[![](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_04-Sep.-08-19.07.jpg "ScreenHunter_04 Sep. 08 19.07")](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_04-Sep.-08-19.07.jpg)

It's an Adobe AIR 2 application so it means it will look and work the same across all supported operating systems (Mac, Windows, Linux). AIR also makes it super easy to install and update so for most users it should be a very simple matter to get it up and running.

The way it works is simple. When opened it automatically detects other devices on your network that have Inputtie running. You then make a connection between your two devices by simply dragging and dropping an arrow from one device to another:

[![](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_05-Sep.-08-19.13.jpg "ScreenHunter_05 Sep. 08 19.13")](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_05-Sep.-08-19.13.jpg)

Do the same on the other device and your computers are now connected, its that simple! Now when you move your mouse across to the side of the screen (side dependant on which arrow you picked) it will magically appear on the screen of the other device, splendid!

Now over there you can use your keyboard and mouse as normal and the input will be transferred over.

You can even also copy and paste text from one device to the other. This is great when you just want to blast a URL or some other bit of text to the laptop or back again without having to send emails or use IM or make a text file and send it over a network or anything else.

If you want to fire up a game or something  that inputtie may interfere with you can simply and easily toggle it to disabled:

[![](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_08-Sep.-08-19.31.jpg "ScreenHunter_08 Sep. 08 19.31")](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_08-Sep.-08-19.31.jpg)[![](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_09-Sep.-08-19.31.jpg "ScreenHunter_09 Sep. 08 19.31")](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_09-Sep.-08-19.31.jpg)

## Website

Early into the project I teamed up with my partner in crime and jack-of-all-trades [Oliver Pitceathly](https://www.olip.co.uk). The original idea was to release this as a commercial product so we wanted to have a nice high-quality website as a landing page for potential customers. In the latter stages of the product we decided to drop the commercial aspect and make it donation-ware instead.

Despite my constant badgering and mind-changing Oli has done a [fantastic job on the website](https://www.inputtie.com), it looks simply great!

[![](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_10-Sep.-08-19.46.jpg "ScreenHunter_10 Sep. 08 19.46")](https://www.mikecann.blog/wp-content/uploads/2010/09/ScreenHunter_10-Sep.-08-19.46.jpg)

He even found time to do an awsome video that shows off the best features of Inputtie:

<iframe width="100%" height="400" src="https://www.youtube.com/embed/OUM1EGbUMvQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## ** Planned Extensions**

There are many potential extensions that you could imagine would be really handy.

Imagine being able to tare a tab from your desktop browser then drag it over to your laptop and having it then appear there.

Even better how about simply dragging a file or folder over then having it transfer quickly, be pausable, restartable, and toggle the bandwith it uses. All possible and planned extensions in Inputtie.

Another idea is using the multi-touch track pad on the macbook to interact in a multi-touch fashion with windows 7 on your desktop.

## **Beta**

"So where can I get my hands on it?" you cry. Well we haven't actually release it for download just yet, there are some niggley bugs and things to work out with it still. If you are interested in testing it out tho sign up for the beta over at [inputtie.com](https://www.inputtie.com) and ill shoot you a mail when its ready to go!
