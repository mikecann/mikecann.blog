---
coverImage: /images/fallback-post-header.png
date: "2012-09-08T14:22:05.000Z"
tags:
  - android
  - debrief
  - game
  - ios
  - mobile
  - mr nibbles
  - post mortem
title: Mr Nibbles - The Post Mortem
oldUrl: /haxe/mr-nibbles-the-post-mortem
---

[![](https://www.mikecann.blog/wp-content/uploads/2012/09/header.jpg "header")](https://www.mikecann.blog/wp-content/uploads/2012/09/header.jpg)

Well its been aÂ coupleÂ of weeks since we launched on iOS and a few weeks since Android, so I have decided to write one more post on the Mr Nibbles project. A post mortem into what went right, what went not so right which should hopefully serve to solidify my learning from the process and perhaps help others who should embark on something similar.

<!-- more -->

Before I dive into that, first some statistics thus far..

## Statistics

**Android**

[![](https://www.mikecann.blog/wp-content/uploads/2012/09/2012-09-02_1250.png "2012-09-02_1250")](https://www.mikecann.blog/wp-content/uploads/2012/09/2012-09-02_1250.png)

We have had 2,867 User installs and 1,623 active device installs. Not bad :)

**iOS**

[![](https://www.mikecann.blog/wp-content/uploads/2012/09/2012-09-02_1252.png "2012-09-02_1252")](https://www.mikecann.blog/wp-content/uploads/2012/09/2012-09-02_1252.png)

3,789 iOS installs, making a grand total of 6,656 mobile installs, not bad :)

## The Process

So from [the beginning](/posts/lets-make-a-mobile-game-in-3-weeks-with-haxe-nme/) the this project was to be a quick turn around project. The idea was to try and complete the whole thing in three weeks. It actually ended up being more like 5 weeks for me and 4 weeks for Moh the artist (he was on holiday for one of those) but still not months of development which I wanted to stay clear of.

For me, short time-scale games are so much more fun to make than long games. In a short time you can iterate quickly over the core idea then get it out there quickly and see what people think. When timeÂ constrainedÂ you are are forced to only implement the core functionality and discard the rest. In allÂ likelihoodÂ the other stuff is probably just fluff anyways and not reallyÂ necessaryÂ to the game.

As for the time-overrun, there is no one main reason for it. Lots of small things such as; unfamiliarity with NME / iOS / Android development, windows / osx development workflow and testing taking longer than expected. Making and testing each of the 30 levels took alot more time that I had anticipated. Working around some small NME issues (more on that below) took some time. Writing these blog posts every week (sometimes more) took some time out of what could have been development time too (more on blogging below).

The hours we worked on the project were actually okay. Because this was a personal project and both of us have full time jobs at [Playdemic](https://www.playdemic.com/) we could only work on the game during our evenings and weekends. During week days we tended to start about 6-6:30pm then work until we were kicked out of the office by the securityÂ guard. 8:30-ish usually. Occasionally (mostly towards the end of the project) we stayed a little later to get stuff done before release.

![](https://www.mikecann.blog/wp-content/uploads/2012/09/testing.jpg "testing")

This sort of schedule and working pattern suited us both. Being able to see who you are working with and talking face to face I think really adds to the experience and fun of making an indie game. ItsÂ definitelyÂ more exiting to run over and show the other person some cool new level on your iPad rather than try to describe it over MSN from your bedroom. Working like this obviouslyÂ wouldn'tÂ have been possible if the management at PlaydemicÂ weren'tÂ so awesome by allowing us to use the office after normal office hours soÂ definitelyÂ a massive thanks there.

## Blogging

I strongly feel that blogging everything is one part of the process I definitely wouldn't change. Sometimes I choose to work in private on some projects however Â this one I decided to be very public, announcing upfront the intent and regularly updating on progress. Blogging regularly and getting feedback on progress really encouraged me to stick with it every singe evening. It also served as a way to keep the project fun (absolutely critical for me) as the immediate feedback from people would serve as a basis for ideas and improvements.

Also writing things down has been proven to encourage stronger learning and memory retention, so hopefully in the future I wont make the same mistakes ;)

## Haxe + NME

I have been using [Haxe](https://haxe.org) for over a year now for various personal and professional projects so I was fairly familiar with the language going into this project. Haxe is a good language,Â similarÂ to AS3 / ECMA based langues and so itÂ shouldn'tÂ feel too alien to a seasoned flash developer. It does however come loaded with many improvements over AS3 such as proper generics, type inference, macros and many more awesomeÂ features.

[NME](https://haxenme.org) is a library built ontop of Haxe. It provides a familiar flash api but is able to many platforms natively. Using exactly the same Haxe code base I was able to compile Mr Nibbles to Flash, iOS, Android, Blackberry, Windows andÂ OSX thanks to NME. The library really is great for this sort of fast-turn-around game. Mr NibblesÂ certaintyÂ wouldn'tÂ have been possible without it (not in 5-weeks anyways).

![](https://www.mikecann.blog/wp-content/uploads/2012/09/testing2.jpg "testing2")The NME developers have put a lot of time into making the build and certification process as easy as possible for the various platforms. So with "nme setup android" from the command line for example you are able to download and setup the android SDKs and get your certs setup in the correct place for building. Its really great to see that sort of dedication to making the cross platform compilation process as smooth as possible.

The performance of NME is truly great. Thanks to its batched sprite rendering there are very few draw calls and expensive texture-switching. Mr Nibbles runs at solid frame rates on pretty much every smartphone you can think of from the Android G1to the Galaxy S III to the iPhone 3G to the iPad3\. After having worked with the[ nightmare that is J2ME mobile games](/posts/worms-2/) in the past, being able to run your game on so many devices without any code changes really is a pleasure.

NMEÂ isn'tÂ perfect however and does have a few issues such as slow and imperfect vector rendering from SWF files. It is however constantly constantly being worked on and im sure it wont be long before the issues are ironed out.

Because both NME, Haxe and most of the third-party libraries are open source you are always free to dive in and fix any issues yourself. For Mr Nibbles, the SWF rendering was "good enough", such that we were able to make nice looking menu screens that dynamically scaled to any device resolution and pixel density (a real time saver!).Â Most of the time when I ran into the issue I would post it on the NME mailing list. More often than not it would be answered (often by the NME-super-heroÂ [Joshua Granick](https://www.joshuagranick.com)) within an hour or less!

## iOS

iOS wasÂ definitelyÂ the primary platform we were developing Mr Nibbles for. Mostly because it was the platform I owned a mobile and tablet device for ;) To develop for iOS you need to use osx and xcode, so I took my MBP into the office and hooked it up viaÂ EthernetÂ to the network. I setup a shared folder on my desktop machine and the pointed xcode on my MBP to that shared folder. That way whenever I made a change on my windows computer I would only have to hit one button in OSX to rebuild and test on my iOS device. It was a real time saver over the otherÂ approachÂ I was previously using, syncing over Dropbox.

There were are fewÂ frustratingÂ moments towards the end of the project when I was running into issues regarding ArmV6 and ArmV7 when NME was compiling. Fortunately I noticed in the [nmml spec](https://www.google.co.uk/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&ved=0CCMQFjAA&url=http%3A%2F%2Fcode.google.com%2Fp%2Fnekonme%2Fsource%2Fbrowse%2Ftrunk%2Ftools%2Fcommand-line%2Fspec.nmml&ei=If9EUI7UN4ez0QWYkYHQCw&usg=AFQjCNEl3n-oz1tHz4ZPceTNYidpyTxolA) for NME there was an option to compile to "FAT" which seemed to make the issue to away ;)

## Android

Android was a lotÂ easierÂ to iterate and test because it could all be done from my desktop machine. In hindsight, and with the devices that only became available towards the end of the project, it would have been better if we had concentrated on the Android build first then ported to iOS later. Once we had some devices to test on however I wasÂ incrediblyÂ impressed with how easy it was to build and launch the game onto an Android device with NME. Literally just "nme test android" from the command line and it would compile and launch directly to the[![](https://www.mikecann.blog/wp-content/uploads/2012/09/522085_10151008075505740_663326715_n-300x224.jpeg "522085_10151008075505740_663326715_n")](https://www.mikecann.blog/wp-content/uploads/2012/09/522085_10151008075505740_663326715_n.jpeg) device, no faffing about.

Since launch there have been a few issues with audio crashing on Android. However I believe some people have been working on this so I may do a new build of Android in the near future and push an update of the game to the Google Play store.

## Blackberry

The blackberry build has only been finished very recently, hence the lack of stats thus far. It was actually really easy to build for Blackberry, again just a matter of changing a single word on the command line "nme rebuild blackberry" and that was it.

The hardest part was testing it as I had no Blackberry device to test on. Joshua Granick was extremely kind and offered to test the game out on his device. Not only that, he put in a kind word and managed to get a Playbook shipped out to me so I could test too, thanks Joshua :)

## Conclusion

Overall I had an absolute blast working on this game. Sure it was hard work, alot of evenings and weekend spent in the office till 9pm and sure it went over budget by two week but it doesnt matter because I was having fun the entire time.

This is what making games is all about for me, if you want to have fun programming I cant think of a better way than to make than to develop short-project games. Haxe with NME were instrumental in making the process as fun as possible by taking out much of the bull sh\*t with cross-platform development, letting you get down to business of turning your ideas into reality. So massive thanks to everyone that has worked on developing Haxe and NME.

Finally I want to say a massive thanks to my colleague and artist partner on this project Moh who's time and hard work made Mr Nibbles come alive, nice one Moh!
