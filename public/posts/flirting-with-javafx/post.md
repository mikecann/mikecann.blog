---
coverImage: /images/fallback-post-header.png
date: "2009-12-13T21:38:03.000Z"
tags:
  - inputtie
  - java fx
  - programming
  - projects
title: Flirting With JavaFX
oldUrl: /javafx/flirting-with-javafx
openAIMikesBlogFileId: file-kWNDyXW1LdwJPHBvGsK86snY
---

For the past several months I have been working on a little project completely different to anything I have done before. Its a desktop application that uses a number of novel technologies to do something I think is pretty cool. Ill talk more about what it actually is and does in the coming weeks, but for this post I just want to talk about the struggles and discoveries I have been through and made with the technology.

<!-- more -->

One of the basic tenants of the app is that it needs to work  cross-platform, so on mac, windows, linux, etc. As my previous experience with any sort of cross-platform coding involves using Java that was my natural first choice.

It has been a while since I have coding anything substantial in Java, infact my university project [Chain Reaction](https://www.mikecann.blog/programming/java/chainreaction-binarysource-release/) was my last serious foray into the language:

![](https://www.mikecann.blog/Work/CRImages/CR01.png)

I knew that I wanted a nice rich interface for the project as it was intended to be sold to non-technical users. My first choice with Java was naturally with Swing. This, however, soon brought back various memories of 'JPanels', 'Layouts' and 'Look and Feels'  and the headaches of trying to make simple things look attractive (tho some cool advances have been made with [substance look and feel](https://www.pushing-pixels.org/)).

After having worked for years with Flash / Flex I had grown used to the ease of drawing graphics and manipulating Display Objects in the display hierarchy. I was dismayed at how difficult it was to do what I considered 'simple graphic tasks' using Java!  A simple google search for the terms "Java 2d graphics" demonstrates how old some of the concepts and documentation is on the subject.

I ended up writing and rewriting my view using different libraries like [G](https://geosoft.no/graphics/):

[![ScreenHunter_03 Dec. 13 20.05](https://www.mikecann.blog/wp-content/uploads/2009/12/ScreenHunter_03-Dec.-13-20.05.jpg "ScreenHunter_03 Dec. 13 20.05")](https://www.mikecann.blog/wp-content/uploads/2009/12/ScreenHunter_03-Dec.-13-20.05.jpg)

I found them all to be unwieldy and too inflexible for what I had in-mind. It all just seemed so archaic and old-hat.

So I was becoming more and more frustrated with myself for not progressing with the project and becoming hung up on something I had taken for granted in the Flash world. It was then that I happened to stumble across (this is after weeks of struggling) the [JavaFX project](https://javafx.com/). Now I had heard about this many months back but had dismissed it as Suns rather lame attempt to steal some of Adobe's dominance of the Flash player market (much like Microsoft's attempt with Silverlight).

As I was at the end of my line with Java I thought, hell why not give it a little look. Well it took me by surprise. It turns out that JavaFX is rather neat!

For those who havent heard f JavaFX; taken from Wikipeda:

> <address>[![javafx_logo_color_1](https://www.mikecann.blog/wp-content/uploads/2009/12/javafx_logo_color_1-300x150.jpg "javafx_logo_color_1")](https://www.mikecann.blog/wp-content/uploads/2009/12/javafx_logo_color_1.jpg)JavaFX is a software platform for creating and delivering rich Internet applications that can run across a wide variety of connected devices. The current release (JavaFX 1.2, June 2009) enables building applications for desktop, browser and mobile phones. </address> <address> </address> <address>
>
> </address><address>TV set-top boxes, gaming consoles, Blu-ray players and other platforms are planned.JavaFX is fully integrated with the Java Runtime Environment (JRE) – JavaFX applications will run on any desktop and browser that runs the JRE and on top of mobile phones running Java ME.</address>
> What this means is that you can (with a little jiggery pokery) use JavaFX with normal Java. This is great as I had already written a whole load of code in Java which I didn't want to get rid of.

The language JavaFX Script is great. It took a little getting used to as it is a declarative language (much like Flex's MXML except that instead of using XML as the language it uses a Java Script like notation) but once I was used to it I could immediately see the awesome power it brings.

A little sample of code to give you a feel of how its declarative approach works:

Stage {
    title: "Ello World"
    width: 300
    height: 300

scene: Scene {
        content: [
             Text {
               font: Font { size: 22 }
               x: 20, y: 90
               textAlignment: TextAlignment.CENTER
               content:"Ello World!"
             }
        ]
     }
}

This is your standard "Hello World" (but with a British twist):

[![ScreenHunter_06 Dec. 13 20.32](https://www.mikecann.blog/wp-content/uploads/2009/12/ScreenHunter_06-Dec.-13-20.32.jpg "ScreenHunter_06 Dec. 13 20.32")](https://www.mikecann.blog/wp-content/uploads/2009/12/ScreenHunter_06-Dec.-13-20.32.jpg)

The simplicity of rendering things to the screen was just what I was looking for as the for this project, it was a double bonus that the language is powerful.

I love some of the features of the language like the natively build in binding, the sequence manipulations, but Ill talk more about some of these features in another post as I have rambled enough in this one as it is.

For now however, if you want to do some more reading into JavaFX  I HIGHLY  this short set of tutorials: [Learning the JavaFX Programming Language - Tutorial](https://java.sun.com/javafx/1/tutorials/core/index.html)

<div id="_mcePaste" style="overflow: hidden; position: absolute; left: -10000px; top: 233px; width: 1px; height: 1px;">

**avaFX** is a [software platform](https://en.wikipedia.org/wiki/Software_platform "Software platform") for creating and delivering [rich Internet applications](https://en.wikipedia.org/wiki/Rich_Internet_application "Rich Internet application") that can run across a wide variety of connected devices. The current release (JavaFX 1.2, June 2009) enables building applications for desktop, browser and mobile phones. TV set-top boxes, gaming consoles, [Blu-ray](https://en.wikipedia.org/wiki/Blu-ray "Blu-ray") players and other platforms are planned.

JavaFX is fully integrated with the [Java Runtime Environment](https://en.wikipedia.org/wiki/Java_Runtime_Environment "Java Runtime Environment") (JRE) – JavaFX applications will run on any desktop and browser that runs the JRE and on top of mobile phones running [Java ME](https://en.wikipedia.org/wiki/Java_ME "Java ME").

**JavaFX** is a [software platform](https://en.wikipedia.org/wiki/Software_platform "Software platform") for creating and delivering [rich Internet applications](https://en.wikipedia.org/wiki/Rich_Internet_application "Rich Internet application") that can run across a wide variety of connected devices. The current release (JavaFX 1.2, June 2009) enables building applications for desktop, browser and mobile phones. TV set-top boxes, gaming consoles, [Blu-ray](https://en.wikipedia.org/wiki/Blu-ray "Blu-ray") players and other platforms are planned.

JavaFX is fully integrated with the [Java Runtime Environment](https://en.wikipedia.org/wiki/Java_Runtime_Environment "Java Runtime Environment") (JRE) – JavaFX applications will run on any desktop and browser that runs the JRE and on top of mobile phones running [Java ME](https://en.wikipedia.org/wiki/Java_ME "Java ME").</div>
