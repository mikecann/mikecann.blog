---
coverImage: /posts/mr-nibbles-forever-pre-release-10/cover.jpg
date: '2015-07-12T07:59:34.000Z'
tags:
  - 2d
  - development
  - game
  - mr nibbles forever
title: Mr Nibbles Forever - Pre Release 10
oldUrl: /games/mr-nibbles-forever-pre-release-10
openAIMikesBlogFileId: file-XV1HDbaZEqPw4z6nLY4cfZkp
---

Its been almost exactly a week since the last developmental release of Mr Nibbles Forever. According to [the plan](https://www.mikecann.blog/myprojects/mr-nibbles-forever-getting-it-done/) this week should have been about implementing the landing page and gathering feedback from people, as I managed to get the landing page sorted in the first week I decided to spend the time developing the game instead.

<!-- more -->

So this week I have concentrated on decreasing the loading times for the game. On my Nexus 7 the loading time was about one minute which is way too long. The main reason for the load times is the way I construct the levels.

As mentioned [way back in my second post](https://www.mikecann.blog/myprojects/mr-nibbles-forever-prototype-2/) for the game the levels are made up of pre-defined chunks:

[![2015-07-12_15-24-52](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-24-52-1024x589.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-24-52.png)

These chunks are individual scenes. I did it this way because Unity doesn't support nested prefabs and I wanted the ability to change properties of some of the elements of the levels as I was developing. The problem with this however is that to construct the levels I must first load the chunk scene, then extract its contents and build a level.

Unity's scene loading system is very slow and causes the game to pause and stutter if you try to do it at run time. As a result I put a "build" button into the editor which runs through a small script which loads all the chunks into a specially built "Release" scene:

![2015-07-12_15-31-15](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-31-15.png)

So now all the chunks are available in one single scene at startup removing the scene loading issue while the game is running. This is great but it does now mean that the initial load of the game is gigantic as it has to load 80 chunks with thousands of game objects at startup. The result is the game takes a minute to load.

To solve this problem I modified my "build" process so now instead of simply importing the chunk scenes it also processes them a little bit. One common technique in optomising game performance is to use object pooling to reduce the amount of new objects that are created at runtime.

I know that the levels are going to have large numbers of certain types of objects such as spiders, nibbles and level tiles, so what I decided to do was record the unique properties for each instance of the objects such as their position, rotation, sprite type etc. I could then delete those objects from each chunk.

Now when a chunk is used in a level, it simply requests an existing instance of that object type from a global pool, then sets the unique properties on the object such as position and rotation.

The result of all that work is that the load times have been cut in half. So now just 30 seconds on my 2012 Nexus 7\. There is probably more room for improvements there but considering that the deadline for the game is coming up, im happy with it for now.

[![2015-07-12_15-47-42](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-47-42-1024x419.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-47-42.png)

In addition to that performance work, I also had a little more time to work through a few other small bugs and one more feature.

A few people had suggested to me that it would be good to add a "remove ads" option to the game as many people would be happy to remove the ads for a small fee. Well it wasnt a huge amount of work to do it so I put it in.

![2015-07-12_15-50-59](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-50-59.png)

![2015-07-12_15-51-30](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-51-30.png)

So now, you no longer need to watch an ad when you want to start or restart a challenge:

![2015-07-12_15-53-33](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-12_15-53-33.png)

Well that's it for this week. The plan for next week is to plan the game trailer and to experiment with full-screen post process effects again which will hopefully add a whole lot more to the individual visual aspect of each outfit.

As per usual if you are interested in testing the game on Android then join the community page: https://plus.google.com/u/0/communities/100690884724496136044 or for iOS email me: mike.cann@gmail.com
