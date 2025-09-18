---
coverImage: /images/fallback-post-header.png
date: "2012-10-20T06:52:57.000Z"
tags:
  - chrome
  - extension
  - html
  - javascript
  - languages
  - spider
  - typescript
title: Tinkering With TypeScript
oldUrl: /chrome-crawler/tinkering-with-typescript
---

[![](https://www.mikecann.blog/wp-content/uploads/2012/10/ts2.png "ts2")](https://www.mikecann.blog/wp-content/uploads/2012/10/ts2.png)

In the spirit of [David Wagner's try { harder } talk on 'the value of tinkering'](/posts/try-harder-2012/) I decided to do a little tinkering with a new language from Microsoft called [TypeScript](typescriptlang.org).

<!-- more -->

TypeScript attracted me for three reasons. Its the new project from Anders Hejlsberg the creator of C#, it brings type safety to JavaScript and im a sucker for new technology.

TypeScript is basically a superset of Javascript much in the same way C++ is to C. So every single JS project is a valid TS project. This is good if you are familiar with JS already, you should be able to pick up TS fast and then get to grips with the other cool bits it bring.

TS compiles down to JS much in the same way that that JS target of Haxe compiles down to JS. Unlike Haxe however the generated code is much more readable and so although there is no integrated debugger (yet) you can just use Chrome's developer console to debug with without too much pain.

Before I get too much more into the specifics of the language I want to mention the project I am tinkering with TS for. [A while back](/posts/chrome-crawler-a-web-crawler-written-in-javascript/) I wrote an extension for Chrome called Chrome Crawler. It is a rather simplistic web crawler written in JS and released as a Chrome extension (because of the cross-domain scripting limitations with normal JS).

Over the intervening couple of years I have returned to the project on occasion with an idea to do a second version, however I never actually completed one. So I thought it may be nice if I gave it a go again but this time using TypeScript and at the same time see how it compares to the Haxe JS target.

Chrome Crawler v2 isnt ready for release but checkout the quick video I put together below to see how its coming along:

<iframe src="https://www.youtube.com/embed/k4PD5yPLtp8" frameborder="0" width="420" height="315"></iframe>

The original idea was to lay out the crawling in a left to right fashion. So each crawl depth is put in its own column, but as you can probably tell from the video above, things start getting a little unmanageable when you get to just level 3 of crawler depth. So I think im going to have to rethink how I display the nodes in the crawl graph. I have some ideas, but that's going to have to wait until I return from my trip to NY next week.

More on that in later posts, lets take a look at a few key TypeScript features:

### Typing

One of the key features of TypeScript is that it allows you to structure your code in a type-safe way. You can declare Classes, interfaces (inequivalent to typedef in Haxe) and modules as types then use them later.

TS also has structural typing so you can define a structure as part of a function or variable definition without first declaring a Class or Interface for it. For example:

[![](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_10.png "screenshot_10")](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_10.png)

This is great for many reasons but the big one for me is the way it assists tooling particularly when coupled with the excellent VisualStudio 2012 you get all the things you would expect such as intellisense, go to definition, find references and refactoring. For me it takes much of the pain out of the dynamic nature of JS.

As with AS3 and Haxe typing is optional. You can if you wish declare everything as "any" (dynamic in Haxe or \* in AS3). Doing so however would forfeit many of the strengths of TS.

Like Haxe you can 'define' things as being available at runtime, this means you can reuse existing JS libraries without having to totally rewrite them in TS. By declaring an "interface" you can just tell the compiler that this type will exist at runtime (we did this with extern's in Haxe) and thus you can use the existing library in a type-safe way. For example here is a definition for the Facebook SDK:

[https://github.com/mientjan/typescript-facebook-definition/blob/master/facebook.d.ts](https://github.com/mientjan/typescript-facebook-definition/blob/master/facebook.d.ts)

Alot of the type-safe TS stuff is familiar to me because of Haxe. I think some things in TS are nicer fit because its only designed to compile to JS unlike Haxe which can compile to many different languages. For example TS has function overriding baked into the language also strongly typed functions in my option are a little nicer:

```typescript
(index: any, domElement: Element) => any;
```

is a function type that takes in two params and returns anything (including void), its Haxe inequivalent:

```haxe
Dynamic -> Element -> Dynamic
```

These things however are just my opinion, but it does tie nicely into one of my favourite features of TypeScript...

### Lambda Functions

Lambda functions are basically syntactical sugar to anonymous function definitions so instead of:

```haxe
var fn = function(a, b) { return a+b; }
```

You could write this as:

```typescript
var fn = (a, b) => a + b;
```

Which is really nice when looping over arrays:

```typescript
var a = [4, 2, 1, 6, 5];
a.sort((a, b) => a - b).forEach((i) => console.log(i));
```

Because TS uses type-inference all the variables in the above are type safe. I really love how terse this syntax is and have had quite a few discussions about introducing it into Haxe.

There is one big difference between function() and lambda definitions however and that is the way they handle scoping of "this".

For example take this example from the [javascriptplayground.com blog post](https://javascriptplayground.com/blog/2012/04/javascript-variable-scope-this):

```typescript
$("myLink").on("click", function () {
  console.log(this); //points to myLink (as expected)
  $.ajax({
    //ajax set up
    success: function () {
      console.log(this); //points to the global object. Huh?
    },
  });
});
```

This is a common gotcha in JS coding and the usual solution is to do something like the following:

```typescript
$("myLink").on("click", function() {
    console.log(this); //points to myLink (as expected)
    var _this = this;  //store reference
    $.ajax({
//ajax set up
success: function() {
console.log(this); //points to the global object. Huh?
console.log(\_this); //better!
}
});
});
```

In TypeScript lambda functions "this" is scoped to the block in which the lambda was defined so the above can be written more simply as:

```typescript
$("myLink").on("click", function() {
    console.log(this); // points to myLink (as expected)
    $.ajax({
        success: () => console.log(this); // points to myLink
    });
});
```

### this.

One minor thing that does annoy be about TS is the necessity to put "this." in front of every single member variable access. For example:

```typescript
class Crawler {
  constructor(private url: string) {}

  crawl() {
    console.log(url); // error
    console.log(this.url); // okay
  }
}
```

Some may consider it rather minor but I find it annoying coming from a Haxe / AS3 / C# perspective where member variable access is implied. I guess the reasoning is because in JS if you dont supply a var before a variable declaration / usage you are referring to global scope, thus in that above example "console.log(url);" would be trying to log global.url which is undefined.

### Tooling

The tooling support for TS is pretty good so far. Visual Studio has a plugin for the language and has reasonably good support. There is still quite a bit of room for improvement here however. Things such as integrated debugging, code generation for functions event handlers etc and source formatting would be nice.

Because the TS compiler is written in TS they are able to create really cool things such as the [TypeScript Playground](https://www.typescriptlang.org/Playground/):

[![](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_11.png "screenshot_11")](https://www.mikecann.blog/wp-content/uploads/2012/10/screenshot_11.png)

With it you can mess around with TS and see its generated JS as you type. It even includes a version of intellisese for that type-hinting goodness.

### Conclusion

I must admit I really like TypeScript. It provides a light-weight layer over the top of Javascript giving just enough of the type-safe goodness and language enhancements without making it totally alien to a JS coder.

The generated JS looks very similar to the source TS (and will look even more so once ES6 is mainstream) which is important when you are trying to debug a problem. I discovered this to be an important point when developing the Haxe version of my Post To Tumblr chrome extension. Haxe although awesome tends to generate alot of alien looking JS making it tricky to work out where to put a breakpoint.

More important than any particular nuance of the language however is who is backing it. Microsoft is a huge company with a massive following of developers. It pays many people to work on the language and evangelise it. What this results in is a much bigger community. A bigger community means you have more questions asked on Stack Overflow, more API definitions written and more job positions specialising in the language. Also having Anders Hejlsberg, the father of C#, behind it you can be confident that the language will continue to develop in a manner that (if you are a C# fan) makes sense.

I have been having a whole lot of fun in TypeScript, and have high hopes for its future.
