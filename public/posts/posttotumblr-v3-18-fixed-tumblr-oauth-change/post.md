---
coverImage: /images/fallback-post-header.png
date: "2013-03-05T20:42:49.000Z"
tags:
  - bug
  - chrome
  - extension
  - javascript
  - posttotumblr
  - tumblr
title: PostToTumblr v3.18 - Fixed Tumblr oauth change
oldUrl: /haxe/posttotumblr-v3-18-fixed-tumblr-oauth-change
---

[![head](https://www.mikecann.blog/wp-content/uploads/2013/03/head1.png)](/posts/posttotumblr-v3-18-fixed-tumblr-oauth-change/attachment/head-9/)

<!-- more -->

Just a quick update to say I have now fixed the authentication issue my [PostToTumblr](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah?hl=en) that quite a few people contacted me about.

What was going on was that Tumblr appear to have changed the format of the data they return from a token request which was causing a library that PostToTumblr relies on to fail.

Before PostToTumblr can post content on a users behalf it first must get an "access token". This token is given to PostToTumblr as part of the authentication flow.

When PostToTumblr first starts up it checks to see if it still has a valid token (they can expire over time and other various reasons). If it doesnt it must go through the authentication flow. Firstly it redirects the user to the grant permission dialog:

[![screenshot_02](https://www.mikecann.blog/wp-content/uploads/2013/03/screenshot_02.png)](/posts/posttotumblr-v3-18-fixed-tumblr-oauth-change/attachment/screenshot_02-13/)

When the user clicks allow Tumblr then returns an "oauth token" and an "oauth verifier" to PostToTumblr, which it can then use to get an "access token" which is used to do the posting.

The problem that this update fixed was that the "oauth verifier" that was returned from Tumblr changed:

[![screenshot_03](https://www.mikecann.blog/wp-content/uploads/2013/03/screenshot_03.png)](/posts/posttotumblr-v3-18-fixed-tumblr-oauth-change/attachment/screenshot_03-10/)

You see at the end of the query string there is now a "#_=_" well this was causingÂ havocÂ with the URL parameter parsing code in the Google oauth library I was using.

My solution is quick and dirty, just strip out the "#_=_" from the url while parsing:

// MIKE HACK!!  
if(param.indexOf('oauth*verifier=')!=-1)
{
param = param.replace('oauth_verifier=','');
param = param.replace('#*=\_','');  
 decoded['oauth_verifier'] = ChromeExOAuth.fromRfc3986(param);
}
else
{  
 var keyval = param.split("=");
if (keyval.length == 2) {
var key = ChromeExOAuth.fromRfc3986(keyval[0]);
var val = ChromeExOAuth.fromRfc3986(keyval[1]);
decoded[key] = val;
}
}

Well I hope this helps anyone else that may encounter this issue too!
