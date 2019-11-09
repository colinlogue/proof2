
function replaceVariables(template, expr, vars) {
	if (typeof vars === 'undefined') {
		vars = {};
	}	
}

class ProofRule {
	constructor(name, in_forms, out_form, label) {
		this.name = name;
		this.in_forms = in_forms;
		this.out_form = out_form;
		this.label = label;
		ProofRule.rules[name] = this;
	}
	get num_inputs() {
		return this.in_forms.length;
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
	createButton() {
		let template = document.getElementById('rule-button-template');
		let button = document.importNode(template.content, true);
		// example is an instance of the node with the default
		// variables, to show what the rule does on the button
		let example = document.createElement('proof-inference');
		example.rule = this.name;
		let nodes = this.in_forms.map( function(in_form) {
			let node = document.createElement('proof-premise');
			node.expr = in_form;
			return node;
		});
		if (this.num_inputs == 1) {
			nodes[0].setAttribute('slot', 'left');
			example.appendChild(nodes[0]);
		}
		if (this.num_inputs == 2) {
			nodes[0].setAttribute('slot', 'left');
			example.appendChild(nodes[0]);
			nodes[1].setAttribute('slot', 'right');
			example.appendChild(nodes[1]);
		}
		if (this.num_inputs == 3) {
			nodes[0].setAttribute('slot', 'left');
			example.appendChild(nodes[0]);
			nodes[1].setAttribute('slot', 'mid');
			example.appendChild(nodes[1]);
			nodes[2].setAttribute('slot', 'right');
			example.appendChild(nodes[2]);
		}
		example.classList.add('example');
		button.querySelector('.rule-button').appendChild(example);
		return button;
	}
}
ProofRule.rules = {};

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

AndIntro = new ProofRule('and-intro', [a, b], And(a,b), '∧I');
AndElimL = new ProofRule('and-elim-left', [And(a,b)], a, '∧EL');
AndElimR = new ProofRule('and-elim-right', [And(a,b)], b, '∧ER');


function setActiveRule(event) {
	let buttons = document.getElementsByClassName('rule-button');
	Array.from(buttons).forEach( function(button) {
		button.classList.remove('active');
	});
	event.target.classList.add('active');
}

function initializeRuleButtons(elem) {
	for (name in ProofRule.rules) {
		let rule = ProofRule.rules[name];
		let button = rule.createButton();
		elem.appendChild(button);
	}
}

document.addEventListener('DOMContentLoaded', function() {
	let controls = document.getElementById('controls');
	initializeRuleButtons(controls);
})