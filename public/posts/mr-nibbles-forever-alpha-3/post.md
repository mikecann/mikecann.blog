---
coverImage: /posts/mr-nibbles-forever-alpha-3/cover.jpg
date: '2015-02-02T02:23:23.000Z'
tags:
  - 2d
  - development
  - game
  - mr nibbles
  - unity
title: Mr Nibbles Forever - Alpha 3
oldUrl: /mr-nibbles-forever/mr-nibbles-forever-alpha-3
openAIMikesBlogFileId: file-qjsvMKK8vh5vPEHwoKlL4tXB
---

I have had far less time than I would have liked to work on the game this week mainly because it was my birthday over the weekend and quite a bit of time was spent preparing for that.

<!-- more -->

The little time I did have however was spent on two main things. Firstly the video:

<iframe width="854" height="510" src="https://www.youtube.com/embed/q-mv6LWmtBQ" frameborder="0" allowfullscreen></iframe>

The first thing I worked on was adding a new type of chunk that serves as a sort of tutorial to teach the player to tilt the device to slow Mr Nibbles down or speed him up as this seems to be the biggest sticking point with people regarding the controls.

The hanging spiders force the player to slow down and the sign hopefully shows them they do that by tilting the screen:

[![2015-02-02_10-03-16](https://www.mikecann.blog/wp-content/uploads/2015/02/2015-02-02_10-03-16-1024x617.png)](https://www.mikecann.blog/wp-content/uploads/2015/02/2015-02-02_10-03-16.png)

I have a bit more work do do on this before its done but I hope it will help teach people the controls, let me know if it works!

Because this chunk acts as a tutorial it needs to go near the start of the level so the second major bit of work this week was to create a "scriptable sequence" that lets me dictate the type of chunk that needs to spawn:

![2015-02-02_10-12-39](https://www.mikecann.blog/wp-content/uploads/2015/02/2015-02-02_10-12-39.png)

Previously the chunks were randomly selected based on the difficulty which was based on the distance the player had travelled through the game. Now that its scripted its much more controllable but hopefully still leaves a lot of room for the randomness that makes the game replayable.

Other than that there was a host of other small changes in this release:

- Added menus music
- Added options for enabling and disabling sounds and music to the main menu
- Chunks now correctly join together seamlessly
- Added an in game pause button and pause menu
- Added a loading progress bar
- The backyard theme collapsible floor now looks like dirt rather than cage.
- Added unity analytics
- Fixed the chunk testing tool
- Fixed the squeaky sound effects issue

As usual if you would like to play the iOS version email me: mike.cann@gmail.com, the android version can be played if you join this group: [https://plus.google.com/communities/100690884724496136044](https://plus.google.com/communities/100690884724496136044) or just join the facebook page to stay up to date with updates: [https://www.facebook.com/mrnibblesforever](https://www.facebook.com/mrnibblesforever)
