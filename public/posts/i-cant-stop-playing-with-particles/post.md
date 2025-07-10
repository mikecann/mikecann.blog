---
coverImage: /images/fallback-post-header.png
date: '2007-09-12T20:48:14.000Z'
tags: []
title: I cant stop playing with particles..
oldUrl: /c/i-cant-stop-playing-with-particles
---

<div>Well I have been at it again, tweaking and altering the particles in LieroXNA. You can see a video of my results below.</div>
+ Particles now represent the pixel they exploded from. i.e. if the terrain was green the particle is green, if it was blue the particle is blue etc.
+ Particles are now more white (hot) depending on how fast and how old they are.
+ Particles now explode in a circular direction and less randomly (looks more like an explosion).
+ Particles now have a direction from which they are exploded, at the moment is just current mouse position - last mouse position but in the future this will be used to blow particles away from a high energy collision.
+ Particles now react to the player. I realised that instead of just passing in the terrain texture to the particle update routine i could pass the entire back buffer allowing the player and any other objects in the scene to have particle reactions, yey!
+ Particles now have a bit of alpha blending to make them look a little less in focus, not sure if this works well, let me know :)

<iframe width="100%" height="400" src="https://www.youtube.com/embed/o_QgvZojDyc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
