import postcss from 'postcss';

import plugin from '../src';

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input)
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

function testOptionWarnings(warningCount, warnings, opts) {
    return postcss([ plugin(opts) ]).process('body { }')
        .then(result => {
            let resultingWarnings = result.warnings();
            expect(resultingWarnings.length).toBe(warningCount);
            for (let w = 0; w < resultingWarnings.length; w++) {
                let { text: warningText } = resultingWarnings[w];
                expect(warningText).toEqual(warnings[w]);
            }
        });
}

const tachyonsBreakpoints = {
    breakpoints: [
        { suffix: '-ns', atMediaExpr: '(--breakpoint-not-small)' },
        { suffix: '-m', atMediaExpr: '(--breakpoint-medium)' },
        { suffix: '-l', atMediaExpr: '(--breakpoint-large)' }
    ]
};

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
.flex-ns { display: flex; } }
@media (--breakpoint-medium) {
.flex-m { display: flex; } }
@media (--breakpoint-large) {
.flex-l { display: flex; } }
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
.flex-ns { display: flex; } }
@media (--breakpoint-medium) {
.flex-m { display: flex; } }
@media (--breakpoint-large) {
.flex-l { display: flex; } }
        `,
        tachyonsBreakpoints);
});

it('No valid breakpoints', () => {
    let options = {
        breakpoints: [
            { suffix: 2, atMediaExpr: '--SomeVar' },
            { suffix: '-m', atMediaExpr: '' }
        ]
    };
    return testOptionWarnings(
        3,
        [
            'no valid suffix for breakpoint with index: 0',
            'no valid atMediaExpr for breakpoint with index: 1',
            'Nothing to do! (No valid breakpoints supplied)'
        ],
        options);
});

it('Options atMediaExpr warning', () => {
    let options = {
        breakpoints: [
            { suffix: '-ns', atMediaExpr: '--SomeVar' },
            { suffix: '-m', atMediaExpr: '' }
        ]
    };
    return testOptionWarnings(
        1,
        ['no valid atMediaExpr for breakpoint with index: 1'],
        options);
});
