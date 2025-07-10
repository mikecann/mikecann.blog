---
coverImage: ./header.jpg
date: '2018-12-27T14:51:40.000Z'
tags:
  - programming
  - typescript
  - chrome extensions
  - react
  - bleeding edge
  - react hooks
title: Tinkering With React Hooks and Chrome Extensions
oldUrl: /programming/tinkering-with-react-hooks-and-chrome-extensions
---

I spent a few hours tinkering with the new (alpha release) version of React which includes the new React Hooks feature. I wanted to experiment with it in a semi-realistic environment (not CodeSandbox). I have built a few chrome extensions in the past and I knew the challenges well so I thought it would be a good scenario to challenge React Hooks and see what it can do.

<!-- more -->

# TLDR:

The below video is a quick demo of what the chrome extension does.

<iframe width="853" height="480" src="https://www.youtube.com/embed/iydk07TCOOs" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

The video demonstrates how the state is able to be shared between the background page, child pages and content scripts simultaneously.

The code is available for your perusal here: https://github.com/mikecann/react-hooks-chrome-extension

If you want to hear about some of the issues and their solutions I faced read on..

# The Chrome Extension State Sharing Problem

Over the years I have authored a number of Chrome Extensions. They have been written in all manner of different ways using all manner of languages and libraries; React, Aurelia, Angular, Mobx, Mobx State Tree, Typescript, Redux and plain old JS just to name a few.

One of the problems that I always face with many of the extensions is how to share the state between the various pages in a chrome extension. Chrome Extension's have multiple "entry points"; a content script (injected), a settings page or a browser action page (the popup that you get when you click the button in chrome). These multiple entries means that you need a way of sharing some common state between all the pages.

Fortunately chrome has provided a number of different ways of doing this. Below are my two favorite.

## Storage Sync

One way of sharing state is via the [chrome sync storage](https://developer.chrome.com/extensions/storage) mechanism. Whenever the state changes on one of your pages you write those changes to `chrome.storage.sync`. Other pages listen for changes to storage and subsequently update their own internal state.

This method is okay but it has its limitations which include storage size limits (5mb unless you give unlimited storage permission), rate limiting and other potential permission issues.

## Message Passing

A second method for syncing state is involves each page passing messages to each other. Using `chrome.runtime.connect` a page can connect to the background page and inform each other of when the state changes.

This method however works well but only if you have a central storage of state and are able to detect changes to that state in a unified way.. enter react-hooks...

# React Hooks

[React Hooks](https://reactjs.org/docs/hooks-intro.html) is a brand new feature (currently in alpha) for [React](https://reactjs.org/). When I heard about it I got excited because it looked like the React guys were once again going to blow my mind by exploring a wholely new way of building apps.

The full details on how hooks work are in [the excellent docs](https://reactjs.org/docs/hooks-intro.html) but the idea is is fairly simple: allow users to write functional style components while allowing state to be managed in a composable, reusable way.

I knew that there was only so much I was going to be able to understand about the technology from reading about it. I was going to have to dig in there and tinker with it a little bit.

## The Event Listener Array Issue

One issue I faced early one with React Hooks was a fundamental "stale state" issue when dealing with event listeners. To demonstrate the issue take the following example:

```typescript
export function useRuntimePorts() {
  const [ports, updatePorts] = useState<chrome.runtime.Port[]>([])

  function onPortConnected(port: chrome.runtime.Port) {
    console.log("port connected", ports.length)
    updatePorts([...ports, port])
  }

  useEffect(() => {
    chrome.runtime.onConnect.addListener(onPortConnected)
    return () => {
      chrome.runtime.onConnect.removeListener(onPortConnected)
    }
  })

  return ports
}
```

This is a custom react hook that's job is to manage the state of connected "ports" from other pages in the extension. It listens to the chrome runtime api for connections from other pages and updates its state (array of ports) which it then exposes to consuming code by returning the ports.

When a new connection is made, we get a console message that tells us a port was connected. We are also given the number of currently connected ports. As expected the number of ports increases as we open more connections from other pages.

The keen eye will notice that the `effect` is re-executed every time that the hook is re-executed on each re-render. This means the event listener is continually being added and removed. This seems wasteful and luckily the React API has a solution in the form of a ["third" parameter](https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect) that you can pass to `useEffect`, an array that indicates only run the effect on the update if one of the the elements in the array has changed.

So if I simply supply an empty array it means that the effect will only be run once:

```typescript
  ...

  useEffect(() => {
    ...
  }, []);

  ...
```

This is great, it now means we dont wastefully attach and detach the listener every time the component is re-rendered.

When we try this out in out extension however a problem has arisen. The console message that tells us that a port has connected now no longer counts up the number of ports, it stays at 0. Why is this?

Well if you think about it, it makes sense, we arent re-attaching the event listener on each time the hook is executed. That means that the `ports` variable inside of the `onPortConnected` handler is always going to be the original array the first time that this hook was run. So doing an immutable append `[...ports, port]` is always just going to append the latest port to an empty array.

I struggled with this issue for quite some time. I tried quite a few different things including trying out `useRef` to hold a mutable array, but that seemed hacky. There must be a better way I thought to myself.

Eventually I decided to pose the question on the [Reactiflux discord chat](https://discordapp.com/channels/102860784329052160/103696749012467712). A fine fellow by the name of Kingdaro responded with:

> Try using the callback in the update function
> `updatePorts(ports => [...ports, port])`. In theory that'll make it so that the port will reliably always be added to the end of whatever's there, as opposed to using what's in scope

Bingo! That was the missing link. I hadn't realized you could pass a function to the state update function instead of the next state ([despite it clearly mentioned in the docs](https://reactjs.org/docs/hooks-reference.html#functional-updates)). With that subtle change and my hook now looked like:

```typescript
export function useRuntimePorts() {
  const [ports, updatePorts] = useState<chrome.runtime.Port[]>([])

  function onPortConnected(port: chrome.runtime.Port) {
    updatePorts(prev => {
      console.log("port connected", prev.length)
      return [...prev, port]
    })
  }

  useEffect(() => {
    chrome.runtime.onConnect.addListener(onPortConnected)
    return () => {
      chrome.runtime.onConnect.removeListener(onPortConnected)
    }
  }, [])

  return ports
}
```

And huzah! The console message logged out incrementing port count as expected.

## Testing

One other major question I had for React Hooks was how does one go about testing them?

Fortunately wiser folks (in the form of the prolific Kent Dodds) had already thought long an hard on this and created this excellent video: https://egghead.io/lessons/react-test-react-components-that-use-react-hooks and wrote this blog post: https://blog.kentcdodds.com/react-hooks-whats-going-to-happen-to-my-tests-df4c2b4d67b7

So armed with these I began testing.

```typescript
let state: ReturnType<typeof usePorts> | undefined

function SomeComponent() {
  state = usePorts(jest.fn())
  return <div>hello</div>
}

it("should add a port when one connects", () => {
  const { rerender } = render(<SomeComponent />)
  rerender(<SomeComponent />)
  const port = portFactory()
  chrome.runtime.onConnect.addListener.mock.calls[0][0](port)
  expect(state).toEqual({
    ports: [port],
    lastConnected: port,
    lastDisconnected: undefined,
  })
  expect(state!.ports[0].id).toEqual(0)
})
```

The above is a sample of my test for the `usePorts` hook. You will note that I include the hook inside a component `SomeComponent` with which I use to interrogate the state returned from the hook each render. I do this rather than calling the function directly because although hooks look pure they aren't actually pure. They require that they are run within the context of a rendering Component to work.

The `rerender()` call is necessary because hooks that use `useEffect` by their nature are asynchronous, thus to force React to apply the effect of the hook before we run out testing logic, we must re-render the component.

I am really quite happy with how easy they are to test and how little mocking there is. The only mocks I am using are the chrome API calls because they dont exist inside the testing environment. This means I am not testing the implementation and just the result which makes the tests far less brittle to refactors.

## The Performance Question

I only have one outstanding concern about Hooks, does re-defining then re-executing the scoped functions each render create extra memory on the heap?

What I mean is given my `useRuntimePorts`example from above, each time this hook is run is a new scoped `onPortConnected` function placed on the heap? If so, wouldnt this create a lot of extra memory and thus pressure on the garbage collector?

Basically, I would love to know what are the performance implications, specifically memory / garbage collection, of hooks?

# Conclusion

All in all im very impressed with React Hooks. The code that it produces is clean, easy (ish) to understand and is very testable. No proxys or magic is needed (sorry mobx, I love you but I hate the proxy magic), just plain old Javascript objects.

I cant wait to use hooks in a production app.

If you want to checkout the code then its all up on my repo: https://github.com/mikecann/react-hooks-chrome-extension
