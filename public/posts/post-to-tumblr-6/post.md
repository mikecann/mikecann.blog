---
coverImage: /posts/post-to-tumblr-6/cover.jpg
date: '2016-01-29T03:57:56.000Z'
tags:
  - chrome
  - extension
  - html
  - javascript
  - react
  - tumblr
  - typescript
title: Post To Tumblr 6
oldUrl: /post-to-tumbr/post-to-tumblr-6
---

[Post To Tumblr](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah) my popular Chrome extension will be entering its 6th year of continual development this year so I thought it fitting that I give it a much needed overhaul.

It had been long coming, the last major update I gave it was about 1.5 years ago. In that version I moved the backend from Google App Engine over to Parse and I rewrote the frontend to use requireJS and knockoutJS. Although they have served me well, a lot has happened in the past 18 months and maintaining the client code was starting to become painful.

<!-- more -->

So I decided to checkout what all the cool kids were talking about these days: React.

[React](https://facebook.github.io/react/) is a really cool Javascript framework from Facebook which uses some interesting technologies to render the UI of your application using a component-based structure. It does this by inventing its own language / markup format called JSX which is a hybrid of Javascript and HTML much like MXML was a hybrid of XML and AS3\.

Although awesome to use, and I managed to get it working pretty quick with Typescript too I found that the build chain needed was really a headache. I went through so many different tools and variants. I found that people no longer use Grunt, its now Gulp then I heard some people just use NPM scripts then I read that you want to be using Webpack or Browserify with React. So many tools and options really hampered my progress and ended up giving me a headache.

I eventually fought through the tooling quagmire and ended up with a Gulp / Webpack / Typescript hybrid that sort of work but it takes a long time to compile which i'm not happy about so im definitely on the lookout for a better solution there.

Anyways, now that I have a shiney new client codebase I decided to go through some of the features that people have suggested and implement them so since version 6 came out I have done 6 more updates:

> - v6.7 - 25/01/2016
>
> * Added a new option to general that lets you set what state the format post window should be opened in:
>
> * Added a privacy policy to the account page
>
> * Require privacy policy to be accepted before signing up
>
> * Added a "clear formatting" button to the format page.
>
> * Users that arent logged in must not provide an email when reporting an error
>
> * Fixed a spelling mistake (Thanks Tom)
>
> * Logs older than 2 days are now removed
>
> - v6.6 - 19/01/2016
>
> * The "Remind Me in A Month" and Two Weeks are now working as expected, sorry about that!
>
> * One-click now also gets a reminder.
>
> - v6.5 - 18/01/2016
>
> * The donate button now correctly links to the donation page.
>
> * Added another donation popup, only showing it every 6 months.
>
> * Removed some unnecessary logging to preserve privacy.
>
> - v6.4 - 14/01/2016
>
> * Increased the size of the format post page a little, its 2016 after all ;)
>
> * HTML editing text areas are now resizeable.
>
> * Previous tag sets are now listed in reverse date order that they were used. It displays a maximum of 6 tags. If you have more tags sets you can optionally select to view them.
>
> * Fixed an issue with context menu items not refreshing after adding an account
>
> - v6.3 - 14/01/2016
>
> * Post scheduling is back in addition to queuing. Queuing a post just adds it to the queue, scheduling lets you pick a specific date. (thanks joe, vitor, blinkingline, and others!)
>
> * Fixed an error in the oneclick options which was causing a few errors including not able to rearrange sibling menu items. (thanks adena)
>
> * Reduced the number of plugins TinyMCE is using in the format post window which I hope will increase performance of the text areas, let me know if you are still experiencing issues. (thanks shiinto)
>
> - v6.2 - 12/01/2016
>
> * Added saved tags back to the format post page
>
> - v6.1 - 12/01/2016
>
> * Added HTML editing back to the various text areas in the extension, sorry about that!
>
> * Currently you cannot click a text area in the format post window to have it auto-fill with a value, im working on it :)
>
> - v6.0 - 11/01/2016
>
> * Huge new internal update, should make future changes much easier but may have caused a few bugs, please do report them if you see them!

So im keen to do new features and upgrades so email me if you have suggestions!

As always you can grab Post To Tumblr over at the Chrome Web Store: [https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah)
