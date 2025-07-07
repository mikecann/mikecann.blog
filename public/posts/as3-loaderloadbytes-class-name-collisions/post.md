---
coverImage: /images/fallback-post-header.png
date: '2009-03-17T19:26:32.000Z'
tags: []
title: AS3 Loader.loadBytes() Class Name Collisions
oldUrl: /misc/as3-loaderloadbytes-class-name-collisions
openAIMikesBlogFileId: file-KjMhcwl2gvTzwmrZzPzRLCuw
---

Well I spent hours at work today scratching my head and getting generally very annoyed over this one so I thought I would share it with the world so others can benefit from my frustrations.

Basically I wanted a method of loading a SWF as a byte array then turning the byte array back into a SWF at run-time. This is quite handily catered for in AS3 with the use of URLStream and Loader.loadBytes().

<!-- more -->

So my flow looked like:

**SWFA -> StreamURL.load("SWFB.swf")
SWFA -> Loader.loadBytes() **

So off I went and coded my solution, to my surprise it worked great. Well kinda, the problem with using loadBytes() is that you have no way of passing flashVars through to the loaded SWF like normal (see this bug report for more info: [https://bugs.adobe.com/jira/browse/FP-445](https://bugs.adobe.com/jira/browse/FP-445)).

When you inspect the root.loaderInfo.url (\_root.\_url in as2) property of the loaded swf it gives you the URL of the loader instead of the URL you want. My solution to this was to proxy the loading in another swf and then pass this swf all the params I want to go in the child swf.

So the flow looks like:

**SWFA -> Loader.load("proxy.swf?someparam=22")
ProxySWF -> StreamURL.load("SWFB.swf")
ProxySWF -> Loader.loadBytes() **

This way when you call root.loaderInfo.url from within SWFB it will give you something like: "https://www.mydomain.com/proxy.swf?someparam=22" which isnt perfect but atleast you have the params there to play with.

Unfortunately however when I implemented this nothing happened. The proxy loaded, it loaded SWFB fine, added it to the stage but nothing was displayed. No errors nothing. I found this very perplexing as the code was practically the same as before just in a different SWF.

Anyways, to cut a long story short I finally found out what was going wrong. The document class of the proxy was named "Main.as" and the document class of SWFB is was named "Main.as". I renamed one of them and suddenly bingo it worked!

What I presume was happening behind the scenes was that the Loader.loadBytes() method inspects the classnames in SWFB it see's that there is a class named Main, it checks to see if there is already a class in the loading swf called Main, yes there is so dont define the class and hence dont invoke it to contruct.

My other solution other than renaming one of the document classes was to supply a new application domain in the LoaderContext when calling loadBytes. I have provided an example below of this.

It doesnt use URLStream and a proxy.swf, rather it embeds SWFB directly in SWFA. For purposes of example it doesnt matter and still exhibits the same behaviour.

```actionscript
package
{
import flash.display.Loader;
import flash.display.Sprite;
import flash.events.Event;
import flash.system.ApplicationDomain;
import flash.system.LoaderContext;
import flash.utils.ByteArray;

public class Main extends Sprite
{
[Embed("..\lib\SWFB.swf", mimeType="application/octet-stream")] private var SWFBClass:Class;

public function Main():void
{
var ba : ByteArray = new SWFBClass() as ByteArray;
var l : Loader = new Loader();
//l.loadBytes(ba, new LoaderContext(false, new ApplicationDomain())); // This puts the classes of SWFB in a new application domain and hence no collisions with this SWF
l.loadBytes(ba); // Classes will colide when loaded and hence will not execute
addChild(l);
}
}
}
```

You can download this project here: [https://www.mikecann.blog/flash/SWFA.zip
](https://www.mikecann.blog/flash/SWFA.zip)
Although this makes sense from a flash structure point of view it would of been exceedingly helpfull if some sort of warning or error was thrown, rather than nothing atall.
