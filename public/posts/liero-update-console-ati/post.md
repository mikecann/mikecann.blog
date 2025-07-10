---
coverImage: /images/fallback-post-header.png
date: '2007-09-10T21:51:19.000Z'
tags: []
title: Liero Update - Console & ATi
oldUrl: /c/liero-update-console-ati
---

Well I took Liero into work today just to show to a few people who were interested and to test it on another machine other than my own. And low and behold it didnt work on my work machine which was no surprise as it doesnt have a graphics card so it fell down at the first hurdle. I then went to test it on an artists ATi based machine expecting it to work. It did but sadly there were no particles.

<!-- more -->

Well after digging around abit, I discovered that it was the same problem I encountered before when I released my [1,000,000 particles demo](https://www.mikecann.blog/?p=163) a few months ago. The problem is that ATi dont include the ability to use Vertex Textures in their graphics hardware (the core technology allowing me to get many particles on the screen). I knew the solution from previous work was to use ATi's alternative Renter To Vertex Buffer (R2VB) unfortunately I could not find anyone else that had done this in XNA before which led me to the suspicion that it wasnt possible. I posted on the XNA forum about this, [you can see the replies here.](https://forums.xna.com/24255/ShowThread.aspx#24255)

Anyways to cut a long story short I have not been able to implement R2VB for ATi cards but I have instead done the next best thing which is to implement a CPU particle system instead. This means that people with realy old cards (or like my work machine without a card atall) or people with ATi cards they can still play the game and still have particles, just not as many (200-400k on nVidia, 10-50k on CPU).

Also something I implemented over the weekend was this fancy console which, makes life alot easier for me when developing, isnt it nice ;)

![](https://www.mikecann.blog/Images/LieroXNA/liero02.png)
