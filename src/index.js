// paste into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
import * as postcss from 'postcss';

const newLine = '\n';
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

function moveComment(rule, movedComments) {
    const nextNode = rule.next();
    const isSameLineComment = nextNode &&
        nextNode.type === 'comment' &&
        nextNode.source.start.line === rule.source.end.line;
    if (isSameLineComment) {
        movedComments.set(rule.source.start.line, nextNode.clone());
        nextNode.remove();
    }
    rule.remove();
}

function notIgnored(node) {
    const hasIgnoreComment = node &&
    node.type === 'comment' &&
    node.text === '!no-suffix';
    return !hasIgnoreComment;
}

function addToCurrentSuffix(alreadSuffixedRules, suffix, rule) {
    let suffixRules = alreadSuffixedRules.get(suffix);
    suffixRules.push(rule.clone());
    alreadSuffixedRules.set(suffix, suffixRules);
}

/**
 * Copy class rules into either class rules to prefix (classRules)
 * collection and move already suffixed class rules into suffixRules
 * @param {*} breakpoints
 * @param {*} alreadSuffixedRules
 * @param {*} movedComments
 * @param {*} classRules
 */
function ruleJob(breakpoints, alreadSuffixedRules, movedComments, classRules) {
    return rule => {
        // Only work on individual class selectors
        // (for now, see issue #1)
        if (rule.selector.startsWith('.')) {
            // Check if previous node is '!no-suffix' comment
            if (notIgnored(rule.prev())) {
                let isSuffixedRule = false;
                for ( let breakpoint of breakpoints) {
                    // get classname and ignore pseudo part
                    const { className } = chopPseudo(rule.selector);
                    if (className.endsWith(breakpoint.suffix)) {
                        isSuffixedRule = true;
                        addToCurrentSuffix(
                            alreadSuffixedRules, breakpoint.suffix, rule);
                        break; // can only be one suffix per rule
                    }
                }
                if (isSuffixedRule) {
                    moveComment(rule, movedComments);
                } else {
                    classRules.push(rule.clone());
                }
            }
        }
    };
}

function createNewMediaRule(
    mediaClassRules,
    indent,
    breakpoint,
    movedComments
) {
    let newMediaRule = postcss.atRule();
    let atMediaChildNodes = Array.from(mediaClassRules.values())
        .map(rule => {
            rule.parent = newMediaRule;
            let multiDecl = rule.nodes.length > 1;
            rule.raws.before = newLine + indent;
            if (multiDecl) {
                rule.nodes.map(child => {
                    child.raws.before = newLine + indent + indent;
                });
                rule.raws.after = newLine + indent;
            }
            return rule;
        });
    newMediaRule.name = 'media';
    newMediaRule.params = breakpoint.atMediaExpr;
    newMediaRule.nodes = atMediaChildNodes;
    // add moved comments if any
    newMediaRule.walkRules(rule => {
        const comment = movedComments.get(rule.source.end.line);
        if (comment) {
            rule.after(comment.clone());
        }
    });
    return newMediaRule;
}

function cloneAndSuffix(rule, suffix, cloneTarget) {
    const selector = rule.selector;
    const { className } = chopPseudo(selector);
    const nameWithSuffix = className + suffix;
    // update selector with suffixed className while keeping pseudo part
    const updatedSelector = selector.replace(className, nameWithSuffix);
    cloneTarget.set(
        updatedSelector,
        rule.clone({ selector: updatedSelector })
    );
}

/**
 * Main CSS AST processing function
 * @param {any} breakpoints - suffix and @media expression from plugin options
 * @param {any} formatting - formatting options
 * @param {postcss.Root} root - postcss AST root node
 */
function processCSS(breakpoints, formatting, root) {
    let alreadySuffixedRules = new Map();
    let movedComments = new Map();
    let classRules = [];
    // init alreadySuffixedRules to hold empty arrays for all suffixes
    for (let idx = 0; idx < breakpoints.length; idx++) {
        alreadySuffixedRules.set(breakpoints[idx].suffix, []);
    }

    root.walkRules(
        ruleJob(breakpoints, alreadySuffixedRules, movedComments, classRules));

    breakpoints.forEach( breakpoint => {
        let mediaClassRules = new Map();

        classRules.forEach( rule => {
            cloneAndSuffix(rule, breakpoint.suffix, mediaClassRules);
        });
        // override suffixed rules with manually added ones
        alreadySuffixedRules
            .get(breakpoint.suffix)
            .forEach(rule => {
                mediaClassRules.set(rule.selector, rule.clone());
            });

        let newMediaRule = createNewMediaRule(
            mediaClassRules,
            formatting.indentation,
            breakpoint,
            movedComments);

        root.append(newMediaRule);
        // Setting raws only work after appending since append() seem to
        // set the fields to ''
        newMediaRule.raws.before = newLine + newLine;
        newMediaRule.raws.after = newLine;
    });
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
