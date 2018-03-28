import { run, tachyonsBreakpoints } from './tests-shared';

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
