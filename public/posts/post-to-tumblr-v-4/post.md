---
coverImage: /posts/post-to-tumblr-v-4/cover.jpg
date: '2014-02-21T19:10:33.000Z'
tags: []
title: Post To Tumblr v.4
oldUrl: /post-to-tumbr/post-to-tumblr-v-4
openAIMikesBlogFileId: file-ARRs5IbVOEK0n5exsRKNSxTE
---

While I was travelling I have had a great many people contact me about my popular chrome extension [Post To Tumblr](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah?hl=en). Some wanted me to fix things some wanted me to add things others wanted to buy the extension outright.

<!-- more -->

Well I didn't have time to do any of those things while I was away so put it off until I returned home. Well I have been back now for a few weeks and have decided to spend quite a bit of time upgrading the extension.

Unfortunately my time isnt free now that I am working freelance and so I need to justify the time spent working on the extension. So I need a way to monetize the app. There are quite a few ways to do it and I couldn't decide which to go for so I surveyed my users.

![screenshot_0116](https://www.mikecann.blog/wp-content/uploads/2014/03/screenshot_0116.png)

The results were interesting:

![screenshot_0220](https://www.mikecann.blog/wp-content/uploads/2014/03/screenshot_0220.png)

If you take the results on face value it looks as if people didnt mind ad injection but I suspect that they misunderstood the meaning of what ad injection was and thought I just meant adverts. I decided that ad injection was a little too evil for me and decided to go with making the donation more prominent.

To do this I rewrote the entire app using Typescript with KnockoutJS and then make the donations front and center. When a user opens the window they are presented with a popup that informs them about all the new features and improvements and gives them an opportunity to donate:

![screenshot_0117](https://www.mikecann.blog/wp-content/uploads/2014/03/screenshot_0117.png)

From there they are taken to the donate tab of the options that lets them quickly and easily donate.

![screenshot_0222](https://www.mikecann.blog/wp-content/uploads/2014/03/screenshot_0222.png)

I decided to set the minimum donation amount to \$3 which is about the price of a cup of tea in Starbucks.

As an incentive I have locked certain features such as the advanced 1-click process and a suggestion submission feature:

![screenshot_045](https://www.mikecann.blog/wp-content/uploads/2014/03/screenshot_045.png)

I also have promised new features coming soon which donors will have access to:

![screenshot_056](https://www.mikecann.blog/wp-content/uploads/2014/03/screenshot_056.png)

On the whole people have responded well to the changes however there have unfortunately been some negative reviews from people on the chrome web store.

The negative reviews regarding me asking for donations sadden me. I don't think people understand that I need to justify my time spent on the extension. When Tumblr change their API I have to spend days working out why. This is time I could be spending doing freelance work.

The amount I ask for is about what you would pay for a mobile app and people don't seem to complain when purchasing those. Unfortunately this just seems to be the way things are on the Chrome Web Store, people expect things to be free.

I have tried hard not to be evil with this release, I could have made much more money by either implementing ad injection or selling to an ad injection company, instead I have worked hard to fix and improve things in a clean and non intrusive way. I just wish I could make the negative reviewers understand that.
