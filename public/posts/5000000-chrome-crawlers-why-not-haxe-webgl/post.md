---
coverImage: /images/fallback-post-header.png
date: "2011-08-11T20:38:13.000Z"
tags:
  - chrome
  - code
  - crawler
  - glsl
  - haxe
  - particles
  - sprites
  - stateless
  - webgl
title: "5,000,000 Chrome Crawlers? Why not [haXe & WebGL]"
oldUrl: /glsl/5000000-chrome-crawlers-why-not-haxe-webgl
---

Following on from my previous experiments into the world of [haXe and HTML5](/posts/more-html5-haxe-speed-tests/) I have been playing around again with trying to get as many 2D sprites on screen as I can.

<!-- more -->

I started by reading some posts by google on how to render things fast in HTML5, and it got me thinking. Where I was likely going wrong with my[ HaXe + Three.js experiments](/posts/chrome-crawler-haxe-three-js-webgl-and-2d-sprites/)Â was that I was making aÂ separateÂ draw call to WebGL for each and every crawler. Draw calls are expensive and hence I was reaching the draw call bottleneck at just 2000 sprites being rendered at once.

What I needed to do was batch the draw calls together and render them at once. I knew from my work on XNA you could group sprite render calls together quite nicely. So I started off coding up a WebGL equivillant of SpriteBatch from XNA. Â I managed to get it kind-of working but as is often the way another thought struck my brain, and I decided to tackle that instead.

My thought was; why not just render everything as 2D point sprites? I remembered from my XNA days you [could achieve quite staggering numbers](/posts/xnagpuparticles-1000000-dynamic-particles/) of 2D sprites in DirectX by using point spites.

So after a little bit of fiddling and hacking I managed to get point sprites correctly rendering:

<iframe width="100%" height="400" src="https://www.youtube.com/embed/KhIT9yNEb8g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

You can play with it here:Â [/projects/HTML5SpeedTests/HaXeWebGL/bin/](/projects/HTML5SpeedTests/HaXeWebGL/bin/)

The great thing about point sprites is that I only use one draw call per frame and the GPU is very good at rendering them. The only bottleneck really is the number of pixels you need to draw. With that in mind if you drop the size of the point sprite down to 1x1 you can render a very large (5million) points at interactive framerates (18fps):

[![](https://www.mikecann.blog/wp-content/uploads/2011/08/000000000000002.jpg "000000000000002")](https://www.mikecann.blog/wp-content/uploads/2011/08/000000000000002.jpg)

I added a "dont use texture" option just out of interest to see how expensive the texture lookup in the fragment shader was, it didnt seem have much of an effect.

There are a fewÂ caveatsÂ to using point sprites:

Firstly in [WebGL has a limit](https://github.com/mrdoob/three.js/issues/293) on how large you can make them currently it differs between graphics cards and browsers, a safe minimum is 64x64 so this means you cant have them and bigger and still want it to work in all situations.

Secondly, and this one is more important I cheated to get the numbers above. In my other experiments with haXe and WebGL I was using the CPU to update the positions of the crawlers each frame, having them bounce off the screen edges. In this point sprites demo however I have the points flowing out of a fountain, the simulation of which is entirely calculated on the GPU.Â The reason for this I talked about in a paper I wrote for a university project 4 years ago:

[![](https://www.mikecann.blog/wp-content/uploads/2011/08/Shot_07.png "Shot_07")](https://www.mikecann.blog/wp-content/uploads/2011/08/Shot_07.png)

If IÂ wasn'tÂ to perform the upates on the GPU but instead just use the CPU to update the crawlers that would mean the javascript (CPU) would need to update 5million crawlers each frame then re-upload the point sprite positions back to the GPU for rendering. This would obviously be a bad idea.

So I kind of cheated. The fountain simulation on the GPUÂ isn'tÂ the same as my other examples. The crawlersÂ don'tÂ bounce off the side of the screen. To make that that happen each crawler needs to somehow preserve its state between frames.

Currently each crawler's position is calculated in the vertex shader each frame like so:

```glsl
attribute float maxAge;
attribute float startingAge;
attribute float velX;
attribute float velY;

uniform float uTime;
uniform float uPointSize;

varying float invAgeRatioSq;

void main(void)
{
  float age = mod(uTime+startingAge, maxAge);
  float ageRatio = age / maxAge;
  float invAge = 1.0 - ageRatio;
  invAgeRatioSq = 1.0 - (ageRatio \* ageRatio);

  gl_Position = vec4((-velX*ageRatio*0.8), (velY*ageRatio)+(-0.4*age*ageRatio)-0.5, 0., 1.);

  gl_PointSize = uPointSize;
}

```

To preserve state between frames I need to use textures to record each crawlers position and velocity, then using Vertex Texture Fetch aÂ verticesÂ position can be calculated.

That however will have to wait for another evening ;)

I have uploaded the source for this project here incase anyone was interested:

[/projects/HTML5SpeedTests/HTML5SpeedTests_2.zip](/projects/HTML5SpeedTests/HTML5SpeedTests_2.zip)

I warn you its ugly and uncommented, however it should be enough of a start for anyone looking to do somethingÂ similar.
