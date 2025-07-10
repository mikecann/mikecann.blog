---
coverImage: /posts/introducing-my-new-android-app-credit-redeemer/cover.jpg
date: '2016-03-15T02:41:38.000Z'
tags:
  - android
  - mobile
  - react-native
  - typescript
title: 'Introducing my new Android app: Credit Redeemer'
oldUrl: /credit-redeemer/introducing-my-new-android-app-credit-redeemer
---

The past couple of weeks I have been working on a new project and something a little different from my usual games related projects.

<!-- more -->

A few weeks ago a colleague in the office (TheBroth) mentioned an idea for an app but didn't have the time / energy to work on it so I thought I would have a stab at it.

The idea is simple. It lets you convert unused Google Play credit into cash.

![1](https://www.mikecann.blog/wp-content/uploads/2016/03/1.png)

It does it by allow the user to pick from a number of In-App-Purchases

![2](https://www.mikecann.blog/wp-content/uploads/2016/03/2.png)

They then supply their Paypal email address

![3](https://www.mikecann.blog/wp-content/uploads/2016/03/3.png)

I then simply send them some money via Paypal. Simples.

![6](https://www.mikecann.blog/wp-content/uploads/2016/03/6.png)

Im making 10% on each transaction with 30% going to Google and 5% to Paypal therefore the user gets 55% of their credit redeemed. Its not perfect but its better than nothing.

I made the whole thing in a couple of weeks of my part-time time. The Android app was made with React-Native using Typescript. I wrote a custom server using NodeJS (Typescript) on Heroku with a MongoDB data store. I wrote a custom Admin tool and website using React.

Due to the relatively small size of this app I would rather have used a MBaaS solution like Parse but as Parse just announced that they are discontinuing the service and I haven't found a good alternative just yet I thought I would bite the bullet and learn how to do it myself.

As usual I enjoyed the learning experience, there were definitely some teething pains, particularly around the Javascirpt / Typescript tooling and module loading issue but all in all im happy with the result.

If you are interested in checking it out, I have bought the domain here: [https://creditredeemer.com/](https://creditredeemer.com/) and the android app itself is here: [https://play.google.com/store/apps/details?id=com.creditredeemer](https://play.google.com/store/apps/details?id=com.creditredeemer)

Let me know what you think :)
