
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
		this.set_variables();
	}
	setVariables(inputs) {
		let variables = {};
		try {
			for (let i = 0; i < this.num_inputs; ++i) {
				inputs[i].setVars(variables);
			}
		}
		catch(error) {
			variables = {};
		}
		this.variables = variables;
	}
	get output() {
		return this.out_form.replace(this.variables);
	}
}

let a = Var('a');
let b = Var('b');


AndIntro = new ProofRule([a, b], And(a,b), '∧I');