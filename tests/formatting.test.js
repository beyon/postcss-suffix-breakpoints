import { run, tachyonsBreakpoints } from './tests-shared';

it('Single and multiline rules', () => {
    return run(
        // input:
        `
.a { color: red; } /* single line */
.a-ns { color: blue; } /* suffixed single line */
.b {
    color: green;
} /* multi line */
.b-ns {
    color: blue;
} /* suffixed multi line */
        `,
        // output:
        `
.a { color: red; } /* single line */
.b {
    color: green;
} /* multi line */

@media (--breakpoint-not-small) {
    .a-ns { color: blue; } /* suffixed single line */
    .b-ns {
        color: blue;
    } /* suffixed multi line */
}

@media (--breakpoint-medium) {
    .a-m { color: red; } /* single line */
    .b-m {
        color: green;
    } /* multi line */
}

@media (--breakpoint-large) {
    .a-l { color: red; } /* single line */
    .b-l {
        color: green;
    } /* multi line */
}
        `,
        tachyonsBreakpoints);
});
