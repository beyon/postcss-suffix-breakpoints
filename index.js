// paste code into: http://astexplorer.net/#/np0DfVT78g/94 for interactive testing
import * as postcss from 'postcss';

export default postcss.plugin('postcss-suffix-breakpoints', (options = {}) => {
    // Work with options here
    var breakpoints = [{suffix: '-ns', var: '--breakpoint-not-small'},
    {suffix: '-m', var: '--breakpoint-medium'},
    {suffix: '-l', var: '--breakpoint-large'}];
    var breakpoint_rules = new Map();
    //init breakpoint_rules to hold empty arrays for all suffixes
    for(var bp = 0; bp < breakpoints.length; bp++) {
        breakpoint_rules.set( breakpoints[bp].suffix, [] );
    }
    return function (root, result) {
        var class_rules = [];
        root.walkRules(rule => {
            if( rule.selector.startsWith('.') ){
				var is_breakpoint_rule = false;
                for(var bp = 0; bp < breakpoints.length; bp++) {
                    var suffix = breakpoints[bp].suffix;
                    if( rule.selector.endsWith( suffix ) ) {
                        is_breakpoint_rule = true;
                        
                        //update/add rule to breakpoint rules for current suffix
                        var suffix_rules = breakpoint_rules.get( suffix );
                        suffix_rules.push(rule.clone());
                        breakpoint_rules.set( suffix, suffix_rules );
                        
                        break;// stop iterating since there can only be one suffix per rule
                    }
                }
                if( is_breakpoint_rule ) rule.remove();
                else class_rules.push( rule.clone() );
            }
        });
        
        for(var bp = 0; bp < breakpoints.length; bp++)  {
            var media_class_rules = new Map();
            var suffix = breakpoints[bp].suffix;
            //copy class rules for all non suffixed rules and add suffix to selector for current breakpoint
            for(var idx = 0; idx < class_rules.length; idx++) {
                var class_name = class_rules[idx].selector;
                var name_with_suffix = class_name + suffix;
                media_class_rules.set( name_with_suffix, class_rules[idx].clone({selector: name_with_suffix }) );
            }
            // override suffixed rules with manually added ones
            var manual_suffix_rules = breakpoint_rules.get(suffix);
            for( var r = 0; r < manual_suffix_rules.length; r++) {
                media_class_rules.set( manual_suffix_rules[r].selector, manual_suffix_rules[r].clone() );
            }
            root.append({
                name: 'media',
                params: '(' + breakpoints[bp].var + ')',
                nodes: Array.from(media_class_rules.values())
            });
        }
    };
});
