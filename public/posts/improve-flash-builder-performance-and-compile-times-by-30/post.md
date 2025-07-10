---
coverImage: /images/fallback-post-header.png
date: "2012-08-15T18:56:59.000Z"
tags: []
title: Improve Flash Builder Performance and Compile Times by 30%
oldUrl: /actionscript/improve-flash-builder-performance-and-compile-times-by-30
---

I spend most of my working day and sometimes my evenings and weekends coding in Flash Builder. Flash Builder is the main professional codingÂ environmentÂ for Actionscript and MXML and is sold by Adobe.

<!-- more -->

Its fairly okay as an IDE, not the best but not the worst also. I wont go into all of Flash Builders' problems (I would be here forever) but instead want to talk about one key way you can improve your efficiency when working in Flash Builder.

Firstly the testÂ environmentÂ :

[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_01.gif "screenshot_01")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_01.gif)

Its a pretty beasty machine, the project and flash builder folders are sat on an SSD drive.

I have two projects to test these compile times with. Using [RichCodeAnalyser](https://www.richanalysis.net/richcodeanalyser):

**Project A**
[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_07.gif "screenshot_07")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_07.gif)
1670 Classes, 188,771 Lines

**Project B**
[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_06.gif "screenshot_06")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_06.gif)
2386 Classes, 135,647 Lines

Both projects have a mixture of MXML and AS files as well as employing several .swc libraries.

Ill be testing two different scenarios. 1 complete build from clean. 2\. a single line change in the Main class. Ill run each test three times and take the average. I close FB down between projects justÂ in-caseÂ there is any memory caching limiting the performance. All builds are built in debug mode using various different Flex SDK versions.

So using the vanilla install of Flash Builder 4.6:

[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_02.png "screenshot_02")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_02.png)

Not a good start. The two projects wont even compile. They get so far through the build then crash, not just the compiler but the entire IDE itself, ugh!

So the first improvement is to up the amount of memory that Flash Builder has. Incredibly Â (in this day and age) you have to manually do this, itÂ isn'tÂ built into Flash Builder (which is built on Eclipse). So to do this you need to edit the FlashBuilder.ini found (on my machine) at:

```

C:Program Files (x86)AdobeAdobe Flash Builder 4.6FlashBuilder.ini

```

The main setting for the amount of memory is "-Xmx512m" which sets the maximum value of the heap to 512Mb. So to give FB more memory set that to:

```


-Xmx1024m

```

If you try to set it any higher than this then FB either wont start or will crash at some point. This is to do with the maximum addressable memory when running the 32bit JVM (which FB uses).

Okay with that value tweaked, I ran the tests again:

[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_03.png "screenshot_03")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_03.png)

Great so now we have some baseline figures to compare against lets apply the major speed boost.

From Wikipedia:

> JRockit, a proprietary Java Virtual Machine (JVM) originally developed by Appeal Virtual Machines and acquired by BEA Systems in 2002,[1] became part of Oracle Fusion Middleware in 2008.
>
> The JRockit code base and the HotSpot virtual machine from Sun Microsystems (now Oracle) are currently being integrated, with the target of releasing a JVM with a combined code base around the release date of JDK 8.
>
> JRockit was made free and publicly available in May 2011.
>
> Many JRE class files distributed with JRockit exactly replicate those distributed with HotSpot. JRockit overrides class files which relate closely to the JVM, therefore retaining API compatibility while enhancing the performance of the JVM.

Faster JVM is the critical part here as both eclipse and the Flex compiler rely on it. You can grab it over on oracle's website: [https://www.oracle.com/technetwork/middleware/jrockit/downloads/index.html](https://www.oracle.com/technetwork/middleware/jrockit/downloads/index.html)

You will want the 32bit installer, download and install. Once installed go to the install directory for the JDK, inside there is a JRE folder:

[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_05.gif "screenshot_05")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_05.gif)

Copy it, now open up the Flash Builder install directory, rename the jre folder in there to something and copy in the jrocket jre:

[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_032.gif "screenshot_03")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_032.gif)

And thats it. Now Flash Builder will use the JRocket JVM for the IDE and for compiling. Okay so running the tests again we get:

[![](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_04.png "screenshot_04")](https://www.mikecann.blog/wp-content/uploads/2012/08/screenshot_04.png)

Nice! Thats a 27.5% improvement for a clean build on project A and 27.3% improvement for project B. For a single line change its 35.7% improvement for Project A and a 22.3% improvement for Project B.

Hope this helps some peoples out, I just wish I had known about this years ago!
