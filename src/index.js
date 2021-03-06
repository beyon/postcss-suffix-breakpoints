// paste into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
import * as postcss from 'postcss';

/**
 * typedef breakpoint
 */

/**
 * Split class name selector into class name, pseudo separator and
 * pseudo class
 * @param {string} ruleSelector class name selector string
 * @returns {{ className: string, pSeparator: string, pseudo: string}}
 *  Chopped result, pSeparator and pseudo will be undefined for input
 *  without any pseudo selector
 */
function chopPseudo(ruleSelector) {
    let className = ruleSelector;
    let pseudo = undefined;
    let pSeparator = undefined;
    const match = ruleSelector.match(/::?/);
    if (match) {
        pSeparator = match[0];
        let matchIndex = ruleSelector.indexOf(pSeparator);
        className = ruleSelector.substring(0, matchIndex);
        pseudo = ruleSelector.substring(matchIndex + pSeparator.length);
    }
    return { className, pSeparator, pseudo };
}

function filterInvalidBreakpoints(breakpoints, result) {
    let hasValidBreakpoints = false;
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
                typeof breakpoint.atMediaExpr === 'string' &&
                breakpoint.atMediaExpr.length > 0) {
                validAtMediaExpr = true;
            } else {
                result.warn('no valid atMediaExpr for breakpoint with index: ' +
                            bpIdx.toString());
            }
            return validSuffix && validAtMediaExpr;
        });
        hasValidBreakpoints = breakpoints.length > 0;
    }
    return { hasValidBreakpoints, breakpoints };
}
/**
 * Main CSS AST processing function
 * @param {any} breakpoints - suffix and @media expression from plugin options
 * @param {any} formatting - formatting options
 * @param {postcss.Root} root - postcss AST root node
 */
function processCSS(breakpoints, formatting, root) {
    let breakpointRules = new Map();
    // init breakpoint_rules to hold empty arrays for all suffixes
    for (let idx = 0; idx < breakpoints.length; idx++) {
        breakpointRules.set(breakpoints[idx].suffix, []);
    }
    let classRules = [];
    let movedComments = new Map();

    // Copy class rules into either class rules to prefix (classRules)
    // collection and move already suffixed class rules into suffixRules
    root.walkRules(rule => {
        // Only work on individual class selectors
        // (for now, see issue #1)
        if (rule.selector.startsWith('.')) {
            // Check if previous node is '!no-suffix' comment
            const prevNode = rule.prev();
            const hasIgnoreComment =
                prevNode &&
                prevNode.type === 'comment' &&
                prevNode.text === '!no-suffix';
            const notIgnored = !hasIgnoreComment;
            if (notIgnored) {
                let isSuffixedRule = false;
                for (let bp = 0; bp < breakpoints.length; bp++) {
                    let suffix = breakpoints[bp].suffix;
                    // get classname and ignore pseudo part
                    const { className } = chopPseudo(rule.selector);
                    if (className.endsWith(suffix)) {
                        isSuffixedRule = true;
                        // update/add rule to rules for current suffix
                        let suffixRules = breakpointRules.get(suffix);
                        suffixRules.push(rule.clone());
                        breakpointRules.set(suffix, suffixRules);
                        // stop iterating, can only be one suffix per rule
                        break;
                    }
                }
                if (isSuffixedRule) {
                    const nextNode = rule.next();
                    const isSameLineComment =
                        nextNode &&
                        nextNode.type === 'comment' &&
                        nextNode.source.start.line === rule.source.end.line;
                    if (isSameLineComment) {
                        movedComments.set(
                            rule.source.start.line,
                            nextNode.clone()
                        );
                        nextNode.remove();
                    }
                    rule.remove();
                } else {
                    classRules.push(rule.clone());
                }
            }
        }
    });
    for (let bp = 0; bp < breakpoints.length; bp++) {
        let mediaClassRules = new Map();
        let suffix = breakpoints[bp].suffix;
        // copy class rules for all non suffixed rules and add suffix to
        // selector for current breakpoint
        for (let idx = 0; idx < classRules.length; idx++) {
            const selector = classRules[idx].selector;
            const { className } = chopPseudo(selector);
            const nameWithSuffix = className + suffix;
            const updatedSelector = selector.replace(className, nameWithSuffix);
            mediaClassRules.set(
                updatedSelector,
                classRules[idx].clone({ selector: updatedSelector })
            );
        }
        // override suffixed rules with manually added ones
        let manualSuffixRules = breakpointRules.get(suffix);
        for (let r = 0; r < manualSuffixRules.length; r++) {
            mediaClassRules.set(
                manualSuffixRules[r].selector,
                manualSuffixRules[r].clone()
            );
        }
        const indent = formatting.indentation;
        const newLine = '\n';
        let newMediaRule = postcss.atRule();
        let atMediaChildNodes =
            Array.from(mediaClassRules.values())
                .map( rule => {
                    rule.parent = newMediaRule;
                    let multiDecl = rule.nodes.length > 1;
                    rule.raws.before = newLine + indent;
                    if (multiDecl) {
                        rule.nodes.map( child => {
                            child.raws.before = newLine + indent + indent;
                        });
                        rule.raws.after = newLine + indent;
                    }
                    return rule;
                });
        newMediaRule.name = 'media';
        newMediaRule.params = breakpoints[bp].atMediaExpr;
        newMediaRule.nodes = atMediaChildNodes;
        // add moved comments if any
        newMediaRule.walkRules( rule => {
            const comment = movedComments.get(rule.source.end.line);
            if (comment) {
                rule.after(comment.clone());
            }
        });
        root.append(newMediaRule);
        newMediaRule.raws.before = '\n\n';
        newMediaRule.raws.after = '\n';
    }
}

export default postcss.plugin(
    'postcss-suffix-breakpoints',
    (
        {
            breakpoints = [],
            formatting = {
                indentation: '    '
            }
        } = {}
    ) => {
        return function (root, result) {
            let hasValidBreakpoints;
            ({ hasValidBreakpoints, breakpoints } =
                    filterInvalidBreakpoints(breakpoints, result));
            if (hasValidBreakpoints) {
                processCSS(breakpoints, formatting, root);
            } else {
                result.warn('Nothing to do! (No valid breakpoints supplied)');
            }
        };
    });
