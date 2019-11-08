
function replaceVariables(template, expr, vars) {
	if (typeof vars === 'undefined') {
		vars = {};
	}	
}

class ProofRule {
	constructor(in_forms, out_form, label) {
		this.in_forms = in_forms;
		this.out_form = out_form;
		this.label = label;
	}
	get num_inputs() {
		return this.in_forms.length;
	}
	validate(inputs) {
		this.setVariables();
	}
	setVariables(inputs, variables) {
		try {
			for (let i = 0; i < this.num_inputs; ++i) {
				this.in_forms[i].setVars(inputs[i], variables);
			}
		}
		catch(error) {
			console.log(error);
		}
	}
	output(inputs) {
		let variables = {};
		this.setVariables(inputs, variables);
		return this.out_form.replace(variables);
	}
}

class Premise {
	constructor(expr) {
		this.expr = expr;
	}
	output() {
		return this.expr;
	}
}

let a = Var('a');
let b = Var('b');

Empty = new ProofRule([], [], '');
AndIntro = new ProofRule([a, b], And(a,b), '∧I');
AndElimL = new ProofRule([And(a,b)], a, '∧EL');
AndElimR = new ProofRule([And(a,b)], b, '∧ER');