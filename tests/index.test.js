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

it('sample test to get tests up and running', () => {
    let options = {
        breakpoints: [
            { suffix: '-ns', atMediaExpr: '--breakpoint-not-small' },
            { suffix: '-m', atMediaExpr: '--breakpoint-medium' },
            { suffix: '-l', atMediaExpr: '--breakpoint-large' }
        ]
    };
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
        options);
});

it('Options suffix warning', () => {
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
