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

function testNoOptions() {
    return postcss([ plugin() ]).process('body { }')
        .then(result => {
            let resultingWarnings = result.warnings();
            const warnings = [
                'options.breakpoints[] has zero elements',
                'Nothing to do! (No valid breakpoints supplied)'
            ];
            expect(resultingWarnings.length).toBe(2);
            for (let w = 0; w < resultingWarnings.length; w++) {
                let { text: warningText } = resultingWarnings[w];
                expect(warningText).toEqual(warnings[w]);
            }
        });
}

it('has no options', () => {
    return testNoOptions();
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

it('is not an array', () => {
    let options = {
        breakpoints: null
    };
    return testOptionWarnings(
        2,
        [
            'options.breakpoints is not an array',
            'Nothing to do! (No valid breakpoints supplied)'
        ],
        options);
});

it('is zero element array', () => {
    let options = {
        breakpoints: []
    };
    return testOptionWarnings(
        2,
        [
            'options.breakpoints[] has zero elements',
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
