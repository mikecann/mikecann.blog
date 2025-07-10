---
coverImage: /images/fallback-post-header.png
date: '2007-09-06T20:02:53.000Z'
tags: []
title: LieroXNA - A Tentative Beginning
oldUrl: /c/lieroxna-a-tentative-beginning
---

Okay I have decided to start a new mini pet project. As you may have guessed by now I have stopped work on the [TDProject](https://www.mikecann.blog/?p=170). The reason is that it is too large of a project to take on at the same time as having a job, should I ever find myself without a job in the future I may pick it up again.

<!-- more -->

So the new project is designed to be alot smaller than the last and should give a more immediate sense of achievement. The project is going to be a clone of the popular game [Liero](https://en.wikipedia.org/wiki/Liero) but for XNA (so xbox eventualy). For those that havent played it, its a real-time 2D action game (basically worms without the turn based tedium).

So far im just playing around with getting the core of the engine up and running. The original Liero and its successive clones were all done in C/C++. In those languages you have the ability to pixel blit, that is write directly to the back buffer one pixel at a time. In XNA/C# however you dont have that ability, so you have to do some funky stuff with shaders. The advantage of doing it this way however is that GPU particles that have physics (can bounce around the level) should fall out of the code nicely allowing for large numbers of particles.

Anyways, as I said its just a beginning for now. So far I have a level rendered with a terrain map, an explosion map (renders explosions to the texture each frame if any occurred) and a collision map which allows objects to collide. With the left mouse button you can blow holes in the terrain which in turn updates the collision map allowing the worm to move around more of the level.

![](https://www.mikecann.blog/Images/LieroXNA/lieroxna01.jpg)
