---
coverImage: /images/fallback-post-header.png
date: "2010-10-31T11:04:26.000Z"
tags:
  - browser
  - chrome
  - extension
  - javascript
  - notification
  - plugin
  - update
  - upgrade
  - version
  - video
title: Post To Tumblr Version 0.3
oldUrl: /post-to-tumbr/post-to-tumblr-version-0-3
---

[![](https://www.mikecann.blog/wp-content/uploads/2010/10/Shot_004.png "Shot_004")](https://www.mikecann.blog/wp-content/uploads/2010/10/Shot_004.png)

Just made a quick little update to my chrome extension "Post To Tumblr".

<!-- more -->

In this update I finally worked out how to catch bad username or password returns from the Tumbr API. Basically it just involved me using the ajax rather than the post jQuery function and using "async:false" like so:

```javascript
\$.ajax({
  url: "https://www.tumblr.com/api/write",
  type: "POST",
  data: o,
  async: false,
  complete: function (transport) {
    if (transport.status == 200 || transport.status == 201) {
      postingNote.cancel();
      var postedNote = webkitNotifications.createNotification(
        "images/icon48.png",
        "Image Posted!",
        info.srcUrl
      );
      setTimeout(function () {
        postedNote.cancel();
      }, 5000);
      postedNote.show();
    } else if (transport.status == 403) {
      postingNote.cancel();
      var errorNote = webkitNotifications.createNotification(
        "images/icon48.png",
        "Posting Error!",
        "Bad email or password"
      );
      setTimeout(function () {
        errorNote.cancel();
      }, 5000);
      errorNote.show();
    }
  },
});
```

In addition I have added some notifications to indicate when the extension is doing something.

I have made a little demo video below to show this off:

<iframe width="100%" height="400" src="https://www.youtube.com/embed/Rr7JxuUmZt8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Chrome should auto update for you. If you dont have the extension yet [head over to the extension gallery to grab it now](https://chrome.google.com/extensions/detail/dbpicbbcpanckagpdjflgojlknomoiah)!
