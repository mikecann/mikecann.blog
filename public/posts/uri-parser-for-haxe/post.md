---
coverImage: /images/fallback-post-header.png
date: '2011-04-11T21:01:51.000Z'
tags:
  - chromecrawler
  - code
  - haxe
  - javascript
  - parse
title: URI Parser For HaXe
oldUrl: /chrome-crawler/uri-parser-for-haxe
---

Continuing on my [theme of the moment haXe](/posts/haxe-jqueryextern-gotcha/), I have another post Â regarding the development of my haXe rewrite of Â [ChromeCrawler](/posts/chrome-crawler-v0-4-background-crawling-more/).

<!-- more -->

I was in need of a way to split a URL into its various parts. To do this in previous versions of ChromeCrawler I used a[ ready built one I found on the web](https://blog.stevenlevithan.com/archives/parseuri).

I thought it should be a fairly simple matter to port this to haXe, unfortunately however thisÂ wasn'tÂ the case. The problem was that haXe, unlike JS, doesnt have the exec() method on its regular expression function. What this meant is that the URL couldnt be split in the same way.

Confused I jumped on the haXe IRC, unfortunately the solutions the kind people there provided didnt work. Instead I posted a message on the mailing list and within a few hours I had my answer. The solution was to useÂ EReg.match() thenÂ EReg.matched() to get each part.

Anyways, I promised to share the code when I was done so here it is:

```haxe

package utils;
import haxe.Http;

/\*\*

- ...
- @author mikecann.blog
  \*/

class URLParser
{
// Publics
public var url : String;
public var source : String;
public var protocol : String;
public var authority : String;
public var userInfo : String;
public var user : String;
public var password : String;
public var host : String;
public var port : String;
public var relative : String;
public var path : String;
public var directory : String;
public var file : String;
public var query : String;
public var anchor : String;

    // Privates
    inline static private var _parts : Array<String> = ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];

    public function new(url:String)
    {
    	// Save for 'ron
    	this.url = url;

    	// The almighty regexp (courtesy of https://blog.stevenlevithan.com/archives/parseuri)
    	var r : EReg = ~/^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+):)?(?://)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(d*))?)(((/(?:[^?#](?![^?#/]*.[^?#/.]+(?:[?#]|$)))*/?)?([^?#/]*))(?:?([^#]*))?(?:#(.*))?)/;

    	// Match the regexp to the url
    	r.match(url);

    	// Use reflection to set each part
    	for (i in 0..._parts.length)
    	{
    		Reflect.setField(this, _parts[i],  r.matched(i));
    	}
    }

    public function toString() : String
    {
    	var s : String = "For Url -> " + url + "n";
    	for (i in 0..._parts.length)
    	{
    		s += _parts[i] + ": " + Reflect.field(this, _parts[i]) + (i==_parts.length-1?"":"n");
    	}
    	return s;
    }

    public static function parse(url:String) : URLParser
    {
    	return new URLParser(url);
    }

}

```

So for example the following use:

```haxe
trace(new URLParser("https://www.mikecann.blog/programming/haxe/haxe-jqueryextern-gotcha?somevar=1242#home"));
```

Will print the following:

```
For Url -> https://www.mikecann.blog/programming/haxe/haxe-jqueryextern-gotcha?somevar=1242#home
source: https://www.mikecann.blog/programming/haxe/haxe-jqueryextern-gotcha?somevar=1242#home
protocol: http
authority: www.mikecann.blog
userInfo: undefined
user: undefined
password: undefined
host: www.mikecann.blog
port: undefined
relative: /programming/haxe/haxe-jqueryextern-gotcha?somevar=1242#home
path: /programming/haxe/haxe-jqueryextern-gotcha
directory: /programming/haxe/haxe-jqueryextern-gotcha
file:
query: somevar=1242
anchor: home
```

Simples!

Im not sure how performant the reflection usage would be on the various platforms haXe targets but atleast it would work and its fairly elegant to boot ;)

Edit: Thank you Adrian Cowen for posting this as a haXe snippet:Â [https://haxe.org/doc/snip/uri_parser](https://haxe.org/doc/snip/uri_parser)
