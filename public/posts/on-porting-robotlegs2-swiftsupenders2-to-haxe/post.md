---
coverImage: /images/fallback-post-header.png
date: "2012-06-30T11:04:25.000Z"
tags:
  - as3
  - as3hx
  - haxe
  - library
  - robotlegs
  - swiftsuspenders
title: On Porting RobotLegs2 & SwiftSupenders2 to Haxe
oldUrl: /actionscript/on-porting-robotlegs2-swiftsupenders2-to-haxe
---

[![](https://www.mikecann.blog/wp-content/uploads/2012/06/robotlegsplushaxe.jpg "robotlegsplushaxe")](https://www.mikecann.blog/wp-content/uploads/2012/06/robotlegsplushaxe.jpg)

I originally hoped that this post would be about my successful completion of a RobotLegs2 port to Haxe however something else has come up (more on that in a later post) so instead im just going to talk about the process and progress of the port thus far.

<!-- more -->

So although there is already [an excellent RobotLegs 1 Haxe port](https://github.com/DavidPeek/robothaxe) out there by David Peek, I decided I would like to try to port the brand new [Robot Legs 2 Framework](https://github.com/robotlegs/robotlegs-framework)  which offers a great many improvements over the original.

Rather than beginning the port from scratch I decided to use as3hx to take the legwork out of converting the AS3 code to Haxe code. To get the tool you must first checkout the library from its google code repo at: [https://caffeine-hx.googlecode.com/svn/trunk/projects/as3hx/](https://caffeine-hx.googlecode.com/svn/trunk/projects/as3hx/)

Once downloaded its just a simple matter of compiling the source into a neko executable:

```
haxe as3hx.hx
```

Then you can run it with:

```
neko as3hx.n
```

[![](https://www.mikecann.blog/wp-content/uploads/2012/06/screenshot_01.gif "screenshot_01")](https://www.mikecann.blog/wp-content/uploads/2012/06/screenshot_01.gif)

To convert a AS3 project give it an input and output folder:

```
neko as3hx.n -vector2array -uint2int robotlegs2 robotlegs2out
```

In this case the input folder is the source download from the [RobotLegs2 GitHub page](https://github.com/robotlegs/robotlegs-framework).

It will start to convert but will get stuck:

```
C:/Users/MikeC/Desktop/as3hx/robotlegs2/src/robotlegs/bender/extensions/eventCommandMap/api/IEventCommandMap.as
C:/Users/MikeC/Desktop/as3hx/robotlegs2out/robotlegs/bender/extensions/eventcommandmap/api/IEventCommandMap.hx
C:/Users/MikeC/Desktop/as3hx/robotlegs2/src/robotlegs/bender/extensions/eventCommandMap/impl/EventCommandExecutor.as
C:/Users/MikeC/Desktop/as3hx/robotlegs2out/robotlegs/bender/extensions/eventcommandmap/impl/EventCommandExecutor.hx
C:/Users/MikeC/Desktop/as3hx/robotlegs2/src/robotlegs/bender/extensions/eventCommandMap/impl/EventCommandFactory.as
C:/Users/MikeC/Desktop/as3hx/robotlegs2out/robotlegs/bender/extensions/eventcommandmap/impl/EventCommandFactory.hx
C:/Users/MikeC/Desktop/as3hx/robotlegs2/src/robotlegs/bender/extensions/eventCommandMap/impl/EventCommandMap.as
C:/Users/MikeC/Desktop/as3hx/robotlegs2out/robotlegs/bender/extensions/eventcommandmap/impl/EventCommandMap.hx
C:/Users/MikeC/Desktop/as3hx/robotlegs2/src/robotlegs/bender/extensions/eventCommandMap/impl/EventCommandTrigger.as
Called from ? line 1
Called from Run.hx line 66
Called from Run.hx line 55
Called from Run.hx line 55
Called from Run.hx line 55
Called from Run.hx line 55
Called from Run.hx line 55
Called from Run.hx line 55
Called from Run.hx line 38
Called from C:Motion-TwinHaxe/std/neko/Lib.hx line 63
Called from Run.hx line 29
Called from as3hx/Parser.hx line 117
Called from as3hx/Parser.hx line 131
Called from as3hx/Parser.hx line 488
Called from as3hx/Parser.hx line 415
Called from as3hx/Parser.hx line 589
Called from as3hx/Parser.hx line 794
Called from as3hx/Parser.hx line 744
Called from as3hx/Parser.hx line 919
Called from as3hx/Parser.hx line 964
Called from as3hx/Parser.hx line 1106
Called from as3hx/Parser.hx line 1016
Called from as3hx/Parser.hx line 1075
Called from as3hx/Parser.hx line 1179
Called from as3hx/Parser.hx line 330
Called from as3hx/Parser.hx line 1003
Uncaught exception - In C:/Users/MikeC/Desktop/as3hx/robotlegs2/src/robotlegs/bender/extensions/eventCommandMap/impl/Eve
ntCommandTrigger.as(75) : Unexpected .
```

It seems like as3hx is getting confused around this line in the AS3 source:

```haxe
if (describeType(mapping.commandClass).factory.method.(@name == "execute").length() == 0)
throw new Error("Command Class must expose an execute method");
```

It looks like a bit of E4X is confusing the script. To solve this sort of problem I made a note of the location and file and just commented the offending line out. This allows as3hx to get past that particular snag. After going through this process a few times the project should be fully converted.

From there I setup a project in FlashDevelop and tried to compile. After fixing a few things that as3hx couldnt solve I came accross a rather major stumbling block.

RobotLegs2 unlike RL1 has a strong dependency on the dependency injection container SwiftSuspenders. So to get RL to compile I first need to port SwiftSupenders2.

So I repeated the process above but for SwiftSuspenders. Eventually this left me with a whole load of broken unit tests. Till Schneidereit the (rather splendid) author of SwiftSuspenders wrote a great number of unit tests for the library, which is one of the reasons why its so excellent. So I knew that to achieve a proper port all I need do is pass all those tests and I can then be confident that the code is solid.

After a few evenings of toil I managed to get 50 tests to pass in the Flash target. This is quite abit shy of the 160+ tests in the original AS3 version of the library, however a great many of those tests are not relevant to Haxe such as ArrayCollection tests, XML tests and DescribeType tests. I also decided for now to remove all of the event dispatching (and thus their tests) code from the library for now due to their dependency on the Flash platform. Despite this I think the 50 tests that do pass are probably representative of the core functionality of the library.

With the Flash target passing I indented to then move onto passing the tests in the other targets (JS, C++, php etc). I was hoping that with the flash part passing that they would all pass considering that im using the inbuilt haxe reflection methods not any platform specific reflection, but alas this was not to be the case. Starting with the JS target I started to get alot of errors on some of the basic Injector tests. After some digging in the compiled JS source I traced it back to an issue in the Meta Data generation for the @Inject tag on the JS target.

Unfortunately, I have run out of time on this little side project for now so am going to have to park it. I have uploaded the progress thus far to GitHub should anyone else wish to take up the mantle on the port:

[https://github.com/mikecann/SwiftSuspendersHx](https://github.com/mikecann/SwiftSuspendersHx)
[https://github.com/mikecann/RobotLegs2Hx](https://github.com/mikecann/RobotLegs2Hx)

I had indented, once everything was passing, was to do a branch of the project and incorporate some features that only the Haxe language can support. Features such as proper generics and macros would bring some added awesome.
