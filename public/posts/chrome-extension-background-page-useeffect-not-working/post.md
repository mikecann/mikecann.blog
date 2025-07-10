---
coverImage: ./header.jpg
date: '2019-09-01T08:51:40.000Z'
tags:
  - react
  - react hooks
  - chrome extension
  - typescript
title: Chrome Extension Background Page & React Hooks useEffect Not Working
oldUrl: /markd/chrome-extension-background-page-useeffect-not-working
---

Its been a little while since I have done a pure tech focused blog post but I discovered an issue with React Hooks and Chrome Extensions for which I could find no mention of anywhere on the internet so I thought I would share the issue and my solution.

<!-- more -->

# The Issue

So the problem is; if you build a chrome extension with a background page and try to use a `useEffect` hook on that page, you will notice that the handler of the effect doesn't trigger.

```typescript
import * as React from "react"
import { render } from "react-dom"
import { useEffect } from "react"

function App() {
  console.log("Execution reaches here..")

  useEffect(() => {
    console.log("..but this never gets triggered.")
  }, [])

  return <div />
}

render(<App />, document.getElementById("root"))
```

This is obviously not quite right.

I put together a demo app for this here: https://github.com/mikecann/bgpage-hooks-issue

# The Workaround

It appears as if this issue started happening somewhere between 16.8 and 16.9 so you could just downgrade your react version.

I also discovered that you can workaround the issue with this little hack:

```typescript
function useBackgroundKeepaliveHack() {
  const [tick, setTick] = useState(0)
  useLayoutEffect(() => {
    setTick(1)
    setInterval(() => setTick(prev => prev + 1), 1000)
  }, [])
}
```

If you add that into your component tree then hte effect now triggers as expected, very curious. Perhaps it has something to do with the fact that background pages aren't actually rendered to the screen thus perhaps React can detect that and prevent effect updates?

I have reported the issue to the React github page so hopefully it will be looked into and fixed at some point: https://github.com/facebook/react/issues/16629
