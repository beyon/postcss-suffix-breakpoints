# PostCSS Suffix Breakpoints [![Build Status][ci-img]][ci]

[PostCSS] plugin to generate breakpoint specific css classes from a set of suffixes.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/beyon/postcss-suffix-breakpoints.svg
[ci]:      https://travis-ci.org/beyon/postcss-suffix-breakpoints

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-suffix-breakpoints') ])
```

See [PostCSS] docs for examples for your environment.
