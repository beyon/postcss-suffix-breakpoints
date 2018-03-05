'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _postcss = require('postcss');

var postcss = _interopRequireWildcard(_postcss);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function filterInvalidBreakpoints(breakpoints, result) {
    if (Array.isArray(breakpoints) && breakpoints.length > 0) {
        breakpoints = breakpoints.filter(function (breakpoint, bpIdx) {
            var validSuffix = false;
            var validAtMediaExpr = false;
            if ('suffix' in breakpoint && typeof breakpoint.suffix === 'string' && breakpoint.suffix.length > 0) {
                validSuffix = true;
            } else {
                result.warn('no valid suffix for breakpoint with index: ' + bpIdx.toString());
            }
            if ('atMediaExpr' in breakpoint && typeof breakpoint.suffix === 'string' && breakpoint.atMediaExpr.length > 0) {
                validAtMediaExpr = true;
            } else {
                result.warn('no valid atMediaExpr for breakpoint with index: ' + bpIdx.toString());
            }
            return validSuffix && validAtMediaExpr;
        });
    } else {}
    // Nothing for plugin todo - warn?

    // return { breakpoints, result };
    return breakpoints;
} // paste into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
exports.default = postcss.plugin('postcss-suffix-breakpoints', function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$breakpoints = _ref.breakpoints,
        breakpoints = _ref$breakpoints === undefined ? [] : _ref$breakpoints;

    return function (root, result) {
        // ({ breakpoints, result } =
        //     filterInvalidBreakpoints(breakpoints, result));
        breakpoints = filterInvalidBreakpoints(breakpoints, result);
        var breakpointRules = new Map();
        // init breakpoint_rules to hold empty arrays for all suffixes
        for (var idx = 0; idx < breakpoints.length; idx++) {
            breakpointRules.set(breakpoints[idx].suffix, []);
        }
        var classRules = [];
        root.walkRules(function (rule) {
            if (rule.selector.startsWith('.')) {
                var isBreakpointRule = false;
                for (var bp = 0; bp < breakpoints.length; bp++) {
                    var suffix = breakpoints[bp].suffix;
                    if (rule.selector.endsWith(suffix)) {
                        isBreakpointRule = true;

                        // update/add rule to rules for current suffix
                        var suffixRules = breakpointRules.get(suffix);
                        suffixRules.push(rule.clone());
                        breakpointRules.set(suffix, suffixRules);

                        // stop iterating, can only be one suffix per rule
                        break;
                    }
                }
                if (isBreakpointRule) rule.remove();else classRules.push(rule.clone());
            }
        });

        for (var bp = 0; bp < breakpoints.length; bp++) {
            var mediaClassRules = new Map();
            var suffix = breakpoints[bp].suffix;
            // copy class rules for all non suffixed rules and add suffix to
            // selector for current breakpoint
            for (var _idx = 0; _idx < classRules.length; _idx++) {
                var className = classRules[_idx].selector;
                var nameWithSuffix = className + suffix;
                mediaClassRules.set(nameWithSuffix, classRules[_idx].clone({ selector: nameWithSuffix }));
            }
            // override suffixed rules with manually added ones
            var manualSuffixRules = breakpointRules.get(suffix);
            for (var r = 0; r < manualSuffixRules.length; r++) {
                mediaClassRules.set(manualSuffixRules[r].selector, manualSuffixRules[r].clone());
            }
            root.append({
                name: 'media',
                params: '(' + breakpoints[bp].atMediaExpr + ')',
                nodes: Array.from(mediaClassRules.values())
            });
        }
    };
});
