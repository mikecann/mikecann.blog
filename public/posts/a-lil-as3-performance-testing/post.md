---
coverImage: /images/fallback-post-header.png
date: '2008-05-01T20:47:11.000Z'
tags: []
title: A lil AS3 Performance Testing
oldUrl: /actionscript/a-lil-as3-performance-testing
---

While i have been thinking about what im going to work on for my next flash game i have decided to look abit into whether doing destructible landscapes is now feasible with the new (ish) bitmap abilities.

Because of my earlier work on destructible landscapes on [LieroXNA ](https://www.mikecann.blog/?p=208)i know where the potential performance bottlenecks lie.

One of these is the reading of the pixel data to perform collision checks. This has to be quick as all the objects must check each frame to see if they collide with the terrain and potentially more than one "lookup" must happen to do this (pixel perfect collisions).

<!-- more -->

So before i dive into this potentially hazardous project i have decided to do a little performance checking to see which method would be the best.

My reasoning is i can either:

A - check the pixel data of a BitmapData object using getPixel or getPixel32

B - store the collision data in an Array which may allow for faster reading.

C - instead of using an array use a ByteArray which may be even quicker

So to test which of these methods is quicker i wrote this quick thing in FlashDevelop:

```
public class Main extends Sprite

             {

              public function Main():void

              {



               // Vars

               var i : int;

               var j : int;

               var x : int;

               var y : int;

               var w : int = 500;

               var h : int = 500;

               var reps : int = 50;

               var n : int = w * h;

               var tmp : int;

               var tmp2 : uint;

               var t : cTimer = new cTimer();

               var ba : ByteArray = new ByteArray();

               var a : Array = new Array();

               var bm : BitmapData = new BitmapData(w, h, false);

               var tbm : BitmapData = new BitmapData(w, h, true);







               trace("");

               trace("");

               trace("----- WRITE TESTS -----");



               // Write byte array test

               t.start();

               for (i = 0; i < n; i++) { ba.writeByte(cMath.rndRange(0, 255)); }

               t.update();

               trace("BYTE ARRAY: " + t._time);



               // Write array test

               t.start();

               for (i = 0; i < n; i++) { a[i] = cMath.rndRange(0, 255); }

               t.update();

               trace("ARRAY: " + t._time);







               trace("");

               trace("");

               trace("----- READ TESTS -----");





               // Read byte array test

               t.start();

               for (i = 0; i < reps; i++)

               {

                for (y = 0; y < h; y++)

                {

                 for (x = 0; x < h; x++)

                 {

                  tmp = ba[(y * w) + x];

                 }

                }

               }



               t.update();

               trace("BYTE ARRAY: " + t._time);





               // Read array test

               t.start();

               for (i = 0; i < reps; i++)

               {

                for (y = 0; y < h; y++)

                {

                 for (x = 0; x < h; x++)

                 {

                  tmp = a[(y*w)+x];

                 }

                }

               }

               t.update();

               trace("ARRAY: " + t._time);







               // Read bitmap test

               t.start();

               for (i = 0; i < reps; i++)

               {

                for (y = 0; y < h; y++)

                {

                 for (x = 0; x < h; x++)

                 {

                  tmp2 = bm.getPixel(x, y);

                 }

                }

               }

               t.update();

               trace("BITMAP: " + t._time);









               // Read bitmap test

               t.start();

               for (i = 0; i < reps; i++)

               {

                for (y = 0; y < h; y++)

                {

                 for (x = 0; x < h; x++)

                 {

                  tmp2 = tbm.getPixel32(x, y);

                 }

                }

               }

               t.update();

               trace("TRANSPARRENT BITMAP: " + t._time);





              }

             }
```

And it kicks out these values:

````
----- WRITE TESTS -----

BYTE ARRAY: 219

ARRAY: 165

----- READ TESTS -----

BYTE ARRAY: 1337

ARRAY: 1331

BITMAP: 1747

TRANSPARRENT BITMAP: 1779
```

So as you can see it looks like the ByteArray and the Array are about as fast as each other as is the Bitmap read and Transparrent Bitmap read.

You can grab this project here: [https://www.mikecann.blog/Files/Destructable.zip](https://www.mikecann.blog/Files/Destructable.zip)
````
