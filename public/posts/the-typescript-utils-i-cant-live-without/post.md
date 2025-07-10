---
coverImage: ./header.jpg
date: '2023-03-14T07:31:40.000Z'
tags:
  - typescript
  - code
  - utils
title: The Typescript Utils I Can't Live Without
---

Are you a TypeScript enthusiast looking for ways to streamline your development process? Look no further! As someone who has been writing TypeScript [for a significant amount of time](https://mikecann.blog/posts/post-to-tumblr-5), I have accumulated a handful of utility tools that I consider essential for every new project. These tools have proven to be so helpful that they have become a staple in my development toolkit. In this blog post, I will share with you some of these tools that will make your TypeScript development journey smoother and more efficient.

# ensure

If you're familiar with JavaScript, you know that null and undefined can be a source of frustration and errors in your code. However, one of the biggest strengths of TypeScript is its null safety. TypeScript's type system provides a way to catch null or undefined values at compile-time, before they can cause runtime errors. This not only saves time and effort in debugging, but it also helps to ensure the reliability and stability of your code.

There are however occasions when the program cannot continue if the value is null or undefined. Thats where `ensure` comes in:

```ts
export const ensure = <T>(
  obj: T | null | undefined,
  err = `variable was null or undefined when it shouldnt have been.`
): T => {
  if (obj === null) throw new Error(err);
  if (obj === undefined) throw new Error(err);
  return obj;
};
```

I use this super frequently when I know that something must exists within an array otherwise the application cannot continue;

```ts
const someListOfThings: string[] = ["bar", "foo", "moo"];
const maybeFound = someListOfThings.find((s) => s == "foo");
//       ^ is now string | undefined but we know it must be there
const found = ensure(maybeFound, `couldnt find 'foo' in the list`);
```

Its basically an assert but happens on one line with a optional nice error message;

# sequence

I frequently want an array of something of a given length. This helper function is super useful for creating a new array of the given length and then populating it with a sequence of those numbers.

```ts
export const sequence = (count: number): number[] => {
  return [...Array(Math.floor(count)).keys()];
};
```

This is useful in all manner of ways from testing to UI. Here is an example where I use it in [BattleTabs](https://battletabs.com) to render a given number of clouds (as part of the background):

```tsx
<div>
  {sequence(numClouds).map((i) => (
    <Cloud key={i} />
  ))}
</div>
```

# mapObj

Everyone knows about array.map but I often find myself needing to map over an object too. That is I want to keep the keys the same but change the values. Thats where the next util comes in:

```ts
export const mapObj = <T extends string, U, V>(
  obj: Record<T, U>,
  mapper: (key: T, value: U) => V
): Record<T, V> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, mapper(key as T, value as U)] as const)
  ) as Record<T, V>;
```

An example of using it might look like:

```ts
interface Person {
  name: string;
  age: number;
}

const people = {
  person1: { name: "Alice", age: 30 },
  person2: { name: "Bob", age: 25 },
};

const peopleAges = mapObj(people, (key, value) => value.age);
```

# filterObj

Similar to mapObj its often useful to filter some entries from an object:

```ts
export const filterObj = <T extends string, U>(
  obj: Record<T, U>,
  predicate: (key: T, value: U) => boolean
): Partial<Record<T, U>> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => predicate(key as T, value as U))
  ) as Partial<Record<T, U>>;
```

And an example of its use would be:

```ts
const filtered = filterObj(people, (key, value) => key == "person2");
// { person2: { name: 'Bob', age: 25 } }
```

# wait

Its often useful to wait a given amount of time for something:

```ts
export const wait = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
```

an example of its use might be:

```ts
export const turnTakingSequence = (player: Player, ai: AI) => {
  await player.takeTurn();
  await wait(1000); // Add a nice delay
  await ai.takeTurn();
};
```

# match and matchKind

This is a bit of a cheeky one as its not really my util function but I have a full blog post on this "pattern matching" technique here: https://mikecann.blog/posts/discriminated-unions-and-pattern-matching-in-typescript

Go there to see what the function looks like an more depth but its a suuuper useful util that I use everywhere in my projects. An example of its use might be:

```ts
export type GeneralJob =
  | MatchmakeJob
  | UpdateUserDerivableMedalsJob
  | RefreshUserSubscriptionJob
  | CollectUncollectedBattleRewardsForUserJob
  | UpdateUserScoresFromMatchFinishJob
  | AITakePlayerTurnJob;

export const createGeneralJobsHandler = ({ services }: { services: Services }) => (
  job: GeneralJob
) =>
  matchKind(job, {
    "update-user-derivable-medals": ({ userId }) => updateUserDerivableMedals({ userId, services }),
    "refresh-user-subscription": ({ userId }) => refreshUserSubscription({ userId, services }),
    "collect-uncollected-battle-rewards-for-user": ({ userId }) =>
      collectAnyUncollectedBattleRewards({ userId, services }),
    matchmake: () => services.backgroundProposalMatchmaking.check(),
    "update-user-scores-from-match-finish": ({ matchId }) =>
      updateUserScoresFromMatchFinish({ services, matchId }),
    "ai-take-player-turn": ({ userId, matchId }) =>
      services.aiTurnTaking.takeTurn({ userId, matchId }),
  });
```

# randomIndex, randomOne and randomFew

```ts
// Replace with whatever random number generator you want (seeded or otherwise)
const getRandom = () => ({ nextNumber: () => Math.random() });

export const randomIndex = <T>(items: T[]): number =>
  Math.floor(getRandom().nextNumber() * items.length);

export const randomOne = <T>(items: T[]): T => items[randomIndex(items)]!;

export function randomFew<T>(items: T[], count: number): T[] {
  let input = [...items];
  const output: T[] = [];

  for (let i = 0; i < count; i++) {
    if (input.length == 0) return output;
    const index = randomIndex(input);
    output.push(input[index]!);
    input = removeAt(input, index);
  }

  return output;
}
```

These ones are super useful for returning one random element from a list or multiple. For bonus points you can configure the random number generator yourself so it becomes deterministic (useful for testing).

# randomRange and randomIntRange

While we are talking about random things, these two are super useful:

```ts
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function randomRange(min: number, max: number): number {
  return getRandom().nextNumber() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export function randomIntRange(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(getRandom().nextNumber() * (max - min + 1)) + min;
}
```

# wrap

And one last one

```ts
export function wrap(indx: number, max: number) {
  return ((indx % max) + max) % max;
}
```

This is useful for wrapping a given value within a known range, e.g.:

```ts
export function rotateDimension2DCW(
  { width, height }: Dimensions2D,
  degrees: number
): Dimensions2D {
  const wrapped = wrap(degrees, 360);
  if (wrapped % 90 != 0) throw new Error(`cannot rotate a dimension by a non 90 degree angle`);
  if (wrapped == 0 || wrapped == 180) return { width, height };
  return {
    width: height,
    height: width,
  };
}
```
