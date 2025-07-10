---
coverImage: /posts/tinkering-with-google-polymer-and-typescript/cover.jpg
date: '2014-11-02T05:18:13.000Z'
tags:
  - css
  - google
  - html
  - polymer
  - typescript
  - web components
title: Tinkering with Google Polymer and Typescript
oldUrl: /polymer/tinkering-with-google-polymer-and-typescript
---

I recently had the opportunity to experiment with something I have been meaning to play with for a little while, Google's Polymer.

<!-- more -->

I first heard about Polymer at Google IO 2014:

<iframe width="853" height="480" src="https://www.youtube.com/embed/8OJ7ih8EE7s" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

I highly recommend watching that video if you want to know more about Polymer but the high level idea is that its a library built on top of the new HTML Web Components and it allows us to write our own custom HTML elements in a way that makes sense.

I really liked the look of it as it reminded me greatly of Adobe's Flex (MXML) in the way you can write your own components in a declarative manner then bind to various data in the code behind.

So it took me a few days to get my head around things to begin with. One thing I would recommend if you are interested in tinkering with Polymer then first checkout this video:

<iframe width="853" height="480" src="https://www.youtube.com/embed/INH_OW4lFSs" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

I wish I had used that to begin with as it would have saved me a whole heap of "is this the correct way to do it?" headaches.

One complication with my setup however is that I really wanted to use Typescript rather than raw Javascript for my code. Well fortunately Visual Studio has really great Typescript support and I was able to create a Typescript project in Visual studio and get cracking immediately.

I ran into an issue with how to use Polymer with Typescript however and there wasn't too much info on the web out there so hopefully this short guide will help:

## 1) Create your custom element

I'm using a login element as an example:

**login.html**

```html
<link rel="import" href="/bower_components/polymer/polymer.html" />
<link rel="import" href="/bower_components/paper-toast/paper-toast.html" />
<link rel="import" href="/bower_components/paper-button/paper-button.html" />
<link rel="import" href="/bower_components/paper-input/paper-input.html" />
<link rel="import" href="/bower_components/paper-fab/paper-fab.html" />
<link rel="import" href="/bower_components/core-icons/core-icons.html" />
<polymer-element name="tt-login" attributes="userService">
  <template>
    <style>
      .card {
        margin-top: 64px;
        max-height: 580px;
        max-width: 512px;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
        border-radius: 2px;
        padding: 20px 16px;
        box-sizing: border-box;
        background-color: white;
      }
    </style>
    <div class="card">
      <h1>Login</h1>
      <paper-input
        floatinglabel
        label="Your
email"
        type="email"
        value="{ {email}}"
        error="Input is not an email!"
      ></paper-input>
      <paper-input
        floatinglabel
        label="Your password"
        type="password"
        value="{ {password}}"
        error="Input is not an
email!"
      ></paper-input>
      <div horizontal center layout>
        <a href="/#signup"
          ><paper-button
            disabled?="{
{isLoggingIn}}"
            >Signup</paper-button
          ></a
        >
        <div flex></div>
        <paper-button
          id="check"
          on-click="{
{login}}"
          disabled?="{
{isLoggingIn}}"
          >Login</paper-button
        >
      </div>
      <paper-toast id="errorToast"></paper-toast>
    </div>
  </template>
  <script src="login.js"></script>
</polymer-element>
```

Its a pretty simple login element with some binding using some of Google's paper elements but hopefully you get the idea.

## 2) Create your custom element's script

**login.ts**

```typescript
class Login extends PolymerElement {
  userService: UserService;

  email: string;
  password: string;
  isLoggingIn: boolean;

  errorToast: PaperToast;

  ready() {
    this.errorToast = this.$.errorToast;
  }

  login() {
    this.isLoggingIn = true;
    this.userService
      .login(this.email, this.password)
      .then((user) => this.onUserLoggedIn(user))
      .fail((err) => this.onParseError(err));
  }

  private onUserLoggedIn(u: Parse.User) {
    this.isLoggingIn = false;
    this.fire("logged-in");
  }

  private onParseError(error: Parse.Error) {
    this.isLoggingIn = false;
    this.errorToast.text = error.message;
    this.errorToast.show();
  }
}

Polymer(Login.prototype);
```

Here we define the variables that we are going to bind to in the element. We also include the "userService" which is an attribute that is a dependency passed into the element.

Note that im able to use this.\$ to access the "errorToast" element by ID. Im able to do this because Login extends a class I wrote called PolymerElement:

```typescript
class PolymerElement {
  $: any;
  style: any;
  fire(eventname: string, payload?: any) {}
  addEventListener(eventName: string, handler: (e: CustomEvent) => void) {}
}
```

For now it a bit of a hack to get around the fact that Typescript requires that you implement all elements in an interface so I cant just do "class Login implements HTMLElement".

Note also the call to Polymer:

```typescript
Polymer(Login.prototype);
```

We must pass the prototype into the call then do our variable initting in the ready() function.

## 3) Use the element

Now we can use it pretty easily:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, minimum-scale=1.0, initial-scale=1.0,
user-scalable=yes"
    />
    <title>Login Example</title>
    <script src="bower_components/platform/platform.js"></script>
    <!--
This is only needed because of the Typescript interface problem! -->
    <script src="lib/polymer_utils.js"></script>
    <!-- Our
login element -->
    <link rel="import" href="login.html" />
  </head>
  <body fullbleed layout vertical unresolved>
    <userService id="userService"></userService>
    <login
      userService="{
{$.userService}}"
    ></login>
  </body>
</html>
```

I hope that helps other that are looking to do their own tinkering with Typescript and Polymer!
