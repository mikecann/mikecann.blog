---
coverImage: /images/fallback-post-header.png
date: "2011-04-10T09:22:38.000Z"
tags:
  - compile
  - gotcha
  - haxe
  - import
  - jquery
  - tips
title: HaXe & jQueryExtern Gotcha
oldUrl: /haxe/haxe-jqueryextern-gotcha
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ahxelogo.jpg "ahxelogo")](https://www.mikecann.blog/wp-content/uploads/2011/04/ahxelogo.jpg)

As some of you may know, I have been getting into haXe reccently. For those of you dont know what haXe is, this is taken from [haxe.org](https://haxe.org):<!-- more -->

> **haXe** (pronounced as *hex*) is an *open source* programming language
>
> While most other languages are bound to their own platform (Java to the JVM, C# to .Net, ActionScript to the Flash Player), **haXe** is a *multiplatform language*.
> I have been aware of haXe for a long time, infact I used to make extensive use of precursor to haXe, MTASC the alternative compiler for AS2\. Since the launch of AS3 however, Nicolas Cannasse of Motion-Twin has moved onto HaXe, and the project has flourished.

I have used HaXe in the past for various small projects, usually to take advantage of some of the features that the language offers Flash developers that AS3 cant offer us. Features such as [function inlining](https://haxe.org/ref/inline) and the [fast memory ops](https://haxe.org/api/flash9/memory) mean that flash developers can really get some great performance out of their libraries while at the same time still able to compile to SWC's.

Recently I have been exploring the various other targets offered by haXe, not just the flash one. Currently haXe supports the [following targets](https://haxe.org/doc/intro):

> **[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif "ul_spot2")](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif) Javascript : **You can compile a haXe program to a single .js file. You can access the typed browser DOM APIs with autocompletion support, and all the dependencies will be resolved at compilation time.
>
> **<strong>[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif "ul_spot2")](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif) **Flash :</strong> You can compile a haXe program to a .swf file. haXe is compatible with Flash Players 6 to 10, with either "old" Flash 8 API or newest AS3/Flash9+ API. haXe offers very good performance and language features to develop Flash content.
>
> **<strong>[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif "ul_spot2")](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif) **NekoVM :</strong> You can compile a haXe program to NekoVM bytecode. This can be used for server-side programming such as dynamic webpages (using mod_neko for Apache) and also for command-line or desktop applications, since NekoVM can be embedded and extended with some other DLL.
>
> **<strong>[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif "ul_spot2")](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif) **PHP :</strong> You can compile a haXe program to .php files. This will enable you to use a high level strictly-typed language such as haXe while keeping full compatibility with your existing server platform and libraries.
>
> **<strong>[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif "ul_spot2")](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif) **C++ :</strong> You can now generate C++ code from your haXe source code, with the required Makefiles. This is very useful for creating native applications, for instance in iPhone development.
>
> **<strong>[![](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif "ul_spot2")](https://www.mikecann.blog/wp-content/uploads/2011/04/ul_spot2.gif) **C# and Java</strong> targets are coming soon! (from @cwaneck)
> The target that has taken my interest recently has been Javascript.

Having recently worked in Javascript on my Chrome extensions [PostToTumblr](/posts/posttotumblrs-1628th-user-celebration/) and [ChromeCrawler](/posts/chrome-crawler-v0-4-background-crawling-more/) I have gained a better understanding of how JS works and how to code in it. Despite this however I still cant get over what I consider some "very nasty" things in the language. Lack of type safety, nested anonymous functions and lack of proper classes just have my stomach all in knots thinking about them.

So I was extremely happy to discover that haXe now targets Javascript. It meant I could write the next version of [ChromeCrawler](/posts/chrome-crawler-v0-4-background-crawling-more/) in type-safe, class-happy haxe and it would simply hide all the nastyness from me once it compiles. (You can ofcourse modify the JS that is exported if you so wish however)

So now, finally to the point of this post. I sat down to write the core functionality of the crawler. To do the URL crawling so far I had been using jQuery's get() method to load an external page.

How was I to use the jQuery library in haXe I wondered. Well thankfully this has already been thought of with the special "extern" keyword: [https://haxe.org/doc/js/extern_libraries](https://haxe.org/doc/js/extern_libraries)

Thankfully [Andy Li](https://blog.onthewings.net/) has also already provided an excellent version of the library for haXe in his [jQueryExtern](https://lib.haxe.org/p/jQueryExtern) project. Using the [haxelib](https://haxe.org/haxelib) command I downloaded the project and started coding.

It wasnt long however before I ran into a compilation issue when I tried to use the static function get() on the JQueryS class:

> <span style="color: #ff0000;">characters 2-9 : Unknown identifier : JQueryS</span>
> This confused me as no matter what I did, I couldn't get the haXe compiler to recognise the class. Having spent an evening stuck on the problem I decided to email the creator of the project [Andy Li](https://blog.onthewings.net/).

It turns out that to beable to use the JQueryS class you must first import the JQuery class:

> <span style="color: #0000ff;">import</span> <span style="color: #99ccff;">JQuery</span>;
> Low and behold that worked!

As I couldn't find the solution to this problem on a Google search I thought I would write up the solution myself so that others don't stumble on this rather singular gotcha.
