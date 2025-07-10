---
coverImage: /posts/mr-nibbles-forever-pre-release-9/cover.jpg
date: '2015-07-03T05:08:07.000Z'
tags:
  - 2d
  - development
  - game
  - mr nibbles
  - physics
  - unity
  - unity3d
title: Mr Nibbles Forever - Pre Release 9
oldUrl: /mr-nibbles-forever/mr-nibbles-forever-pre-release-9
---

Well its been almost two weeks since [I declared the (tough) scheduled plan](https://www.mikecann.blog/myprojects/mr-nibbles-forever-getting-it-done/) for the release of Mr Nibbles Forever. In it I planned that last week was to be:

<!-- more -->

> 22nd-28th June
>
> 1. Design landing page for the game. This is important as I will need a place to put the trailer and to send people who are interested in the game. I have read several good resources on how this page should look. Some examples of other landing pages are: https://www.pixelprospector.com/list-of-websites-and-blogs-from-game-developers/. Once landing page is designed, run it pass some designer friends for help improving it.
>
> 2. Pester people for feedback on Alpha 8\. I need to get some real-world feedback for the game so I can fix bugs and improve the polish for release 9.
>
> 3. Contact some marketing people for help and advice.

Well I managed to do 1) and 2) but I decided that I didnt need to do 3) just yet, instead I made do with the excellent advice on these two pages:

https://vgamemarketing.com/
https://www.pixelprospector.com/

I may go back to 3) in a week or two if I need to.

As for 1) well I decided after an hour or two of messing around in Photoshop that it would be easier and faster to just buy an off-the-shelf WordPress theme and adjust that to my needs as I was intimately familiar with WordPress. The theme I chose was [Grizzly from Wegrass](https://themeforest.net/item/grizzly-responsive-app-showcase-corporate/1546240):

[![2015-07-03_07-33-47](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-33-47-300x231.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-33-47.png)

It seemed to have all the features I needed for now and was responsive which is super important these days.

The next issue was what name should I call the "company". Up until now I had been going with the name "Nibblers" as that was the name that "Mr Nibbles" was published under too. "Nibblers" however is very specific to Mr Nibbles games and if I wanted to do non-nibbles games in the future it would sound a little odd so I needed a new name.

After much head scratching I decided I wanted to base the name around my favorite animal the Mantis Shrimp. If you dont know what it is, then checkout [the oatmeal's excellent bit on it](https://theoatmeal.com/comics/mantis_shrimp). The problem was that mantisshrimp.com is taken, also its difficult to tell someone the domain, as they either dont know how to spell it or are confused as to how many S'es there are in the middle.

So in the end I decided to go with something that was related and instead use the Mantis Shrimp in the logo. So I went with.... Epic Shrimp:

[![2015-07-03_07-41-32](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-41-32-1024x728.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-41-32.png)

The site is still very much under development but at least I now have a good landing page for Mr Nibbles, Ectoplasm and Mr Nibbles Forever:

![2015-07-03_07-43-27](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-43-27.png)

So although last week was supposed to just be design, I decided to go the full-hog and implement too, which means that I have one more week free for development.

Speaking of development, this week we [supposed to be a bug-fixing and polish pass](https://www.mikecann.blog/myprojects/mr-nibbles-forever-getting-it-done/):

> 29th June â€“ 5th July
>
> 1. Do bug-fixing and polish pass of the game. Push release 9 of the game to people for testing and feedback.

Its true that I did indeed fix some minor bugs...

![2015-07-03_07-46-39](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-46-39.png)

... this week was mostly dedicated to improving the high scores system in the game.

As a result of some feedback from people I decided that the game needs to be more in-your-face about the competitive aspect. Hopefully this will encourage people to return more often so that they can try to get higher up the leader boards.

I was unsatisfied with my current GameCentre and GoolgePlayServices implementation of the highscores so I decided to roll my own using my Parse.com experience. So now you will notice that next to the high-scores button that every each play you are given your daily rank:

[![2015-07-03_07-49-39](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-49-39-1024x772.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-49-39.png)

Clicking the button will show you the top ranked players in each category:

[![2015-07-03_07-51-51](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-51-51-1024x768.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-51-51.png)

You will notice that your name is "???" until you set your name:

[![2015-07-03_07-54-31](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-54-31-1024x763.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-54-31.png)

Once done, all your old and new scores will now be saved under that name, this works across devices too.

[![2015-07-03_07-55-33](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-55-33-1024x773.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-55-33.png)

I am also experimenting around with having a button next to any high score which also has a saved replay.

[![2015-07-03_07-57-26](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-57-26-1024x763.png)](https://www.mikecann.blog/wp-content/uploads/2015/07/2015-07-03_07-57-26.png)

Clicking the button will open Everyplay and show the recorded run for that highscore, which I think is pretty cool!

Well that's it for now, this weekend I am going to be extremely busy on something else (more in another blog post soon) so I wont have any more time, but hopefully next week will either be more bug fixing and polish and getting more feedback on the game.

As usual if you would like to try the game and are on iOS then just email me: mike.cann@gmail.com, or if you are Android then join this page: [https://plus.google.com/u/0/communities/100690884724496136044](https://plus.google.com/u/0/communities/100690884724496136044)

Until next week!
