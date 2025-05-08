---
coverImage: /posts/new-hosting-new-theme/cover.jpg
date: '2014-02-17T19:06:22.000Z'
tags: []
title: 'New Hosting, New Theme!'
oldUrl: /uncategorized/new-hosting-new-theme
openAIMikesBlogFileId: file-Ahmeh43MUSvJ1voytFviJVRe
---

![hero](https://www.mikecann.blog/wp-content/uploads/2014/03/hero.png)

In what appears to be an almost annual event I have decided to move hosting of my blog yet again! Im moving away from the £35 per month hosting of 1&amp;1 because although I like the freedom of having my own box that I can remote into i’m just finding it too expensive for me to justify having it. There are so many Platform as a Service (PaaS) options out there that provide high quality hosting cheaply I thought I would switch over.<!-- more -->

Last year Google announced that you can now host WordPress blogs on Google App Engine so I decided to take the plunge and set it up. It turns out that its not actually that hard. The hard part came with the fact that this blog is 10 years old now and contains 426 posts. That means a huge database that is not easy to import into a new provider. Fortunately [this](https://gae-php-tips.appspot.com/2014/01/22/using-the-wordpress-importer-from-the-app-engine-plugin/#whattodoifyouhavealargeimportorseeanimporterror) post came to my rescue, in the end it only cost me \$0.88 in instance backend time to import the whole thing.

So now I have my blog hosted on Google App Engine, I moved all my content over to Google Cloud Storage too so its all hosted on Google’s Edge CDN network for super fast access, nice! I am currently running in the free tier for everything except for the Cloud SQL server which WordPress unfortunately needs so that means i’m paying \$11 per month for that. Not bad considering that it used to cost me on 1&amp;1 and I get all the nice Google features such as backups, redundancy and infinite scaling.

At the same time I thought I would tart the site up a little and bought a new theme. This time I went for a theme called [Feather](https://themeforest.net/item/feather-clean-flat-responsive-wordpress-blog-theme/6815330) from [Suitstheme](https://themeforest.net/user/suitstheme) which I rather like! Let me know what you think in the comments.
