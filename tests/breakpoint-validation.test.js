// import { tachyonsBreakpoints } from './tests-shared';

import postcss from 'postcss';

import plugin from '../src';

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
