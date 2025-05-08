---
coverImage: /posts/post-to-tumblr-v6-26-new-donation-options/cover.jpg
date: '2016-09-26T04:02:05.000Z'
tags:
  - chrome
  - extension
  - payment
  - paypal
  - update
title: Post To Tumblr v6.26 - New Donation Options
oldUrl: /post-to-tumbr/post-to-tumblr-v6-26-new-donation-options
openAIMikesBlogFileId: file-oDZCgyXBdWk3zLIoGFA5Bsyr
---

Its been a while since I have blogged about [Post To Tumblr](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah), my popular Chrome Extension for Tumblr. I have been quiet but certainly not inactive.

<!-- more -->

One thing that has always bothered me about the extension ever since version 1, when I started accepting donations, was that the only way to donate was via Paypal. Thus people in countries where [Paypal isnt available](https://smallbusiness.chron.com/country-doesnt-work-paypal-66099.html) have been unable to donate and thus unlock the advanced features. Up till now I simply gave those users that emailed me free access to the features, but obviously this isnt ideal.

I like to listen to podcasts, mostly technical related but some science, some business and some general interest. Most of the shows I listen to have ads and one ad that continually pops up is for Braintree. Braintree is a payments solution for online services so I decided to investigate if they would be a good solution for my Chrome extensions.

I discovered that they [have the same fee](https://www.braintreepayments.com/braintree-pricing) but have [have a generous \$50k threshold](https://www.braintreepayments.com/braintree-pricing) before those charges kick in. They accept credit cards which means they can be used in any country and to top it off they have nice documentation and simple integration options which is more than I can say for Paypal.

So I decided to make the jump and switch PTT over to Braintree.

![2016-09-26_11-35-43](https://www.mikecann.blog/wp-content/uploads/2016/09/2016-09-26_11-35-43.gif)

Donations are all handled on my HTTPS heroku page. Credit card info never touches my server and is all handled via the Braintree iFrame and thus I am never liable for any financial risk nor an I at any point breaking Googles Developer Policies.

Speaking of that. As soon as I published the update with the new Braintree payments integrated I received this lovely email from Google:

![chrome_2016-09-23_12-42-04](https://www.mikecann.blog/wp-content/uploads/2016/09/chrome_2016-09-23_12-42-04.png)

Obviously I am rather wary of these sorts of generic take-down emails from Google thanks to my [Google Play ban](https://www.mikecann.blog/misc/why-i-probably-wont-be-making-another-mobile-game-ever-again/). After emailing them back asking for clarification as to exactly which rule I was breaking I received an email 2 days later that stated that they had reviewed my extension and were going to reinstate it. No explanation as to why it was taken down in the first place...

Anyways. Its back, now integrated with Braintree, and it all works and everything is right with the world, so im not going to pursue it any further.

As usual you can [grab Post To Tumblr over on the Chrome Store](https://chrome.google.com/webstore/detail/post-to-tumblr/dbpicbbcpanckagpdjflgojlknomoiah), if you have it installed it should auto-update for you :)

Until next time.
