---
coverImage: /images/fallback-post-header.png
date: "2011-10-21T17:36:42.000Z"
tags:
  - flash
  - javascript
  - opengl
  - rant
  - textures
  - threejs
  - webgl
title: Why Developing for WebGL Sucks!
oldUrl: /programming/why-developing-for-webgl-sucks
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/10/head02.png "head02")](https://www.mikecann.blog/wp-content/uploads/2011/10/head02.png)

For some time now I have been working with WebGL and have developed a sort of love/hate relationship with it. I love the ability to instantly target millions of people with GPU accelerated code without any plugins or barriers (excluding the targets that dont support it). However as a developer, writing code that takes advantage of WebGL kinda sucks.

<!-- more -->

## Procedural Based

First off is the way you have to structure your GL calls. For example take a look at the following generic bit of webGL harvested from the net:

```js
texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.FLOAT, new Float32Array(pix));
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

texture1 = gl.createTexture();
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, texture1);
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 64, 64, 0, gl.RGB, gl.FLOAT, new Float32Array(pix1));
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

FBO = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
FBO1 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
  alert(err + "FLOAT as the color attachment to an FBO");
```

All it does is create a couple of textures, setting their starting values and creates two frame buffers for rendering to. Its just it looks complicated and difficult to understand.

GL works on a procedural basis, so you tell GL that you are about to work on something by calling a function like "bindTexture()" then on the next line you perform an operation on it such as "pixelStorei()". Now this may have made perfect sense back when we were writing everything in C which is procedural anyway however this is Javascript (or haXe in my case) which is an Object based language, code like this is difficult to understand and follow.

The procedural nature of WebGL means you have to be much more careful about unsetting things you have previously set. For example if you bind a texture to perform some operation, you must then remember to unbind it else you could inadvertently cause operations to be applied to it on subsequent calls elsewhere in your codebase. It this 'hidden state' that has caused me alot of headaches when developing my samples.

The principal behind WebGL was to provide a very low-level library which other developers can build upon to build more complex and abstracted libraries. And there are numerous libraries out there. I personally have tried several of them including the very popular [three.js](https://github.com/mrdoob/three.js/). Three.js is great for doing common things like loading models and putting quads on the screen. I however encountered a problem with render targets which I struggled with for days before I discovered that you had to set "needsUpdate" to true on your texture before using it. In the end I decided to drop three.js beacuse of another issue I encountered and instead attempt to reduce my complications by working with webGL directly.

Flash11's Stage3D has the same philosophy as webGL, to provide a low level API for other developers to build libraries upon. The thing is Flash11's low-level API makes more sense and is more readable. For example the following to me is much more readable than its webGL equivalent:

```js
texture = c.createTexture(logo.width, logo.height, Context3DTextureFormat.BGRA, false);
texture.uploadFromBitmapData(logo);
```

The Stage3D API also uses language like "upload" to let you know when you are transferring data to the GPU, for a new comer to GL you have no clue when things are going to the GPU. Its small things like this that reduce the "WTF?" factor when tackling the tricky world of hardware-accelerated 3D programming.

## Cross-domain textures

This one cropped up around July time this year and took me ages to work out what was going on. For some inexplicable reason (or so it seemed) my code one day stopped working. When I looked for demo code online it all worked fine, however when I downloaded it and run it locally it also didnt work. I was getting errors like the following:

<span style="color: #ff0000;">Uncaught Error: SECURITY_ERR: DOM Exception 18</span>
<span style="color: #ff0000;">Uncaught Error: SECURITY_ERR: DOM Exception 18</span>
<span style="color: #ff0000;">Uncaught Error: SECURITY_ERR: DOM Exception 18</span>
<span style="color: #ff0000;">Uncaught Error: SECURITY_ERR: DOM Exception 18</span>
<span style="color: #ff0000;">Uncaught Error: SECURITY_ERR: DOM Exception 18 </span>

I was so baffled that [I posted about it](https://haxe.1354130.n2.nabble.com/WebGL-amp-Textures-td6638378.html) on the HaXe mailing list asking for help, thinking it was something I was doing wrong with HaXe. It turns out (after much wall-head-butting) this was a change that they brought into Chrome 13 and Firefox 5 to combat a security problem when using shaders that use textures from a different domain to the one running the code:

[https://blog.chromium.org/2011/07/using-cross-domain-images-in-webgl-and.html](https://blog.chromium.org/2011/07/using-cross-domain-images-in-webgl-and.html)

Now I have no problem with cross-domain issues, im used to this from Flash where we have the same sort of setPixel() restrictions on cross-domain BitmapData's. The thing is, it appears that this restriction applies when running code locally too. So If you are developing something on your local machine and trying to access a texture from disk it throws the same security errors because the browser thinks you are reaching across domains to access the image.

At the time the only way to get around this was to create your own webserver that you run on localhost to server up the files. So to do that I had to download python so I could run a simple localhost commandline webserver from my bin directory. What an effort! There may be easier ways these days to solve it but at the time it really frustrated me and formed yet another barrier to developing webGL.

## No Error Messages

This is by far the most annoying thing about developing for WebGL. So many times I have been trying to write something that I know SHOULD work but for some reason it doesn't. I dont get any error messages, nothing. It makes writing something from scratch neigh on impossible.

In my last post "[GPU State Preserving Particle Systems with WebGL &amp; HaXe](/posts/gpu-state-preserving-particle-systems-with-webgl-haxe/)" I started with an idea. I attempted to code it 'bottom-up'. That is start with nothing and then add more code until I reached what I wanted. Unfortunately having no error messages in WebGL makes this very difficult indeed. I would spend some time writing something really simple, like trying to get a textured quad to render on the screen only to find I get nothing. I double check my camera matrices my vertex and texture buffers, my shader and still nothing. Eventually I found that I hadn't bound something first before trying to operate on it _sigh_

In the end I found the best way to get anywhere is to go from the other direction, a 'top-down' method. Start with something kind of simmilar to what you want then cut bits out one line at a time until you get what you want. Its extremely time consuming and frustrating, but its less frustrating than going from the other way.

[![](https://www.mikecann.blog/wp-content/uploads/2011/10/1-Trace.gif "1-Trace")](https://www.mikecann.blog/wp-content/uploads/2011/10/1-Trace.gif)

There are tools out there that help with debugging what is going wrong. Namely the [WebGL Inspector](https://www.google.co.uk/url?sa=t&rct=j&q=webgl%20inspector&source=web&cd=1&ved=0CBwQFjAA&url=http%3A%2F%2Fbenvanik.github.com%2FWebGL-Inspector%2F&ei=9EWhTsHdAtSJhQe7hv3jBA&usg=AFQjCNElgWdAeKcNOnrDFrSnr6rbCLUcWg) (see above) is intended to provide gDEBugger / PIX like debugging information about what is going on inside webGL. Its a clever bit of tech, it lets you inspect buffers and traces each gl call, however it suffers from the same underlying problem of having no errors. You setup a buffer incorrectly and what you get is "INVALID_VALUE". No indication as to which of the values is invalid or what part of the call you messed up on :(

## Googling Doesn't Help

If you do happen to get an error message (unlikely) or you word your problem in a sufficiently succinct and googaleble way you will then run into the next big problem with WebGL; theres very few people using it. Now I know I am likely to be flamed for that comment, but it just seems that way to me. Whenever I tried to google my problem, or google for what I was trying to achieve (because working bottom-up doesnt work) there would be a very sparse smattering of relevant posts. Usually the results are forum posts and are OpenGL not WebGL related and are from 5-10 years ago.

## But..

Now having just ranted on for several hundred words about why it sucks im going to finish it off by saying that im going to continue to develop for WebGL using haXe regardless. Why? Well I just like making pretty things that run fast and GPGPU programming appeals to me for some unknown (likely sadistic) reason.
