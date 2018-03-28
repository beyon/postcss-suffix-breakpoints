import { run, tachyonsBreakpoints } from './tests-shared';

it('Multiple selectors', () => {
    return run(
        // input:
        `
p,.a,.b,span,.a-m,.c,.d-ns { color: red; }
        `,
        // output:
        `
p,.a,.b,span,.c { color: red; }

@media (--breakpoint-not-small) {
    .a-ns { color: red; }
    .b-ns { color: red; }
    .c-ns { color: red; }
    .d-ns { color: red; }
}

@media (--breakpoint-medium) {
    .a-m { color: red; }
    .b-m { color: red; }
    .c-m { color: red; }
}

@media (--breakpoint-large) {
    .a-l { color: red; }
    .b-l { color: red; }
    .c-l { color: red; }
}
        `,
        tachyonsBreakpoints);
});
