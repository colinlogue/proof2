// Propositional logic syntax

class Expression {
	constructor(children) {
		if (typeof children === 'undefined') {
			children = [];
		}
		this.children = children;
	}
	replace(vars) {
		// vars is {name: expr} object of variable names to be
		// replaced by the matching expression
		let new_expr = new this.constructor(...this.copy_vals);
		new_expr.children = [];
		this.children.forEach( function(child) {
			new_expr.children.push(child.replace(vars));
		});
		return new_expr;
	}
	copy() {
		let new_expr = new this.constructor(...this.copy_vals);
		new_expr.children = [];
		for (let i = 0; i < this.children.length; ++i) {
			new_expr.children.push(this.children[i].copy());
		}
		return new_expr;
	}
	setVars(expr, vars) {
		if (this.node_type != expr.node_type) {
			throw `expr type ${expr.node_type} does not match ` +
				`${this.node_type}`;
		}
		for (let i = 0; i < this.children.length; ++i) {
			this.children[i].setVars(expr.children[i], vars)
		}
	}
	compare(expr) {
		// check that expression types are the same
		if (this.node_type != expr.node_type) {
			return false;
		}
		// check for the right number of  children
		if (this.children.length != expr.children.length) {
			return false;
		}
		// check that all children match
		for (let i = 0; i < this.children.length; ++i) {
			if (!(children[i].compare(expr.children[i]))) {
				return false;
			}
		}
		return true;
	}
	get node_type() {
		return this.constructor.node_type;
	}
	get copy_vals() {
		return [];
	}
}

class NotNode extends Expression {
	constructor(expr) {
		super();
		this.children = [expr];
	}
	toString() {
		return `${this.symbol}(${this.expr}`
	}
	get expr() {
		return this.children[0];
	}
	get symbol() {
		return this.constructor.symbol;
	}
}
NotNode.symbol = '¬';
NotNode.node_type = 'NOT';

class VariableNode extends Expression {
	constructor(name) {
		super();
		this.name = name;
	}
	toString() {
		return this.name;
	}
	evaluate(context) {
		if (!(this.name in context)) {
			throw `Variable ${this.name} not in context`;
		}
		return context[this.name];
	}
	setVars(expr, vars) {
		if (this.name in vars && !(this.compare(vars[this.name]))) {
			throw `${expr} does not match ${vars[this.name]} ` +
				`for variable ${this.name}`;
		}
		vars[this.name] = expr;
	}
	replace(vars) {
		if (this.name in vars) {
			return vars[this.name].copy();
		}
		return this.copy();
	}
	get copy_vals() {
		return [this.name];
	}
}
VariableNode.node_type = 'VAR';

class PredicateNode extends Expression {
	constructor(name, terms) {
		super();
		this.name = name;
		this.terms = terms;
	}
	toString() {
		return `${this.name}(${this.terms})`;
	}
}

class OperationNode extends Expression {
	constructor(lhs, rhs) {
		super([lhs, rhs]);
	}
	get lhs() {
		return this.children[0];
	}
	get rhs() {
		return this.children[1];
	}
	get symbol() {
		return this.constructor.symbol;
	}
	toString() {
		return `(${this.lhs}) ${this.symbol} (${this.rhs})`;
	}
}

class AndNode extends OperationNode {
	evaluate(context) {
		return this.lhs.evaluate(context) &&
			this.rhs.evaluate(context);
	}
}
AndNode.symbol = '∧';
AndNode.node_type = 'AND';

class OrNode extends OperationNode {
	evaluate(context) {
		return this.lhs.evaluate(context) ||
			this.rhs.evaluate(context);
	}
}
OrNode.symbol = '∨';
OrNode.node_type = 'OR';

class ArrowNode extends OperationNode {
	evaluate(context) {
		return !(this.lhs.evaluate(context)) ||
			this.rhs.evaluate(context);
	}
}
ArrowNode.symbol = '→';
ArrowNode.node_type = 'ARROW';

class QuantifierNode extends Expression {
	constructor(expr) {
		super([expr]);
	}
	get expr() {
		return this.children[0];
	}
	toString() {
		return `(${this.symbol}. ${this.expr}`;
	}
}

class ForAllNode extends QuantifierNode {
}
ForAllNode.symbol = '∀';
ForAllNode.node_type = 'FORALL';

class ExistsNode extends QuantifierNode {
}
ExistsNode.symbol = '∃';
ExistsNode.node_type = 'EXISTS';

function Var(name) {
	return new VariableNode(name);
}

function Pred(name, vs=[]) {
	return new PredicateNode(name, vs);
}

function And(lhs, rhs) {
	return new AndNode(lhs, rhs);
}

function Or(lhs, rhs) {
	return new OrNode(lhs, rhs);
}

function Arrow(lhs, rhs) {
	return new ArrowNode(lhs, rhs);
}

function Not(expr) {
	return new NotNode(expr);
}

function ForAll(expr) {
	return new ForAllNode(expr);
}

function Exists(expr) {
	return new ExistsNode(expr);
}