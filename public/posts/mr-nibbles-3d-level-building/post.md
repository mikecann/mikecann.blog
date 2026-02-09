---
coverImage: /images/fallback-post-header.png
date: '2014-07-04T00:58:22.000Z'
tags: []
title: Mr Nibbles 3D - Level Building
oldUrl: /mr-nibbles-3d/mr-nibbles-3d-level-building
---

As this is a level based puzzle game one of the big requirements for the project will be the ability to quickly build and test levels. In the original Mr Nibbles the levels were all 2D generated from a bitmap image where each pixel represents a single tile in the world. So for example here is level 4:

<!-- more -->

![lev](https://www.mikecann.blog/wp-content/uploads/2014/07/lev.png)

Representing the levels as a bitmap image meant that Photoshop became my level editor which allowed me to very quickly make changes and test the levels as I made them.

Obviously that scheme wont work for 3D so I started thinking about how to build levels in the editor. If you have used Unity before you will know that in addition to the actual editor they run a website called the Asset Store where users can submit tools and assets that others can use in their project. It was on there that I came across the [Tidy Tile Mapper](https://www.assetstore.unity3d.com/en/#!/content/2648):

<iframe width="640" height="360" src="https://www.youtube.com/embed/Oh1AH9N1-9E" frameborder="0" allowfullscreen></iframe>

It looked exactly what I wanted. So I bought it and started using it to build the first few levels you see in the video at the start of this post. It was while I was using it that I discovered problems in the way it works.

Firstly its slow to use both from a performance perspective and from a usability perspective. There aren't any hot keys for commonly used things and painting and removing blocks just chugs after a while. I also don't like the way the tool handles "empty" blocks which are infact real object that clutter up the hierarchy. The block editor also doesn't seem to handle some rotations. The way it handles layers is awkward and will be a pain for this game that will require many layers or axis' of movement.

In short I decided I could do better:

<iframe width="640" height="360" src="https://www.youtube.com/embed/QHCb9V0qrow" frameborder="0" allowfullscreen></iframe>

Its only a few hours work at this point and doesn't have all the features of the Tidy Tile Mapper but it has enough for me to get building my levels quickly. It works by having a "working axis" that you can paint blocks to or remove blocks from. All blocks are added as a child of a "blockmap" which efficiently stores the blocks in dictionaries for very fast lookups.

You can alter the "layer" in the working axis using the mousewheel. The on-screen rotation controls allow you to move around the level in 90 degree jumps. This is extremely handy for Mr Nibbles as trying to build the levels while maintaining the current rotation of mr nibbles as the player plays the level in my head was causing headaches!

I plan to iterate and develop it during the project. If its good enough I may release it on the Asset Store so others can benefit from my work on the tool.
