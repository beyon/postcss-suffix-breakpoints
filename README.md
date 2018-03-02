# PostCSS Suffix Breakpoints [![Build Status][ci-img]][ci]

[PostCSS] plugin to generate breakpoint specific css classes from a set of suffixes.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/beyon/postcss-suffix-breakpoints.svg
[ci]:      https://travis-ci.org/beyon/postcss-suffix-breakpoints

## What

Simplifies your CSS source files (and maintainance) when writing atomic css similar to Tachyons - atomic CSS rules that are mostly duplicates for all your media query breakpoints. Generates suffixed class rules wrapped in @media rules for all your beakpoints.
## Examples
### Input:
```css
body { color: black; }

.flex { display: flex; }

.txt-size-1 { font-size: 3rem; }

.txt-size-1-m { font-size: 2.5rem; } /* use different value for -m breakpoint */
```

### Output:
```css
body { color: black; }

.flex { display: flex; }

@media (--breakpoint-not-small) {
  .flex-ns { display: flex; }
  .txt-size-1-ns { font-size: 3rem; }
}

@media (--breakpoint-medium) {
  .flex-m { display: flex; }
  .txt-size-1-m { font-size: 2.5rem; } /* manual rule */
}

@media (--breakpoint-large) {
  .flex-l { display: flex; }
  .txt-size-1-l { font-size: 3rem; }
}
```

## Usage

```js
postcss([ require('postcss-suffix-breakpoints') ])
```

See [PostCSS] docs for examples for your environment.
