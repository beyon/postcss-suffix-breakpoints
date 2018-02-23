// paste into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
// import * as postcss from 'postcss';

var postcss = require('postcss');

module.exports = postcss.plugin('postcss-suffix-breakpoints', function (opts) {
    opts = opts || {};
    // Work with options here
    var breakpoints = [{ suffix: '-ns', var: '--breakpoint-not-small' },
        { suffix: '-m', var: '--breakpoint-medium' },
        { suffix: '-l', var: '--breakpoint-large' }
    ];
    var breakpointRules = new Map();
    // init breakpoint_rules to hold empty arrays for all suffixes
    for (var idxInit = 0; idxInit < breakpoints.length; idxInit++) {
        breakpointRules.set( breakpoints[idxInit].suffix, [] );
    }
    return function (root, result) {
        var classRules = [];
        root.walkRules(rule => {
            if ( rule.selector.startsWith('.') ) {
                var isBreakpointRule = false;
                for ( var bp = 0; bp < breakpoints.length; bp++) {
                    var suffix = breakpoints[bp].suffix;
                    if ( rule.selector.endsWith( suffix ) ) {
                        isBreakpointRule = true;

                        // update/add rule to rules for current suffix
                        var suffixRules = breakpointRules.get( suffix );
                        suffixRules.push(rule.clone());
                        breakpointRules.set( suffix, suffixRules );

                        // stop iterating, can only be one suffix per rule
                        break;
                    }
                }
                if ( isBreakpointRule ) rule.remove();
                else classRules.push( rule.clone() );
            }
        });

        for (var bp = 0; bp < breakpoints.length; bp++)  {
            var mediaClassRules = new Map();
            var suffix = breakpoints[bp].suffix;
            // copy class rules for all non suffixed rules and add suffix to
            // selector for current breakpoint
            for (var idx = 0; idx < classRules.length; idx++) {
                var className = classRules[idx].selector;
                var nameWithSuffix = className + suffix;
                mediaClassRules.set(
                    nameWithSuffix,
                    classRules[idx].clone({ selector: nameWithSuffix }) );
            }
            // override suffixed rules with manually added ones
            var manualSuffixRules = breakpointRules.get(suffix);
            for ( var r = 0; r < manualSuffixRules.length; r++) {
                mediaClassRules.set(
                    manualSuffixRules[r].selector,
                    manualSuffixRules[r].clone() );
            }
            root.append({
                name: 'media',
                params: '(' + breakpoints[bp].var + ')',
                nodes: Array.from(mediaClassRules.values())
            });
        }
    };
});
