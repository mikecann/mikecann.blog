---
coverImage: ./header.jpg
date: '2022-06-14T07:31:40.000Z'
tags:
  - tips
  - extension
  - browser
  - typescript
title: Firebase Cloud Messaging and Chrome Extension Manifest V3
---

This is one of those super annoying things that took me a while to discover and I was unable to find any prior art on it so I thought I would share.

<!-- more -->

# Background

[BattleTabs](https://battletabs.com/) is [our](https://gangbusters.io) first and primary product. Its turn-based game that runs in the browser and on the web.

Being turn based means that there is a need to be able to notify a player for various in-game events such as its their turn in a battle or they have recieved a friend request or so on.

The way we have done this up to now is to maintain [a persistent background page](https://developer.chrome.com/docs/extensions/mv2/background_pages/) that would run when the extension is installed. Within that page we would open and maintain a websocket to our servers. That way the server could push notifications and other messages to the background page and thus we could open notifications to inform the player about an event.

# Manifest V3

One of the [major changes](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/#service-workers) of Chrome's Manifest V3 is that you can no longer run persistent background pages. Instead you must use transient Service Workers. These startup and shutdown automatically and without your control, thus you are not able to maintain a persistent websocket connection to a server with them.

This was a big problem for us, how were we going to notify the player about events such as turn taken or friend invite?

# Push API

Well fortunately the ["Push API"](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) is a technology that exists to help with the problem of sending messages from the server to the client even when the website is closed.

It works by leveraging Service Workers and a special API built into the browser itself. You register a service provider with the browser and then provide a callback which is invoked by the browser when it receives a message from the provider.

# Firebase Cloud Messaging

[Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) is Google's push service provider. It has all the features we needed and as a bonus is totally free!

The only issue is all the docs are designed to work with websites not browser extensions. This is obviously a bit of a challenge for us and at first I thought it was an insurmountable one.

The key issue is the docs talk about registering a service token [from a normal webpage](https://firebase.google.com/docs/cloud-messaging/js/client#access_the_registration_token) which then will automatically create a service worker using a script it looks for at `firebase-messaging-sw.js`.

Well this is not how things work on and extension as the background service worker is automatically created for us.

# Solution

I'll save you the hours of wasted time trying to get things to work this way and skip to the solution.

The key insight is that we can register the service token not from a normal page but from with the background service worker itself!

See the below for a working example:

```typescript
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"; // note: we MUST use the sw version of the messaging API and NOT the one from "firebase/messaging"
import { getToken } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const firebase = initializeApp({
  // your Firebase config here
});

chrome.runtime.onInstalled.addListener(async () => {
  const token = await getToken(getMessaging(), {
    serviceWorkerRegistration: self.registration, // note: we use the sw of ourself to register with
  });

  // Now pass this token to your server and use it to send push notifications to this user
});

onBackgroundMessage(getMessaging(firebase), async (payload) => {
  console.log(`Huzzah! A Message.`, payload);

  // Note: you will need to open a notification here or the browser will do it for you.. something, something, security
});
```

Now when the extension is installed it will register this user for push notifications which it will receive even when the service worker deactivates!

# Conclusion

Well this was a bit of pain to get this working but the solution is quite neat.

I hope it helps others out.
