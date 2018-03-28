import postcss from 'postcss';

import plugin from '../src';

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input)
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

const tachyonsBreakpoints = {
    breakpoints: [
        { suffix: '-ns', atMediaExpr: '(--breakpoint-not-small)' },
        { suffix: '-m', atMediaExpr: '(--breakpoint-medium)' },
        { suffix: '-l', atMediaExpr: '(--breakpoint-large)' }
    ]
};

export { run, tachyonsBreakpoints };
