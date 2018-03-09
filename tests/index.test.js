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

it('Mixed test', () => {
    return run(
        // input:
        `
body { text-color: black; }

.flex { display: flex; }
.red {
    text-color: red;
    bg-color: pink;
}

.green { text-color: green; }

p { text-color: pink; } /* comment */

.flex-m { display: inline-flex; } /* manual */

/* !no-suffix */
.fish:hover { text-color: blue; }

.pseudo { text-color: black; }
.pseudo:hover { text-color: gold; }
.pseudo-ns:hover { text-color: silver; }
.pseudoelement::after { content: " - This comes after"; }

        `,
        // output:
        `
body { text-color: black; }

.flex { display: flex; }
.red {
    text-color: red;
    bg-color: pink;
}

.green { text-color: green; }

p { text-color: pink; } /* comment */

/* !no-suffix */
.fish:hover { text-color: blue; }

.pseudo { text-color: black; }
.pseudo:hover { text-color: gold; }
.pseudoelement::after { content: " - This comes after"; }

@media (--breakpoint-not-small) {
    .flex-ns { display: flex; }
    .red-ns {
        text-color: red;
        bg-color: pink;
    }
    .green-ns { text-color: green; }
    .pseudo-ns { text-color: black; }
    .pseudo-ns:hover { text-color: silver; }
    .pseudoelement-ns::after { content: " - This comes after"; }
}

@media (--breakpoint-medium) {
    .flex-m { display: inline-flex; } /* manual */
    .red-m {
        text-color: red;
        bg-color: pink;
    }
    .green-m { text-color: green; }
    .pseudo-m { text-color: black; }
    .pseudo-m:hover { text-color: gold; }
    .pseudoelement-m::after { content: " - This comes after"; }
}

@media (--breakpoint-large) {
    .flex-l { display: flex; }
    .red-l {
        text-color: red;
        bg-color: pink;
    }
    .green-l { text-color: green; }
    .pseudo-l { text-color: black; }
    .pseudo-l:hover { text-color: gold; }
    .pseudoelement-l::after { content: " - This comes after"; }
}

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
