---
coverImage: /posts/trello-tasks-a-new-chrome-extension/cover.jpg
date: '2015-11-25T00:59:26.000Z'
tags:
  - browser
  - chrome extension
  - html5
  - plugin
  - typescript
title: Trello Tasks - A Chrome Extension
oldUrl: /trello-tasks/trello-tasks-a-new-chrome-extension
---

So I am taking a little time away from games development at the moment to explore a few other projects and ideas. I want to solve real problems that either I or others have had. I want the projects to be short so I don't get bored and frustrated and I want to also learn new techniques and technologies as I build them.

<!-- more -->

The first of these little projects is called [Trello Tasks](https://chrome.google.com/webstore/detail/trello-tasks/icedfgfhjcnidibolnnfbjnjbkbfgcic).

![screenshot-01-640x400](https://www.mikecann.blog/wp-content/uploads/2015/11/screenshot-01-640x400.png)

The TL;DR of Trello Tasks is: it augments Trello by turning Cards into "completable" tasks.

I have [spoken about Trello before](https://www.mikecann.blog/misc/indie-game-project-management-with-trello/) but if you arent familiar with Trello its a super simple, popular and free [Kanban](https://en.wikipedia.org/wiki/Kanban) style app designed to organise any data. You can create any number of "Lists" which you then populate with "Cards". You can add images, links, comments etc to cards which allows you to organise just about any sort of project.

![](https://www.mikecann.blog/wp-content/uploads/2014/09/drag-drop-trello.gif)

One of the most common ways to use Trello is in the "ToDo" style. In this style you have three lists, ToDo, Doing and Done:

![2015-11-25_08-28-57](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-25_08-28-57.png)

In this style, when you start work on something, you move it from the "ToDo" List to "Doing" List then when its complete you move it to "Done" List.

This is all well and good but what if you use a different system of organisation such as arranging the items by category:

![2015-11-25_08-31-45](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-25_08-31-45.png)

Now if you want to indicate that you have read a book or watched a movie you would have to either drag it into the "Done" list (and loose the categorisation) or create a "Done" list for each category. One other option is to "Archive" the card but doing this removes it from the list altogether.

![2015-11-25_08-36-50](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-25_08-36-50.gif)

So I decided to try and solve this very particular but annoying problem. My solution is to add a checkbox to each card. Now cards can be marked "complete" and "uncomplete" by simply checking the checkbox.

![2015-11-25_08-41-18](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-25_08-41-18.png)

The extension works by piggybacking on Trello's comments system. So each time you complete or uncomplete a task the extension adds a comment to the card.

![2015-11-25_08-43-25](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-25_08-43-25.png)

This means that in a multi-user board you can tell who completed or uncompleted a task and syncing "just works":

![2015-11-25_08-47-32](https://www.mikecann.blog/wp-content/uploads/2015/11/2015-11-25_08-47-32.gif)

So I think its a pretty neat solution to a problem that I personally have had while using Trello. You can grab the extension now and for free from the Chrome store:

[https://chrome.google.com/webstore/detail/trello-tasks/icedfgfhjcnidibolnnfbjnjbkbfgcic](https://chrome.google.com/webstore/detail/trello-tasks/icedfgfhjcnidibolnnfbjnjbkbfgcic)

I have a few more ideas like this I would love to explore and solve over the coming weeks so stay tuned!
