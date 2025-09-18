---
coverImage: /images/fallback-post-header.png
date: "2011-11-17T19:32:11.000Z"
tags: []
title: "Hxaria, Terraria like terrain in HaXe and WebGL"
oldUrl: /haxe/hxaria-terraria-like-terrain-in-haxe-and-webgl
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/11/head2.jpg "head2")](https://www.mikecann.blog/wp-content/uploads/2011/11/head2.jpg)

I woke up the other day thinking about Terraria. No idea why as I haven't played it in ages, but its the type of game I really enjoy so it must have snuck into my dreams during the night.

<!-- more -->

Anyways, it got my thinking if it would be possible to make something similar to it in the browser using WebGL. For those not aware of Terraria, it looks something like this:

[![](https://www.mikecann.blog/wp-content/uploads/2011/11/screen01.jpg "screen01")](https://www.mikecann.blog/wp-content/uploads/2011/11/screen01.jpg)

To produce the above you need several layers of tilemaps (background, water, foreground etc) that can potentially change every single frame (due to lighting environment effects etc). To do that at 1680x1050 at 16x16 per tile with only one layer changing each frame will be 6800 tile draws per frame.

Having calculated that I got thinking about the best way to render lots of tiles.

My first thought was to render each tile as a separate quad. That would certainty work, however it would mean that for each tile I would need 4 vertices, times that by say 4 layers that's 108,800 vertices. Its not a massive massive amount but sizable enough for me to wonder if there was a more efficient way.

My next thought was that I could share vertices by using vertex indices in a triangle-strip, that way at best each tile will only require just over one vertex per tile then arrange them in a lattice so that the vertices are shard between tiles:

[![](https://www.mikecann.blog/wp-content/uploads/2011/11/mesh_bad.png "mesh_bad")](https://www.mikecann.blog/wp-content/uploads/2011/11/mesh_bad.png)

This would then only require about 27,200 vertices which is really nice. I was hover having difficulties imagining how I would reference each tile individually in the shader so I could apply texture and color transformations and started wondering if another technique might work..

Having recently done some work with [Point Sprite Particles](/posts/terrainicles-webgl-haxe/) I knew that the GPU was really good at rendering Point Sprites. So I thought to myself, why not just make each tile a point sprite. That way I could then represent each tile as a vertex then I could pass custom properties such as texture and color to the shader as vertex buffer attributes. Doing it this way means that you only need as many vertices as there are visible tiles (about 27,200 for 4 layers) and I can reference each tile individually in the attribute buffer.

So armed with the theory I set to work bashing out some code. Having worked with raw WebGL in haXe on my last [few experiments](/posts/gpu-state-preserving-particle-systems-with-webgl-haxe/) I decided I didnt want to go through all that [pain](/posts/why-developing-for-webgl-sucks/) again just for the sake of a little more performance, so I decided to give Three.js another go in HaXe. Thankfully this time I was treading a known path so I could learn from existing threejs point-sprite particle samples. The bulk of the custom particle system logic I took from this rather excellent sample:

[![](https://www.mikecann.blog/wp-content/uploads/2011/11/Shot_01.png "Shot_01")](https://alteredqualia.com/three/examples/webgl_custom_attributes_particles.html)

([https://alteredqualia.com/three/examples/webgl_custom_attributes_particles.html](https://alteredqualia.com/three/examples/webgl_custom_attributes_particles.html))

So once I had the project setup it took me no time at all to bash out a sample that showed that I could easily have 27k+ tiles changing size and color each frame:

[/projects/Hxaria/01/index.html](/projects/Hxaria/01/index.html)

Pretty aint it?

What you are looking at is 40,000 point sprites changing to a random colour and size every frame, well above the 27k needed. As part of my testing I found that it can actually handle a lot more (hundreds of thousands) of individually updating tiles!

Im planning to continue work on this sample, my next step is to get each particle using a different tile type and changing each frame.

I have uploaded the source to github for your perousal: [https://github.com/mikecann/Hxaria](https://github.com/mikecann/Hxaria)

Enjoy!
