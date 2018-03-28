import { run, tachyonsBreakpoints } from './tests-shared';

it('Basic breakpoint generation', () => {
    return run(
        // input:
        `
.flex { display: flex; }
        `,
        // output:
        `
.flex { display: flex; }

@media (--breakpoint-not-small) {
    .flex-ns { display: flex; }
}

@media (--breakpoint-medium) {
    .flex-m { display: flex; }
}

@media (--breakpoint-large) {
    .flex-l { display: flex; }
}
        `,
        tachyonsBreakpoints);
});

it('Basic breakpoint generation with non-class rules', () => {
    return run(
        // input:
        `
body { text-color: black; }
.flex { display: flex; }
p { text-color: pink; }
        `,
        // output:
        `
body { text-color: black; }
.flex { display: flex; }
p { text-color: pink; }

@media (--breakpoint-not-small) {
    .flex-ns { display: flex; }
}

@media (--breakpoint-medium) {
    .flex-m { display: flex; }
}

@media (--breakpoint-large) {
    .flex-l { display: flex; }
}
        `,
        tachyonsBreakpoints);
});
