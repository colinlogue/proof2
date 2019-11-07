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
		let new_expr = this.copy();
		for (let i = 0; i < this.children.length; ++i) {
			if (child instanceof VariableNode) {
				// if child is variable node, compare to vars
				// and replace if math
				if (child.name in vars) {
					new_expr.children[i] = vars[child.name].copy();
				}
			}
		}
		return new_expr;
	}
	copy() {
		let new_expr = new this.constructor();
		let new_children = [];
		for (let i = 0; i < this.children.length; ++i) {
			new_children.push(this.children[i].copy());
		}
		return new_expr;
	}
	setVars(expr, vars) {
		if (this.node_type != expr.node_type) {
			throw `expr type ${expr.node_type} does not match ` +
				`${this.node_type}`;
		}
		for (let i = 0; i < this.children.length; ++i) {
			this.children[i].setVars(expr.children[i])
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
}

class NotNode extends Expression {
}
NotNode.symbol = '~';
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
}
VariableNode.node_type = 'VAR';

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

function Var(name) {
	return new VariableNode(name);
}


function And(lhs, rhs) {
	return new AndNode(lhs, rhs);
}