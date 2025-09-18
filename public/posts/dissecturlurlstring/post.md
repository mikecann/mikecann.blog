---
coverImage: /images/fallback-post-header.png
date: "2009-01-16T13:00:49.000Z"
tags: []
title: "dissectURL(url:String)"
oldUrl: /actionscript/dissecturlurlstring
---

Been a while since i have shared any coding tips, but here is one for those Actionscript 3 Coders out there. Its a helper function that splits a URL up into its different parts using RegExp.<!-- more -->

> public static function dissectURL(url:String) : Object
>
> {
>
> var keys : Array = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
>
> var hostExtractPattern:RegExp = /^(?:([^:/?#]+):)?(?://((?:(([^:@]_):?([^:@]_))?@)?([^:/?#]_)(?::(d_))?))?((((?:[^?#/]_/)_)([^?#]_))(?:?([^#]_))?(?:#(.\*))?)/;
>
> var o : Object = hostExtractPattern.exec(url);
>
> var r : Object = new Object();
>
> for (var i:int = 0; i < keys.length; i++) { r[keys[i]] = o[i];Ã‚ Ã‚ Ã‚  }
>
> return r;
>
> }
> An example of its use would be:
> var protocol : String = dissectURL("https://www.mikecann.blog/?p=294").protocol;
>
> trace(protocol);
> It would trace "http".

Enjoy!
