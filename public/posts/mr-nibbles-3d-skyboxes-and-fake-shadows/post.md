---
coverImage: /posts/mr-nibbles-3d-skyboxes-and-fake-shadows/cover.jpg
date: '2014-07-09T07:16:04.000Z'
tags:
  - game
  - mobile
  - nibbles
  - shadows
  - skybox
title: Mr Nibbles 3D - Skyboxes and Fake Shadows
oldUrl: /mr-nibbles-3d/mr-nibbles-3d-skyboxes-and-fake-shadows
---

After that [short interlude](https://www.mikecann.blog/myprojects/unityasteroids/unity-ashteroids-ash-framework-in-unity/) im back to games development. This time its more work on Mr Nibbles 3D.

<!-- more -->

I decided to experiment with Skyboxes. I have never worked with them in Unity so I didn't know how hard they would be to get working. I shouldn't have been worried, as with most thing in Unity, it was a piece of cake. Unity even ships with some default Skyboxes so I chucked one of those in.

<iframe width="640" height="360" src="https://www.youtube.com/embed/oHtBht-4xpQ" frameborder="0" allowfullscreen></iframe>

In the above video I also demonstrate another thing I worked on, shadows. Unfortunately realtime shadows are a Unity Pro feature which I currently don't own so I decided to have a go at faking shadows.

Its surprisingly simple, I just cast a ray in the direction of gravity from Mr Nibbles until it collides with a tile, when that happens I place a "shadow" sprite:

![screenshot_011](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_011.png)

The further the distance from ray to collision the lower the alpha transparency value to indicate a fainter shadow. Its surprising how much more realism this instantly adds to the game.

This method does however have its problems. Such as when Mr Nibbles overhangs a cliff:

![screenshot_012](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_012.png)

You can see the problem in the screenshot above, Mr Nibble's shadow should wrap around the tile rather than hang in the air. One solution to this which I experimented with is to use projectors. Projectors are like light sources but in reverse, they cast shadows onto the scene. By placing one so that it followed Mr Nibbles and pointed in the direction of gravity you could create the effect of a shadow:

![screenshot_013](https://www.mikecann.blog/wp-content/uploads/2014/07/screenshot_013.png)

You can see that the shadow no longer overhangs the tile as it is cast directly when rendering rather than being a separate game object. Unfortunately it turns out that for this to work you cannot cast onto Transparent textures, and as all the tiles in Mr Nibbles must support transparency so that they can fade out when Mr Nibbles obscures them this technique could work.

Oh well. Ill have to wait till I have the pro version of Unity to implement dynamic shadows, either that or I can try to write some code to minimize the overhang problem.
