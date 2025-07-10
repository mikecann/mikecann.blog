---
coverImage: /posts/introducing-markd-pinterest-for-people/cover.jpg
date: '2016-09-15T02:25:17.000Z'
tags:
  - asp.net
  - aurelia
  - chrome extension
  - commercial project
  - website
title: Introducing Markd - Pinterest for people
oldUrl: /markd/introducing-markd-pinterest-for-people
---

[Markd](https://markd.co/) is a project I have been working on for Brandon over a [pepwuper.com](https://www.pepwuper.com/) for a while now.

<!-- more -->

Quite simply its a Chrome Extension and website that allows a user to quickly and easily bookmark people you come across on the internet. In [Brandons own words](https://www.pepwuper.com/markd-pinterest-for-people/):

> I wanted a better way to go about the process. A simple tool that would allow me to save someone into my â€œbook of interesting peopleâ€, no matter which site I find them on. I wanted it to be easy with image/description automatically filled out. I wanted it to allow me to save reference images. And I wanted it to have a simple way for me to organise and search those Iâ€™ve bookmarked later on.
> And so he contacted me to help him build out such a tool and [Markd](https://markd.co) was born:

![chrome_2016-09-15_08-36-51](https://www.mikecann.blog/wp-content/uploads/2016/09/chrome_2016-09-15_08-36-51.png)

## The Extension

The tool comes in two parts. Firstly there is a [Chrome Extension](https://chrome.google.com/webstore/detail/markd/beaalofkiocejchbpaocbbjhobmambpp):

![chrome_2016-09-15_09-03-37](https://www.mikecann.blog/wp-content/uploads/2016/09/chrome_2016-09-15_09-03-37.png)

Once installed (and logged in) you can visit any site then just hit the little Markd icon on the browser toolbar:

![chrome_2016-09-15_09-05-27](https://www.mikecann.blog/wp-content/uploads/2016/09/chrome_2016-09-15_09-05-27.png)

This opens a window which auto populates from the page you are on:

![chrome_2016-09-15_09-08-47](https://www.mikecann.blog/wp-content/uploads/2016/09/chrome_2016-09-15_09-08-47.png)

Currently the auto-population only works for a number of the most popular sites sites, namely: "Twitter, Linkedin, Behance, Facebook, Dribble, DeviantArt, Github and ProductHunt", but if it isnt on that list (or even if it is) you can easily edit any part of the Mark before it is saved. Images are scraped from the page and presented in a handy dialog:

![2016-09-15_09-33-32](https://www.mikecann.blog/wp-content/uploads/2016/09/2016-09-15_09-33-32.gif)

## The Website

Once saved you can view and edit your saved marks on Markd.co:

![chrome_2016-09-15_09-37-52](https://www.mikecann.blog/wp-content/uploads/2016/09/chrome_2016-09-15_09-37-52.png)

## The Tech

The two parts (Chrome Extension and website) were built with two different technologies.

### Chrome Extension

I decided to go with [Aurelia](https://aurelia.io/) for the extension. I was wanting to find an excuse to give it a try for a while and this seemed like the perfect opportunity.

Its a framework for web app development from Rob Eisenberg, the same dude that worked on Durandal and Angular before deciding he wanted to go his own direction and create Aurelia.

Much like Angular its a template-based framework like Angular e.g.

```html
<template>

<h1>\${heading}</h1>

<form submit.trigger="addTodo()">
<input type="text" value.bind="todoDescription">
<button type="submit">Add Todo</button>
</form>
</template>
```

You then write a backing "Component" class which implements the "addTodo()" function and provides the "heading" variable etc.

In addition to this it provides many other nice things out of the box such as easy to setup routing and good support for Typescript.

Because it is quite new I did have quite a few setup difficulties, in the end I managed to get it all working and found it a pleasure to use.

### The Website

I wasn't sure which backend tech to use for this, there were many options. In the end I decided to go with .Net (C#) hosted on Azure. Development was "relatively" simple because of the excellent VisualStudio tooling with C#. I did however have some difficulties around providing my own Authentication scheme using Json Web Tokens. In the end I managed to get it working thanks to a number of helpful projects on github.

Azure itself also provided its own share of problems; one such such being it seems to be impossible to handover a resource group to another user. To me this is a pretty common usecase for a freelancer that wants to handover a completed project to a client.

We also ran into the auto-DB backups not actually running for some reason. For all its power, Azure can be a bit of a fickle beast sometimes, in the future I will probably stay away from it.

## Conclusion

[Markd](https://markd.co/) was a great project to work on and im proud of the result and the [client is happy](https://www.pepwuper.com/markd-pinterest-for-people/) which makes me happy. We have a bunch of other features and things we want to add to it but that will have to wait for another blog post, for now tho you can check out the tool for free at:

[https://markd.co/](https://markd.co/)

Let me know what you think in the comments below!
