// paste into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
import * as postcss from 'postcss';

function filterInvalidBreakpoints(breakpoints, result) {
    if (Array.isArray(breakpoints) && breakpoints.length > 0) {
        breakpoints = breakpoints.filter((breakpoint, bpIdx) => {
            let validSuffix = false;
            let validAtMediaExpr = false;
            if ('suffix' in breakpoint &&
                typeof breakpoint.suffix === 'string' &&
                breakpoint.suffix.length > 0) {
                validSuffix = true;
            } else {
                result.warn('no valid suffix for breakpoint with index: ' +
                            bpIdx.toString());
            }
            if ('atMediaExpr' in breakpoint &&
                typeof breakpoint.suffix === 'string' &&
                breakpoint.atMediaExpr.length > 0) {
                validAtMediaExpr = true;
            } else {
                result.warn('no valid atMediaExpr for breakpoint with index: ' +
                            bpIdx.toString());
            }
            return validSuffix && validAtMediaExpr;
        });
    } else {
        // Nothing for plugin todo - warn?
    }
    // return { breakpoints, result };
    return breakpoints;
}

export default postcss.plugin(
    'postcss-suffix-breakpoints',
    ({ breakpoints = [] } = {} ) => {
        return function (root, result) {
            // ({ breakpoints, result } =
            //     filterInvalidBreakpoints(breakpoints, result));
            breakpoints = filterInvalidBreakpoints(breakpoints, result);
            let breakpointRules = new Map();
            // init breakpoint_rules to hold empty arrays for all suffixes
            for (let idx = 0; idx < breakpoints.length; idx++) {
                breakpointRules.set( breakpoints[idx].suffix, [] );
            }
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
                    params: breakpoints[bp].atMediaExpr,
                    nodes: Array.from(mediaClassRules.values())
                });
            }
        };
    });


