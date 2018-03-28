import { run, tachyonsBreakpoints } from './tests-shared';

it('Override test', () => {
    return run(
        // input:
        `
.a {color: red;}
.a-ns {color: green;}
.a {color: blue;}
        `,
        // output:
        `
.a {color: red;}
.a {color: blue;}

@media (--breakpoint-not-small) {
    .a-ns {color: blue;}
}

@media (--breakpoint-medium) {
    .a-m {color: blue;}
}

@media (--breakpoint-large) {
    .a-l {color: blue;}
}
        `,
        tachyonsBreakpoints);
});

it('Suffixed selectors without any non-suffixed base', () => {
    return run(
        // input:
        `
.a-ns {color: red;}
.a-l {color: green;}
        `,
        // output:
        `

@media (--breakpoint-not-small) {
    .a-ns {color: red;}
}

@media (--breakpoint-large) {
    .a-l {color: green;}
}
        `,
        tachyonsBreakpoints);
});

