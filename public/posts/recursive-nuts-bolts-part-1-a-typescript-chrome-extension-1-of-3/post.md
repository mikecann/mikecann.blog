---
coverImage: /images/fallback-post-header.png
date: "2012-12-23T17:33:58.000Z"
tags:
  - chrome
  - crawler
  - extension
  - html
  - programming
  - spider
  - typescript
  - web
title: "Recursive, Nuts & Bolts Part 1 - A Typescript Chrome Extension  (1 of 3)"
oldUrl: /programming/recursive-nuts-bolts-part-1-a-typescript-chrome-extension-1-of-3
openAIMikesBlogFileId: file-sggVeEE54Gw24QSRAVSwE34N
---

[![screenshot_04](https://www.mikecann.blog/wp-content/uploads/2012/12/screenshot_041.png)](/posts/recursive-nuts-bolts-part-1-a-typescript-chrome-extension-1-of-3/attachment/screenshot_04-5/)

As [promised](/posts/recursive-explore-the-endless-web/) I have decided to write a few blog posts on some of the technology behind my recently release Chrome extension Recursive.

<!-- more -->

Because there is quite a lot to cover, the discussion is going to be split over three posts. The first part is about the structure of the extension, Typescript and other tools and tech employed. The second will cover the actual recursing / crawling part of the extension. In the final part i'll talk about how I went about representing, laying out and rendering all the data that the crawling part generates.

With that out the way lets get on with the show..

### General Page Layout

When a user open a new tab or browses a new page in Chrome a background script in Recursive inspects the URL you are visiting and so long as it is of type https:// or https:// it will add a small icon to the omni bar:

[![screenshot_02](https://www.mikecann.blog/wp-content/uploads/2012/12/screenshot_02.png)](/posts/recursive-nuts-bolts-part-1-a-typescript-chrome-extension-1-of-3/attachment/screenshot_02-10/)

Clicking this button opens up a new tab with the Recursive app inside. The app consists of a single HTML document “app.htm” with all of the logic split up into multiple Javascript files which mirror the Typescript files that were used to generate them (more on that below).

### Twitter Bootstrap

Recursive is the first project I have had the opportunity to use [Twitter’s Bootstrap](https://twitter.github.com/bootstrap/). Bootstrap takes much of the pain (I tend to suffer from) out of generating a decent looking HTML interface. Because of it ubiquity it can cause a lot of sites to look very samey, for Recursive however I wasn't interested in spending all that much time making a unique looking interface so the default style suited me just fine.

### General Code Structure

There are three main parts of the application; the HTML and its associated controlling logic (jQuery stuff), the crawling logic and the rendering logic. I have attempted to keep the three parts of the application as separate as possible. The reason being that hopefully it will make things easier in the future should I ever wish to swap out one of these features, for example swapping the canvas2d renderer with a 3d one.

### Typescript Code Structure

I have already mentioned in a[ previous post](/posts/tinkering-with-typescript/) that I took advantage of the new language Typescript from Microsoft to build Recursive. I won't reiterate the reasons I really like Typescript (I should be paid for my evangelizing :P), go check out my [previous post](/posts/tinkering-with-typescript/) if you are interested in hearing my thoughts on the language.

The way I have structured things in Recursive is to have a central context / entry point in the form of a file called app.ts. This file lives in the root of the project and I use it as a sort of globals file. I know, I know what you are thinking, “Globals! Mike, you should know better!”. In this instance however I think because Recursive is a standable app inside an extension it is unlikely to conflict with any other JS (supposing the libraries I use dont declare any global variables). Besides I don't like the alternative that involves using RequireJS or AMD due to all the magic strings and non-type safety involved.

[![screenshot_03](https://www.mikecann.blog/wp-content/uploads/2012/12/screenshot_03.png)](/posts/recursive-nuts-bolts-part-1-a-typescript-chrome-extension-1-of-3/attachment/screenshot_03-6/)

App.ts also contains references to every other typescript file in the app. This means that when a new TS file is created I only have to add a single reference back to app.ts and all the classes and types contained in the other files will be available (this solution actually feels kind of icky, much in the same way as globals do, but one of the samples on the Typescript homepage uses this ‘driver’ method so I guess its okay!).

One thing you have to remember with this 'driver' method is that every time you create a new TS file, you must also manually add the generated JS file to the html page. Also you must insert the JS files in the correct order in the page head else the types won't be available when the script is loaded. It would be nice if I could just have included app.js in the html page and then have all other .js files automatically added in the correct order for me. This is what RequireJS is supposed to do for you I guess. Another solution would be to use source-maps to map to the original Typescript code (when debugging in chrome) however I had a great difficulty with getting this to work in Chrome so decided to move on.

One important lesson I learnt while working with Typescript on Recursive and with working with JS in general is to try not to fight it too much. Just because you have type safety doesn't mean you HAVE to make everything type safe all the time, particularly if its going to take you hours to implement it in a type safe way. Just because you can separate all your classes out into separate files doesn’t mean you have to, sometimes it makes more sense and is easier to implement if a few enums or helper classes sit inside the same file.

### L-System

Finally, as a little extra I decided to put in a splash screen when you first start up Recursive:

![screenshot1](https://www.mikecann.blog/wp-content/uploads/2012/12/screenshot1-300x187.png)

While designing this I was also trying to come up with a logo and name for the app. I was toying with the name Recursive and it got me thinking about fractals and [L-Systems](https://en.wikipedia.org/wiki/L-system). As I am easily distracted I decided to quicky have a go at writing an L-System for the splash screen. It wasn't hard to implement but tweaking all the parameters turned out to be a lot more fun than I was expecting so I spent most of one Sunday evening just playing with it :P

### Finally

Well that's about it for the first part of my discussion on the internals of Recursive. This post didn’t didn't contain too many details on what Recursive actually does and how it does it rather it was intended to lay the groundwork for those topics in the next two posts. So stick around for those coming up in the next few days!
