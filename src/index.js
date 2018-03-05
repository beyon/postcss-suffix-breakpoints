// paste into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
import * as postcss from 'postcss';

export default postcss.plugin('postcss-reverse-props', (options = {}) => {
    // Work with options here
    let breakpoints = [{ suffix: '-ns', var: '--breakpoint-not-small' },
        { suffix: '-m', var: '--breakpoint-medium' },
        { suffix: '-l', var: '--breakpoint-large' }
    ];
    let breakpointRules = new Map();
    // init breakpoint_rules to hold empty arrays for all suffixes
    for (let idx = 0; idx < breakpoints.length; idx++) {
        breakpointRules.set( breakpoints[idx].suffix, [] );
    }
    return function (root, result) {
        let classRules = [];
        root.walkRules(rule => {
            if ( rule.selector.startsWith('.') ) {
                let isBreakpointRule = false;
                for ( let bp = 0; bp < breakpoints.length; bp++) {
                    let suffix = breakpoints[bp].suffix;
                    if ( rule.selector.endsWith( suffix ) ) {
                        isBreakpointRule = true;

                        // update/add rule to rules for current suffix
                        let suffixRules = breakpointRules.get( suffix );
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

        for (let bp = 0; bp < breakpoints.length; bp++)  {
            let mediaClassRules = new Map();
            let suffix = breakpoints[bp].suffix;
            // copy class rules for all non suffixed rules and add suffix to
            // selector for current breakpoint
            for (let idx = 0; idx < classRules.length; idx++) {
                const className = classRules[idx].selector;
                const nameWithSuffix = className + suffix;
                mediaClassRules.set(
                    nameWithSuffix,
                    classRules[idx].clone({ selector: nameWithSuffix }) );
            }
            // override suffixed rules with manually added ones
            let manualSuffixRules = breakpointRules.get(suffix);
            for ( let r = 0; r < manualSuffixRules.length; r++) {
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
