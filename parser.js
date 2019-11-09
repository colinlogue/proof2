// this is copied from a python script from:
// https://github.com/slibby05/pred/blob/master/Parser.py
const TType = Object.freeze({
	TTRUE:          'T',
	TFALSE:         'F',
    TNOT:           '~',
    TAND:           '&&',
    TOR:            '||',
    TARROW:         '->',
    TVAR:           '<var>',
    TLPAREN:        '(',
    TRPAREN:        ')',
    TEOF:           '<EOF>',
    TEX:            'EX',
    TFA:            'FA',
    TDOT:           '.',
    TCOMMA:         ',',
});

let ExprNodes = {};
ExprNodes[TType.TARROW] = ArrowNode;
ExprNodes[TType.TAND] = AndNode;
ExprNodes[TType.TOR] = OrNode;

function findTType(val) {
    return Object.keys(TType).find(key => TType[key] == val);
}

function parse(text) {
    // first convert alternate symbols to token symbols
    text = text.replace('∧', '&&');
    text = text.replace('¬', '~');
    text = text.replace('∨', '||');
    text = text.replace('→', '->');
    text = text.replace('∀', 'FA');
    text = text.replace('∃', 'EX');    
	return expr(lex(text));
}

function expr(tokens) {

}

class Token {
    constructor(ttype, val=null) {
        this.ttype = ttype;
        if (val == null) {
            val = ttype;
        }
        this.val = val;
    }
    toString() {
        return this.ttype;
    }
}

function alpha(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
}

function lex(text) {
    var i = 0;
    var tokens = [];
    while (i < text.length) {
        while (/\s/.test(text[i])) {
            // skip whitespace
            ++i;
        }

        var c = text[i];
        var n;
        if (i+1 < text.length) {
            n = text[i+1];
        }
        else {
            n = '';
        }

        var ttype = null;
        var val = null;
        // check if (c+n) is in tokens
        if (Object.values(TType).includes(c+n)) {
            ttype = c+n;
            i += 2;
        }
        else if (Object.values(TType).includes(c)) {
            ttype = c;
            i += 1;
        }
        else if (alpha(c)) {
            var j = 0;
            val = '';
            while (i+j < text.length && alpha(text[i+j])) {
                val += text[i+j];
                ++j;
            }
            ttype = TType.TVAR;
            i += j;
        }
        else {
            throw `Lex exception at position ${i}: ${c}`;
        }
        tokens.push(new Token(ttype, val));
    }
    tokens.push(new Token(TType.TEOF));
    return tokens;
}

function check_follow(tokens, follow) {
    if (!(follow.includes(tokens[0].ttype))) {
        throw `Follow error: ${tokens[0].ttype} not in ${follow}`;
    }
}

const quantifiers = [TType.TFA, TType.TEX];
const operations = [TType.TARROW, TType.TOR, TType.TAND];
const right_assoc = [TType.TARROW];


function expr(tokens) {
    let follow = [TType.TEOF, TType.TRPAREN];
    if (quantifiers.includes(tokens[0].ttype)) {
        return quantifierExpr(tokens);
    }
    return binaryExpr(tokens, follow);
}

function quantifierExpr(tokens) {
    let q = tokens.shift();
    let e;
    if (tokens[0].ttype == TType.TVAR) {
        if (tokens[1].ttype == TType.TDOT) {
            tokens.shift();
            let v = tokens.shift().val;
            tokens.shift();
            if (q.ttype == TType.TFA) {
                let node = ForAllNode;
            }
            else if (q.ttype == TType.TEX) {
                let node = ExistsNode;
            }
            e = new node(v, lex_step(tokens));
        }
    }
    check_follow(tokens, follow);
    return e;
}

function binaryExpr(tokens, follow) {
    let subfollow = Array.from(follow);
    for (let i = 0; i < operations.length; ++i) {
        var op = operations[i];
        if (!(subfollow.includes(op))) {
            subfollow.push(op);
            let lhs = binaryExpr(tokens, subfollow);
            while (tokens[0].ttype == op) {
                let node = ExprNodes[tokens.shift().ttype];
                if (right_assoc.includes(op)) {
                    rhs = binaryExpr(tokens, follow);
                }
                else {
                    rhs = binaryExpr(tokens, subfollow);
                }
                lhs = new node(lhs, rhs);
            }
            check_follow(tokens, follow);
            return lhs;
        }
    }
    return notExpr(tokens, follow);    
}

function notExpr(tokens, follow) {
    let subfollow = Array.from(follow);
    let e;
    if (tokens[0].ttype == TType.TNOT) {
        tokens.shift();
        e = new NotNode(notExpr(tokens, subfollow));
    }
    else {
        e = termExpr(tokens, subfollow);
    }
    check_follow(tokens, subfollow);
    return e;
}

function termExpr(tokens, follow) {
    let first = [TType.TTRUE, TType.TFALSE, TType.TVAR, TType.TLPAREN];
    let subfollow = Array.from(follow);
    let e;
    if (tokens[0].ttype == TType.TVAR) {
        e = predExpr(tokens, subfollow);
    }
    else if (tokens[0].ttype == TType.TTRUE) {
        e = Lit(true);
        tokens.shift();
    }
    else if (tokens[0].ttype == TType.TLPAREN) {
        tokens.shift();
        e = expr(tokens);
        if (tokens[0].ttype != TType.TRPAREN) {
            throw "Parentheses don't match";
        }
        tokens.shift();
    }
    else if (quantifiers.includes(tokens[0].ttype)) {
        e = quantifierExpr(tokens);
    }
    else {
        throw "Parse failed in termExpr";
    }
    check_follow(tokens, subfollow);
    return e;
}

function predExpr(tokens, follow) {
    let subfollow = Array.from(follow);
    let e;
    let name = tokens.shift().val;

    // P(v {, v} )
    if (tokens[0].ttype == TType.TLPAREN) {
        tokens.shift();
        let vs = [];
        if (tokens[0].ttype == TType.TVAR) {
            vs.push(tokens.shift().val);
        }
        else if (tokens[t].ttype != TType.TRPAREN) {
            throw "expected closing paren";
        }

        // {, v}
        while (tokens[0].ttype != TType.TRPAREN) {
            if (tokens[0].ttype == TType.TCOMMA && 
                    tokens[1].ttype == TType.TVAR) {
                tokens.shift();
            vs.push(tokens.shift().val);
            }
            else {
                throw "predicate: expected {, v}"
            }
        }
        tokens.shift(); // get rid of closing paren
        e = new PredicateNode(name, vs);
    }
    else {
        e = new VariableNode(name);
    }
    check_follow(tokens, subfollow);
    return e;
}