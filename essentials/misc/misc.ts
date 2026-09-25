/* eslint-disable @typescript-eslint/ban-types */
import { Config } from "../config/Config";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type ThenArg<T> = T extends Promise<infer U> ? U : T;

interface Omitted {
  <T extends object, K extends [...(keyof T)[]]>(
    obj: T,
    ...keys: K
  ): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2];
  };
}

export type Maybe<T> = T | null | undefined;

export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

export const omit: Omitted = (obj, ...keys) => {
  const ret = {} as { [K in keyof typeof obj]: (typeof obj)[K] };
  let key: keyof typeof obj;
  for (key in obj) {
    if (keys.indexOf(key) == -1) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

type Primitive = string | Function | number | boolean | Symbol | undefined | null;

type DeepOmitArray<T extends any[], K> = {
  [P in keyof T]: DeepOmit<T[P], K>;
};

export type DeepOmit<T, K> = T extends Primitive
  ? T
  : {
      [P in Exclude<keyof T, K>]: T[P] extends infer TP
        ? TP extends Primitive
          ? TP // leave primitives and functions alone
          : TP extends any[]
            ? DeepOmitArray<TP, K> // Array special handling
            : DeepOmit<TP, K>
        : never;
    };

export function omitDeep<T extends object, K extends string>(obj: T, toOmit: K): DeepOmit<T, K> {
  return JSON.parse(JSON.stringify(obj), (key: string, value: any) =>
    key === toOmit ? undefined : value,
  );
}

export const redact: Omitted = (obj, ...keys) => {
  const redacted = { ...obj };
  for (const key of keys) {
    if (key in redacted) (redacted as any)[key] = "-- REDACTED --";
  }
  return redacted;
};

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {};
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}

export const isEmpty = (value: any) => {
  if (typeof value === "number") return false;
  else if (typeof value === "string") return value.trim().length === 0;
  else if (Array.isArray(value)) return value.length === 0;
  else if (typeof value === "object") return value == null || Object.keys(value).length === 0;
  else if (typeof value === "boolean") return false;
  else return !value;
};

export const getGlobal = () => globalThis;

export const supportsChromeAPI = () => {
  return (getGlobal() as any).chrome != undefined;
};

let _config: Config<{ NODE_ENV: string }> | undefined;
export const isProduction = (): boolean => {
  if (!_config)
    _config = new Config({
      NODE_ENV: "",
    }).overlayEnv();

  return _config.get("NODE_ENV") == "production";
};

export const makeLogSafe = (password: string) =>
  password
    .split("")
    .map((_) => "*")
    .join("");

export function wait(ms: number) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

export function waitForAtLeast<T>(minTimeMs: number, promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const start = Date.now();
    let minTimeReached = false;
    let promiseReturned = false;
    let value: T;
    let error: Error;

    const done = () => {
      if (error) reject(error);
      else resolve(value);
    };

    setTimeout(() => {
      minTimeReached = true;
      if (promiseReturned) done();
    }, minTimeMs);

    promise
      .then((v) => {
        value = v;
        promiseReturned = true;
        if (minTimeReached) done();
      })
      .catch((e) => {
        error = e;
        promiseReturned = true;
        if (minTimeReached) done();
      });
  });
}

export const fileExtension = (url: string) => {
  const re = /(?:\.([^.]+))?$/;
  const ext = re.exec(url);
  if (!ext || ext.length == 0) return "jpg";
  return ext;
};

export const resolveOr = async <T, U>(promise: Promise<T>, alternative: U): Promise<T | U> =>
  promise.catch(() => alternative);

export const anything: any = {};

export const setFalse = (fn: (b: boolean) => void) => () => fn(false);

export const setTrue = (fn: (b: boolean) => void) => () => fn(true);

export function limitStr(str: string, maxLen: number, elipsis = "...") {
  if (str.length < maxLen - elipsis.length) return str;

  return str.substr(0, Math.max(0, maxLen - elipsis.length)) + elipsis;
}

// Cleans up and prepends any missing scheme
export const hrefFromUrl = (url: string | undefined) => {
  if (!url) return "";

  const trimmed = url.trim();
  return trimmed.indexOf("://") === -1 ? "https://" + trimmed : trimmed;
};

export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export const sequence = (count: number): number[] => {
  return [...Array(Math.floor(count)).keys()];
};

export function notNull<T>(obj: T | undefined | null): T {
  if (obj == undefined || obj == null) throw new Error("Object should not be null or undefined");
  return obj;
}

export function trancateString(str: string, maxLen: number, elipsis = "...") {
  if (str.length < maxLen) return str;

  return str.substring(0, maxLen - 3) + elipsis;
}

export const inputChangeHandler = (fn: (value: string) => any) => (e?: any) => {
  fn(e.target.value);
};

export const preventDefault = (fn: () => any) => (e: { preventDefault: () => any }) => {
  e.preventDefault();
  fn();
};

export const setFalseThen = (fn: (b: boolean) => void, thenFn?: () => any) => () => {
  fn(false);
  thenFn && thenFn();
};

export const setTrueThen = (fn: (b: boolean) => void, thenFn?: () => any) => () => {
  fn(true);
  thenFn && thenFn();
};

/**
 * Returns a number limited to the range of min and max (inclusive)
 * @param val
 * @param min
 * @param max
 */
export function clamp(val: number, min: number, max: number) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

export const quickHash = (s: string) => {
  let hash = 0;
  let i;
  let chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Borrowed from: https://codepen.io/daniellmb/pen/JKGamY
export function leftPad(val: string | number, len: number, ch = "0"): string {
  const str = String(val);
  len = len - str.length + 1;
  return len > 0 ? new Array(len).join(ch) + str : str;
}

export function getAt<T>(arr: T[], index: number): T {
  const el = arr[index];
  if (el == undefined)
    throw new Error(
      `Could not get element at index '${index}' in array, it appears to be undefined`,
    );
  return el;
}

export const ensureFindIndex = <T>(
  arr: T[],
  pred: (el: T) => boolean,
  err = `Could not find element index`,
) => {
  const index = arr.findIndex(pred);
  if (index == -1) throw new Error(err);
  return index;
};

export const simultaneously = <P, T extends Record<string, P>, U>(
  obj: T,
  fn: (entry: P) => Promise<U>,
) => {
  return Promise.all(
    Object.entries(obj).map(([key, value]) => fn(value).then((result) => ({ key, result }))),
  ).then((entries) =>
    entries.reduce(
      (accum, curr) => ({ ...accum, [curr.key]: curr.result }),
      {} as Record<keyof T, U>,
    ),
  );
};

export function exhaustiveCheck(param: never): never {
  throw new Error(`Exhaustive check failed: ${param}`);
}

export const idArrayToRecord = <T extends { id: string }>(objects: T[]): Record<string, T> =>
  arrayToRecord(objects, (o) => o.id);

export const arrayToRecord = <T extends object>(
  objects: T[],
  getKey: (item: T) => string,
): Record<string, T> => {
  const obj: any = {};
  for (const o of objects) obj[getKey(o)] = o;
  return obj;
};

export const arrayToRecordWithValueGetter = <T extends object, V>(
  objects: T[],
  getKey: (item: T) => string,
  getValue: (item: T) => V = (item) => item as unknown as V, // Default to original object if no getValue function is provided
): Record<string, V> => {
  const obj: Record<string, V> = {};
  for (const o of objects) {
    obj[getKey(o)] = getValue(o);
  }
  return obj;
};

export function idTupleToRecord<T extends { id: keyof any }>(
  tuple: ReadonlyArray<T>,
): Record<T["id"], T> {
  return tuple.reduce(
    (acc, element) => {
      (acc as any)[element.id] = element;
      return acc;
    },
    {} as Record<T["id"], T>,
  );
}

export const potentialRecordToRecord = <T extends Record<string, unknown>>(
  potential: T[] | Record<string, T> | undefined,
  getKey: (item: T) => string,
): Record<string, T> => {
  if (!potential) return {};
  if (Array.isArray(potential)) return arrayToRecord(potential, getKey);
  return potential;
};

export const buildQueryString = (obj: Record<string, any> | undefined) => {
  if (!obj) return ``;
  return (
    `?` +
    Object.keys(obj)
      .map((k) => `${k}=${obj[k]}`)
      .join("&")
  );
};

export const checkIfDuplicatesExistsInArray = (arr: string[]) => new Set(arr).size !== arr.length;

export const optionalParams = <T extends Record<string, any>>(
  params: Partial<T> | undefined,
  alternatives: T,
): T =>
  Object.keys(alternatives).reduce(
    (accum, key) => ({
      ...accum,
      [key]: params && params[key] != undefined ? params[key] : alternatives[key],
    }),
    {},
  ) as any;

export const objectMap = <TInp, TOutp, TInpRecord extends Record<string, TInp>>(
  objInput: TInpRecord,
  mapper: (value: TInp, key: string) => TOutp,
): Record<keyof TInpRecord, TOutp> => {
  const outp: any = {};
  for (const key in objInput) outp[key] = mapper(objInput[key]!, key);
  return outp;
};

export const objectMapStr = <TInp, TOut>(
  objInput: { [s: string]: TInp },
  mapper: (value: TInp, key: string) => TOut,
): { [s: string]: TOut } => {
  const outp: any = {};
  for (const key in objInput) outp[key] = mapper(objInput[key]!, key);
  return outp;
};

export const objectFilter = <TInp>(
  objInput: Record<string, TInp>,
  predicate: (value: TInp, key: string) => boolean,
): Record<string, TInp> => {
  const outp: any = {};
  for (const key in objInput) {
    if (predicate(objInput[key]!, key)) outp[key] = objInput[key];
  }
  return outp;
};

export const cast = <T>(val: any): T => val;

export const iife = <T>(fn: () => T): T => fn();

export const isFunction = (value: unknown) =>
  value &&
  (Object.prototype.toString.call(value) === "[object Function]" ||
    typeof value === "function" ||
    value instanceof Function);

export const undefinedToNull = <T>(value: T | undefined): T | null =>
  value === undefined ? null : value;

export const isBrowserExtension = (url: string) =>
  url.toLocaleLowerCase().startsWith(`chrome-extension://`) ||
  url.toLocaleLowerCase().startsWith(`extension://`);

export const formatCount = (value: number): string => {
  // Configuration
  const COUNT_FORMATS = [
    {
      // 0 - 999
      letter: "",
      limit: 1e3,
    },
    {
      // 1,000 - 999,999
      letter: "K",
      limit: 1e6,
    },
    {
      // 1,000,000 - 999,999,999
      letter: "M",
      limit: 1e9,
    },
    {
      // 1,000,000,000 - 999,999,999,999
      letter: "B",
      limit: 1e12,
    },
    {
      // 1,000,000,000,000 - 999,999,999,999,999
      letter: "T",
      limit: 1e15,
    },
  ];

  // Format Method:
  const format = COUNT_FORMATS.find((format) => value < format.limit);
  if (!format) return String(value);

  value = (1000 * value) / format.limit;
  value = Math.round(value * 10) / 10; // keep one decimal number, only if needed

  return value + format.letter;
};
