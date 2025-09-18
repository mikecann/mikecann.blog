---
coverImage: /images/fallback-post-header.png
date: "2010-04-08T21:17:10.000Z"
tags:
  - actionscript
  - flash
  - framework
  - functional
  - funk
  - impressive
  - ioc
  - programming
  - robot legs
  - swift suspenders
title: Funk IoC - A New Dependency Injection Framework
oldUrl: /actionscript/funk-ioc-a-new-dependency-injection-framework
---

[![](https://www.mikecann.blog/wp-content/uploads/2010/04/ScreenHunter_01-Apr.-08-20.11.gif "ScreenHunter_01 Apr. 08 20.11")](https://www.mikecann.blog/wp-content/uploads/2010/04/ScreenHunter_01-Apr.-08-20.11.gif)

Twitter can be a funny beast, what makes it great can also make it poor. I use [Twhirl ](https://www.twhirl.org/)which keeps me updated any time one of the people I follow tweets about something, the only problem is that so many people tweet that if I dont happen to see it within about and hour or so of the Tweet, ill miss it. This time however I was lucky enough to catch a tweet by [@Joa](https://twitter.com/joa) about his new Inversion of Control and functional-programming-like library, [Funk AS3](https://code.google.com/p/funk-as3/).

<!-- more -->

As I have been getting well into [RobotLegs](https://www.robotlegs.org/) (a Dependency Injection MVCS framework) recently I was extremely interested to hear about this new project by Joa who I respect very much as a brilliant coder not least because of his excellent work on low-level Flash byte-code optimisation (see [Apparat](https://code.google.com/p/apparat/)).

Joa has taken a different approach to doing dependency injection. The approach most frequently used (and the one used in SwiftSuspenders / RobotLegs) is to use meta-data to declare to a number of variables for injection. You then map a class to be injected and instantiate it using the injector.

As an example, with Swift Suspenders you would define a class for injection with something like the following:

```

class MyInjectedClass
{
public function sayHello(toSay:String)
{
trace("Hello "+toStay);
}
}

var injector : Injector = new Injector();
injector.mapSingleton(MyInjectedClass);

```

Here we are telling the Injector to make a single instance of our class and hold it internally ready for when it is next requested, such as:

```

class MyDependantClass
{
	[Inject] public var myClass : MyInjectedClass;

	public function performAction()
	{
		myClass.sayHello("World");
	}
}

```

Here the [Inject] meta-data indicates that we want the framework to supply the class with an instance of type MyInjectedClass. The final part is to make an instance of the dendant class and inject into it:

```

var dependant : MyDependantClass = new MyDependantClass();
injector.injectInto(dependant);
dependant.performAction();

```

As you can see this is a nice way of handling inter-module dependencies in your code, when coupled with a MVC framework such as RobotLegs it becomes and extremely powerful yet elegant way of coding.

It however isnt perfect and Joa, on his [google code page](https://code.google.com/p/funk-as3/wiki/IoC) mentions three drawbacks of this method:

<blockquote>*   Your injected properties are publicly exposed and mutable.
*   describeType is very expensive.
*   Steep learning curve.
This is where he suggests his alternative method, which is quite ingenious. Using the same example as above you would see something like the following:

```

class MyInjectedClass
{
	public function sayHello(toSay:String)
	{
		trace("Hello "+toStay);
	}
}

bind(MyInjectedClass).asSingleton();

```

Then the dependant class would look like the following:

```

class MyInjectedClass
{
protected var myClass : MyInjectedClass = inject(MyInjectedClass);

    public function performAction()
    {
    	myClass.sayHello("World");
    }

}

```

And making an instance of it could be as simple as:

```

var dependant : MyDependantClass = new MyDependantClass();
dependant.performAction();

```

As can be seen there are some benefits to this method, the biggest one in my opinion is that injected properties dont have to be public as they are provided by the call from within the class scope rather than from outside.

So how does Joa perform this magic? By abusing a little used ability of the Actionscript programming language known as package-level-functions. These are throwbacks from the old AS1 &amp; AS2 days of global functions. There are actually a couple of common examples in AS3 still such as getTimer() and getQualifiedClassName() still used. What Joa has done is to use these package level functions as a method of generating concise looking code reminiscent of functional programming.

Performance wise, im not entirely sure whether by using package-level functions instead of describeType() calls used in meta-data driven IoC frameworks is any faster as Till Schneidereit of Swift Suspenders suggests:

> I don't think that Funk's approach is any faster than an optimized
>
> metadata-based IoC container: describeType may be slow (as in "takes a
>
> few dozen microseconds to run"), but is only ever called once for each
>
> class an instance of which is injected into. After that, it's just a
>
> straight iteration over an array for all injection points instead of
>
> Funk's multiple method calls for each injection point.
> So the next step for me is to run some tests to see how things pan out. Either way im very impressed with both approaches and cant wait to see what kind of exciting advances will be developed in the coming months.
