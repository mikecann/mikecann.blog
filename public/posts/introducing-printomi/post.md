---
coverImage: /posts/introducing-printomi/cover.jpg
date: "2012-04-04T21:00:14.000Z"
tags:
  - announce
  - api
  - as3
  - asp.net
  - business
  - c sharp
  - flash
  - website
title: Introducing Printomi
oldUrl: /business/introducing-printomi
---

I'm extremely proud to announce the launch of a project I have been working on for quite a while now.

[Printomi](https://www.printomi.com/) is a service for social games that allows players to take snapshots of their worlds and upload them to their own personal gallery. Players can like, comment share and order poster prints of their virtual creations.

<!-- more -->

The way it works is we provide the game owner with a tiny API that is used to interface with Printomi. The bulk of the Printomi client is downloaded at runtime from the Printomi servers. This is good for two reasons. Firstly by keeping down the size of the code that must be embedded into the game we can keep down the initial load time the player must sit through before they can play the game. Secondly we can upload changes and fixes to Printomi without requiring the game owner to recompile their code.

Once downloaded the printomi client is ready to be be used. In the case of [Gourmet Ranch](https://apps.facebook.com/gourmetranch) a themed button is shown to the player inviting them to click:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/btn-to-click.png "btn-to-click")](https://www.mikecann.blog/wp-content/uploads/2012/04/btn-to-click.png)

Once clicked (or activated by the JavaScript API) the main Printomi window opens:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/01.jpg "01")](https://www.mikecann.blog/wp-content/uploads/2012/04/01.jpg)

The window has controls to zoom in and move the print about allowing the player to get the perfect angle of their world:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/02.jpg "02")](https://www.mikecann.blog/wp-content/uploads/2012/04/02.jpg)

Once happy the player can then saves the print to the printomi servers. While the image is uploading the user can continue to play the game. Once the upload is complete the window is opened once more offering to show the player their print.

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/03.jpg "03")](https://www.mikecann.blog/wp-content/uploads/2012/04/03.jpg)

Printomi is tightly integrated with Facebook so that it's as easy as possible for new users to get started:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/04.jpg "04")](https://www.mikecann.blog/wp-content/uploads/2012/04/04.jpg)

Once connected the new print is then available for viewing, sharing, liking, commenting, etc:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/05.jpg "05")](https://www.mikecann.blog/wp-content/uploads/2012/04/05.jpg)

In addition the prints are organised into galleries so that users can browse the uploads of others:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/06.jpg "06")](https://www.mikecann.blog/wp-content/uploads/2012/04/06.jpg)

If a user particularly likes one print then they can order it as a poster:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/07.jpg "07")](https://www.mikecann.blog/wp-content/uploads/2012/04/07.jpg)

Currently we only offer posters to people living in the US however we plan on opening it up to other countries when we can.

To print to such a large poster (24x18" @ 150DPI) and maintain the quality of the final product we must capture a large number of pixels. For example here is a comparison between what a user would see onÂ printomi.comÂ and what we store behind the scenes:

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/08.jpg "08")](https://www.mikecann.blog/wp-content/uploads/2012/04/08.jpg)

The technology that lets us capture these large images and store them in a compressed way (to conserve disk space and therefore cost) is quite complex and will have to wait for a later post.

Printomi is currently only available to a small subset of the [Gourmet Ranch](https://apps.facebook.com/gourmetranch) user base but we are performing a steady-rollout to everyone, so if you don't have access to the button in Gourmet Ranch just yet then don't worry it should be available for you soon!

Printomi is a culmination of many many hours of hard work, late nights and stress. But its been worth it! I've had a blastÂ throughoutÂ the whole process and am proud of the result. I have also learnt a whole bunch in the process. I have had to work with so many technologies to pull this off, to name a few: AS3, C++, C#, ASP.Net, MySQL, IIS, AWS. I have particularly enjoyed the C# work having largely abandoned the language since myÂ [early work](/posts/windows-7-taskbar-performance-monitor-v0-2/)Â [with it.](/posts/killer-space-penguins/)

[![](https://www.mikecann.blog/wp-content/uploads/2012/04/fb1.jpg "fb")](https://www.facebook.com/printomi)[![](https://www.mikecann.blog/wp-content/uploads/2012/04/tw.jpg "tw")](https://twitter.com/#!/printomi)

If you would like to support me or if you would like to keep up to date with the goings on with [Printomi](https://www.printomi.com/) then you can like us on [Facebook](https://www.facebook.com/printomi) or follow us on [Twitter](https://twitter.com/#!/printomi) :)

## More

If you would like to read more on Printomi then checkout these posts:
[catlist id=27 numberposts=100]
