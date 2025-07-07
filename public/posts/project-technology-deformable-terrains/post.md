---
coverImage: /images/fallback-post-header.png
date: "2007-12-05T22:25:38.000Z"
tags: []
title: Project Technology (Deformable Terrains)
oldUrl: /c/project-technology-deformable-terrains
openAIMikesBlogFileId: file-QDhs3Zb6XQtNeC3OKp5kqA65
---

Well i got asked a question [in a comment](https://www.mikecann.blog/?p=208#comment-1333) on how the terrains work in the LieroXNA project so I thought i would do a quick post on this rather than reply in the comments.

The way the terrains work has changed a few times over the course of development of the project for various reasons mostly related to the incompatabilities of the 360 and my previous methods. I wont go into those previous methods here but if anyone reading this has any questions dont hesitate to ask in a comment or email me. I would also like to say this may not be the most efficient method as I was only getting the terrains up as a proof of concept first then was planning on refining later.

<!-- more -->

Before i can explain how the terrain is deformed i must first talk about how the terrain is composed. There are currently three layers to the level, an indestuctable layer, a destructable layer and a background layer.

![](https://www.mikecann.blog/wp-content/uploads/2007/12/test02_destr.png)

Destructable Layer

![](https://www.mikecann.blog/wp-content/uploads/2007/12/test02_indestr.png)

Indestructable Layer

There is also a "destroyed mask" that is used to create areas at the start that have already been destroyed. This is mainly used so that you dont have to burrow for ages at the start to get to your opposition. Combined together you end up with the final result below.

![](https://www.mikecann.blog/wp-content/uploads/2007/12/tempmask01.png)

Destroyed Mask

![](https://www.mikecann.blog/wp-content/uploads/2007/12/test03_final.png)

Final Result

Each texture layer at the moment is 2048x2048 (which is the maximum texture resolution the 360 supports) and is in the format Color (8bpp). The indestructable and the destructable layer are then sent to the GPU for use in rendering and particle collisions by the GPU particle system.

Objects such as players and weapons that are updated by the CPU however cannot perform collision checks on a texture that is on the GPU (without calling getData() which causes read-back which is horribly slow). So the destructable and the instructable layers are duplicated in the initial load of the level and saved as a large two dimensional array of Colors on the CPU.

You may ask why waste memory by storing the full Color component on the CPU when only a single bit is required per pixel to determaine if the terrain is solid or not. The reason for this is that by storing the full color component exploded particles can become the colour of the terrain that they exploded from rather than all of them being the same color.

When an explosion occurs a few things need to take place to make the terrain deform correctly. A hole of the correct size must be cut away from the Texture on the GPU so that the particles react correctly to the deformed terrain, also this new hole must be mirrored in the collision data on the CPU so that the player doesnt collide with things they think are destroyed terrain.

Another 2048x2048 "explosion map" texture is used to handle the deformation of the GPU texture. A series of explosion masks have been created that represent each explosion size:

![](https://www.mikecann.blog/wp-content/uploads/2007/12/explosion32.png)

Exp32

![](https://www.mikecann.blog/wp-content/uploads/2007/12/explosion64.png)

Exp64

           ![](https://www.mikecann.blog/wp-content/uploads/2007/12/explosion128.png)

Exp128

When an explosion occurs it is added to a list of other explosions that have occured that frame. When the render of the level is called the list of explosions that have happened that frame are iterated through and rendered to the 2048x2048 "explosion map" map texture in the correct world location that the explosion occured. This "explosion map" is then passed to a texture render shader which using render targets updates the terrain texture:

```
float4 PixelShader(float2 texCoord : TEXCOORD0) : COLOR0

{

float4 outCol = float4(1,0,0,0);

float4 explosinCol = tex2D(ExplosionSampler, texCoord);

if (explosinCol.x!=0)

{

outCol = tex2D(TextureSampler, texCoord);

}

float4 indestr = tex2D(IndestructableSampler, texCoord);

if (indestr.w!=0){ outCol = indestr; }

return outCol;

}
```

Note how the shader takes into account the indestructable layer so that the explosion doest destroy parts of the indestructable level.

The CPU collision data 'texture' is updated at the time of the explosion. When game loads each explosion mask is duplicated on the CPU much in the same way the indestructable and the destructable layers are. When an explosion occurs each pixel in the CPU explosion mask is compared against the CPU destructable layer and depending if the pixel is "indestructable" or not the pixel is set to be destroyed.

If you remember from back at the start I talked about the "Destroyed Mask" but didnt explain how it destroyed the terrain. Well it basically acts as a large explosion mask. At the init of the level the Destroyed Mask is rendered to the "explosion map" giving it an initial destroyed appearence. The same is applied to the CPU.

And thats about it for how the terrain deformation works in the project at the moment. As i said i played around with many differnt ways of doing it including negative rendering and methods that dont involve using a 2048x2048 temporary buffer texture but for now this is the method that it uses.
