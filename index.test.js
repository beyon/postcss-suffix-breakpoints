var postcss = require('postcss');

var plugin = require('./');

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input)
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

it('does something', () => {
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
        // options:
        { });
});
