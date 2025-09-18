---
coverImage: /images/fallback-post-header.png
date: "2011-02-08T21:42:56.000Z"
tags:
  - bug
  - class
  - code assist
  - compile
  - crash
  - error
  - flash builder
  - flex
title: "1046: Type was not found or was not a compile-time constant"
oldUrl: /actionscript/1046-type-was-not-found-or-was-not-a-compile-time-constant
---

[![](https://www.mikecann.blog/wp-content/uploads/2011/02/001.jpg "001")](https://www.mikecann.blog/wp-content/uploads/2011/02/001.jpg)

Came across this little oddity the other day. Took me ages to work out what was going on, so thought I would share in case anyone else ran into the same issue.<!-- more -->

One day, for a reason I couldn't fathom, my project stopped compiling. I kept getting these odd "1046: Type was not found or was not a compile-time constant" errors all over the place. Not only that, when I tried to include the class in question either via auto-complete (control &amp; space) or via manual import the error persisted.

To cut a long story short it seems that if you try to new a member property that is of type Class from another class and the constructor takes in at least one parameter the error will occur.

So for example take the two following classes:

```actionscript
package package2
{
  import package1.MyTestClass;

    public class MyTestClass2
    {
    	public var type : Class = MyTestClass;
    }

}

```

And

```actionscript
package package1
{
  public class MyTestClass
  {
    public function MyTestClass(someVar:String)
    {
      trace(someVar);
    }
  }
}
```

Now try using them in the following fashion:

```actionscript
<?xml version="1.0" encoding="utf-8"?>;
<s:Application xmlns:fx="https://ns.adobe.com/mxml/2009"
xmlns:s="library://ns.adobe.com/flex/spark"
xmlns:mx="library://ns.adobe.com/flex/mx" creationComplete="application1_creationCompleteHandler(event)">;

    <fx:Script>;
    	<![CDATA[
    		import mx.events.FlexEvent;

    		protected function application1_creationCompleteHandler(event:FlexEvent):void
    		{
    			var class2 : MyTestClass2 = new MyTestClass2();
    			var class1 : MyTestClass = new (class2.type)("hello");
    		}

    	]]>;
    </fx:Script>;

</s:Application>;
```

And uh oh, bad times:

```
1046: Type was not found or was not a compile-time constant: MyTestClass. FlexBugExperiment.mxml /FlexBugExperiment/src/main line 14 Flex Problem

1046: Type was not found or was not a compile-time constant: MyTestClass2. FlexBugExperiment.mxml /FlexBugExperiment/src/main line 13 Flex Problem

1180: Call to a possibly undefined method MyTestClass2. FlexBugExperiment.mxml /FlexBugExperiment/src/main line 13 Flex Problem
```

The bad line is:

```actionscript
var class1 : MyTestClass = new (class2.type)("hello");
```

If you take away the "hello" part or you split it out into two lines like so:

```actionscript
var tmpC : Class = (class2.type);
var class1 : MyTestClass = new tmpC("hello");
```

Then everything is gravy

Anyway, I hope this helped someone out!
