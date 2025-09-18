---
coverImage: /images/fallback-post-header.png
date: "2010-08-16T19:44:06.000Z"
tags:
  - as3
  - as3signals
  - bug
  - code
  - dictionary
  - puremvc
  - robotlegs
title: "AS3, Dictionary & Weak Method Closures"
oldUrl: /actionscript/as3-dictionary-weak-method-closures
---

This is going to be a technical post so those of you not of the code persuasion look away now..

Okay great, now those guys have gone I can get down to it.

<!-- more -->

Some of my recent work on the [SWFt project](https://swft.co.uk/) has revolved around the use of [Robert Penners AS3Signals](https://robertpenner.com/flashblog/). If you dont know what Signals are I strongly reccomend that you check out Roberts blog for more info. In brief, they are an alternative to the Events system found in Flash, based on the Signal / Slot pattern of Qt and C# they are much faster and more elegant (my opinion) than native events.

I have been trying to incorporate signals in SWft for both the elegance and performance gains that they bring, however there is an issue that was brought to my attention by Shaun Smith on the mailing list. The issue is that my current use of them will cause memory leaks.

I realised that this too would apply to the work I had been doing using the RobotLegs and Signals libraries. RobotLegs (for those of you that dont know) is an excellent Dependency Injection framework inspired by the very popular PureMVC framework. I have [blogged](/posts/on-the-bleeding-edge/) before [about](/posts/robotlegs-mvcs-relationship-diagram/) its [excellence](/posts/swft-dependency-injection-component-based-game-framework/). Signals have been incorporated into RobotLegs as a separate 'plugin' by [Joel Hooks in the form of the SignalCommandMap](https://joelhooks.com/2010/02/14/robotlegs-as3-signals-and-the-signalcommandmap-example/). The SignalCommandMap does as the name implies, it allows you to map signals to commands so that whenever a mapped signal is dispatched then the corresponding command is executed.

Its a very nice, elegant, solution to RIA development. However there is one catch. I have so far been using signals such as:

```

public class MyMediator extends Mediator
{
	// View
	[Inject] public var view : MyView;

	// Signals
	[Inject] public var eventOccured : ViewEventOccuredSignal;
	[Inject] public var modelChanged : ModelChangedSignal;

	override public function onRegister():void
	{
		view.someSignal.add(eventOccured.dispatch);
		modelChanged.add(onModelChanged);
	}

	protected function onModelChanged()
	{
		view.updateView();
	}
}

```

So here we can see a typical use of Signals in a mediator. There are two things going on here that are of concern, lets break them down.

Firstly on line 12 we are listening to a signal on the view, then passing on the event directly to an app-level event, notice how nice and clean this is, this is what I love about using RL &amp; Signals. Line 13 we are listening for an app-level signal for a change on the model then updating the view to reflect this.

It all looks well and good but unfortunately in its current state it could cause a memory leak. This is because we are listening to events on signals without then removing the listen. For example, we are listening to the app-level event on line 13 "modelChanged.add(onModelChanged);" so now the "modelChanged" signal has a reference to this Mediator. This will cause a leak when the View is removed from the display list. Normally the mediator would also be make available for garbage collection, however, because the singleton Signal has a reference to the Mediator it cannot be removed.

The same goes for line 12\. Suppose the "ViewEventOccuredSignal" that is injected is not a singleton and is swapped out for another instance it could not be garbage collected as the "view.someSignal" has a reference to its dispatch function.

Realising this problem I knew that the solution was simply to be careful and add a "onRemoved" override function in my Mediator then clean up by removing the signal listeners. However I like the simplicity and beauty of current way of doing things so I started to wonder if there was another way.

I started thinking about whether I could use weak references with the Signal. If I could then I wouldnt have to worry about cleaning up as the Signal wouldnt store any hard-references to the functions and so the listener would be free for collection. After some digging however I realised that there was no option for weak listening in Robert Penners AS3Signals.

I thought to myself why the hell not? I knew that the Dictionary object in AS3 has an option to store its contents weakly so I thought so long as you don't require order dependant execution of your listeners it should be possible to store the listener functions in a weakly referenced Dictionary.

It was at this point that I noticed Roberts post on the subject of weakly referenced Signals: [https://flashblog.robertpenner.com/2009/09/as3-events-7-things-ive-learned-from.html](https://flashblog.robertpenner.com/2009/09/as3-events-7-things-ive-learned-from.html). In it he references Grant Skinners post concerning a bug with storing functions in a weakly referenced Dictionary.

From Grant's post:

> Note that there is a known bug with Dictionary that prevents it from operating correctly with references to methods. It seems that Dictionary does not resolve the method reference properly, and uses the closure object (ie. the "behind the scenes" object that facilitates method closure by maintaining a reference back to the method and its scope) instead of the function as the key. This causes two problems: the reference is immediately available for collection in a weak Dictionary (because while the method is still referenced, the closure object is not), and it can create duplicate entries if you add the same method twice. This can cause some big problems for things like doLater queues.
> This was starting to look bad for my idea. Me being me however, I thought I knew better, and that post was written pre Flash 10 so I thought to myself: perhaps its been fixed in Flash 10\. So I set to work coding a simple example.

I created a very simple Signal dispatcher:

```

package
{
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	public class SimpleDispatcher
	{
		protected var _listeners : Dictionary;

		public function SimpleDispatcher(useWeak:Boolean)
		{
			_listeners = new Dictionary(useWeak);
		}

		public function add(f:Function) : void
		{
			_listeners[f] = true;
		}

		public function dispatch() : void
		{
			for (var o:* in _listeners)
			{
				o();
			}
		}
	}
}

```

And a very simple listening object:

```

package
{
	public class SimpleListener
	{
		public function listen(d:SimpleDispatcher) : void
		{
			d.add(onPing);
		}

		protected function onPing() : void
		{
			trace(this+" - ping");
		}
	}
}

```

And then a simple Application to hook it all together:

```

<?xml version="1.0" encoding="utf-8"?>
<s:Application xmlns:fx="https://ns.adobe.com/mxml/2009"
xmlns:s="library://ns.adobe.com/flex/spark"
xmlns:mx="library://ns.adobe.com/flex/mx">

    <fx:Script>
    	<![CDATA[
    		import mx.controls.List;

    		protected var _dispatcher : SimpleDispatcher = new SimpleDispatcher(true);
    		protected var _listener : SimpleListener;

    		protected function onAddListenerClicked(event:MouseEvent):void
    		{
    			_listener = new SimpleListener();
    			_listener.listen(_dispatcher);
    		}

    		protected function onRunGCClicked(event:MouseEvent):void
    		{
    			try
    			{
    				new LocalConnection().connect('foo');
    				new LocalConnection().connect('foo');
    			}
    			catch (e:*) {}
    		}

    		protected function onDispatchClicked(event:MouseEvent):void
    		{
    			_dispatcher.dispatch();
    		}

    	]]>
    </fx:Script>

    <s:VGroup width="100%" height="100%" horizontalAlign="center" verticalAlign="middle">
    	<s:Button label="Add Listener" click="onAddListenerClicked(event)" />
    	<s:Button label="Run GC" click="onRunGCClicked(event)" />
    	<s:Button label="Dispatch" click="onDispatchClicked(event)" />
    </s:VGroup>

</s:Application>

```

So what I should expect to see from this example is that when I click "Add Listener" it should create a listener reference which will then listen for when the signal is dispatched and trace out a "ping".

What actually happens is you get nothing. No trace out, despite the fact that there is clearly still a reference to the listener in the Application file.

So whats happening here? If you break into the debugger at the point that the listener is added then you get the following:

[![](https://www.mikecann.blog/wp-content/uploads/2010/08/ScreenHunter_01-Aug.-16-14.03.jpg "ScreenHunter_01 Aug. 16 14.03")](https://www.mikecann.blog/wp-content/uploads/2010/08/ScreenHunter_01-Aug.-16-14.03.jpg)

You can see that the type "MethodClosure" is added as the key to the dictionary rather than Function which is passed in. MethodClosure is a special native Flash Type that you dont have access to. It exists to resolve the issues we used to have in AS2 where passing a function of a class to a listener would cause the listener to go out of scope and other nasties. From the [Adobe docs](https://www.adobe.com/devnet/actionscript/articles/actionscript3_overview.html):

> Event handling is simplified in ActionScript 3.0 thanks to method closures, which provide built-in event delegation. In ActionScript 2.0, a closure would not remember what object instance it was extracted from, leading to unexpected behavior when the closure was invoked.
> ..
> This class is no longer needed because in ActionScript 3.0, a method closure will be generated when someMethod is referenced. The method closure will automatically remember its original object instance.
> The only problem is that it seems that using a MethodClosure as a key in a weak dictionary causes the MethodClosure to have no references and hence be free for garbage collection as soon as its added to the Dictionary which is not good :(

So thats about as far as I got, I have spent a few evenings on this one now and I think im about ready to call it quits. I had a few ideas about creating Delegate handlers to make functions very much in the same way as was done in AS2 but then I read this post: [https://blog.betabong.com/2008/09/26/weak-method-closure/](https://blog.betabong.com/2008/09/26/weak-method-closure/) and the subsequent comments and realised it probably wasnt going to work.

I also had an idea about using the only other method of holding weak references the EventDispatcher class. I thought perhaps somehow I could get it to hold the weak references then I could loop through the listeners in there calling dispatch manually. Despite "listeners" property showing up in the Flex debugger for an EventDispatcher you dont actually have access to that property unfortunately so hence cant get access to the listening functions. Interestingly however the EventDispatcher uses "WeakMethodClosure" object instead of the "MethodClosure" object according to the debugger.

Well I guess for now Ill have to make sure I code more carefully and unlisten from my Signals ;)
