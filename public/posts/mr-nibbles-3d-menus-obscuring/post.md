---
coverImage: /posts/mr-nibbles-3d-menus-obscuring/cover.jpg
date: '2014-07-05T00:58:51.000Z'
tags: []
title: Mr Nibbles 3D - Menus & Obscuring
oldUrl: /mr-nibbles-3d/mr-nibbles-3d-menus-obscuring
---

While experimenting around with rotating in more than just one axis I ran into an issue. When rotating you can obscure the camera with the level. It would be possible to construct levels such that they can't be rotate into a position that anything would be obscured but it would severely restrict the number and type of levels I could build.

<!-- more -->

![screenshot_002](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_0021.png)

The solution to this problem was to shoot a ray (well, several rays) from the player to the camera, if they collide with anything then its obscuring and thus I fade it out. When its no longer obscuring I fade it back in again. It works pretty well as a solution though I will need to see how it actually works out when I build more levels.

I have also been thinking about the menus in the game. I was wonder if there was a way to make the menus more interesting. Then I had the idea, why not make the menus a level? That way I could introduce the basic controls at the same time!

<iframe width="640" height="360" src="//www.youtube.com/embed/2ND4ZflJxVk" frameborder="0" allowfullscreen></iframe>

Each section of the menus are navigable by jumping into the portal which loads the next menu section. Obviously this wont work for menus that need sliders and checkboxes like the options screen, in those cases ill just pop up a regular menu. What do you think? Is it a good idea or will it get annoying?
