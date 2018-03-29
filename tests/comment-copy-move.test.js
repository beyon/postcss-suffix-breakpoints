import { run, breakpointsXY } from './tests-shared';

it('Copy/Move comments', () => {
    return run(
        // input:
        `
.a { color: red; } /* single line */
.a-x { color: blue; } /* suffixed single line */
.b {
    color: green;
} /* multi line */
.b-x {
    color: blue;
} /* suffixed multi line */
.c, .c-x {
    color: orange;
} /* multi selector with and without suffixed rule comment */
        `,
        // output:
        `
.a { color: red; } /* single line */
.b {
    color: green;
} /* multi line */
.c {
    color: orange;
} /* multi selector with and without suffixed rule comment */

@media (--breakpoint-x) {
    .a-x { color: blue; } /* suffixed single line */
    .b-x {
        color: blue;
    } /* suffixed multi line */
    .c-x {
        color: orange;
    } /* multi selector with and without suffixed rule comment */
}

@media (--breakpoint-y) {
    .a-y { color: red; } /* single line */
    .b-y {
        color: green;
    } /* multi line */
    .c-y {
        color: orange;
    } /* multi selector with and without suffixed rule comment */
}
        `,
        breakpointsXY);
});
