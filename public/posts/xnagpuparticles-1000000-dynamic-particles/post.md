---
coverImage: /images/fallback-post-header.png
date: '2007-03-30T10:30:40.000Z'
tags: []
title: 'XNAGPUParticles (1,000,000 Dynamic Particles)'
oldUrl: /c/xnagpuparticles-1000000-dynamic-particles
---

![](https://www.mikecann.blog/Images/Others/particles17.png)This is another submission of work i have done in my final year. This time the project is all my own work.

The project is a continuation based on [work from before Christmas](https://www.mikecann.blog/?p=148) and is an experiment into state preserving particle systems. I started out with examining the basic particle systems such as a static system and one that updates on the CPU. I then moved onto more advanced systems such as the GPU based system described by [Lance Latta](https://www.2ld.de/gdc2004/) and others. I soon discovered however that XNA doesn't support "uber buffers" and as such had to invent a new solution using vertex textures. The result is a particle system written in XNA that is able to update and render 1,000,000 particles at about 22 frames a second with 4 forces.

<!-- more -->

To view this demo you first need to have the XNA runtimes. If you dont have those just go [HERE](https://xnamatrix.com/xnareq.php).[![](https://www.mikecann.blog/Images/Others/particles18.png)](./Images/Others/particles18.png)

Once installed you can grab the binary for this project [https://www.mikecann.blog/Work/XNAGPUParticles.zip](https://www.mikecann.blog/Work/XNAGPUParticles.zip)

If you are interested in seeing the source code for this project, just drop me an email: mike.cann@gmail.com

Oh also, the written report for this can be found [https://www.mikecann.blog/Work/GPUParticles2003.doc](GPUParticles2003.doc)

<iframe width="100%" height="400" src="https://www.youtube.com/embed/Avxrg1YavBIg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
