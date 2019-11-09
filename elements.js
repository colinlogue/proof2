// define custome DOM elements

function formatEmpty(expr) {
    let regex = /EMPTY/g
    return expr.toString().replace(regex, `<span class="empty"></span>`);
}

class ProofNode extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		// shadow structure
		let template = document.getElementById(this.templateID);
		let clone = document.importNode(template.content, true);
		this.shadowRoot.appendChild(clone);		
	}
	get templateID() {
		return this.constructor.templateID;
	}
}

class InferenceNode extends ProofNode {
	// premise for inferences using the proof rules
	// can have up to three inputs, a single output, and a label
	constructor() {
		super();
		if (this.hasAttribute('rule')) {
			this.rule = this.getAttribute('rule');
		}
		let shadow = this.shadowRoot;
		shadow.draw = function(expr) {
			let output_elem = shadow.querySelector('.output');
			expr = formatEmpty(expr);
	        output_elem.textContent = '';
	        output_elem.insertAdjacentHTML('beforeend', expr);
		};
	}
	get expr() {
		return this.rule.output(this.inputs);
	}
	get inputs() {
		let num_inputs = this.rule.num_inputs;	
		if (num_inputs == 0) {
			return [];
		}
		else if (num_inputs == 1) {
			return [this.left];
		}
		else if (num_inputs == 2) {
			return [this.left, this.right];
		}
		else if (num_inputs == 3) {
			return [this.left, this.mid, this.right];
		}
		else {
			throw `Illegal number of inputs: ${num_inputs}`;
		}
	}
	get left() {
		let num_inputs = this.rule.num_inputs;
		if (num_inputs == 0) {
			return null;
		}
		let left = this.inputElements.find(
			x => x.getAttribute('slot') == 'left');
		if (typeof left === 'undefined') {
			return Var('EMPTY');
		}
		return left.expr;
	}
	get mid() {
		let num_inputs = this.rule.num_inputs;
		if (num_inputs != 3) {
			return null;
		}
		let mid = this.inputElements.find(
			x => x.getAttribute('slot') == 'mid');
		if (typeof mid === 'undefined') {
			return Var('EMPTY');
		}
		return mid.expr;
	}
	get right() {
		let num_inputs = this.rule.num_inputs;
		if (num_inputs == 3 || num_inputs == 0) {
			return null;
		}
		let right = this.inputElements.find(
			x => x.getAttribute('slot') == 'right');
		if (typeof right === 'undefined') {
			return Var('EMPTY');
		}
		return right.expr;
	}
	get inputElements() {
		let elems = Array.from(this.children);
		let nodes = elems.filter(x => x instanceof ProofNode);
		return nodes;
	}
	// rule is stored as attribute
	get rule() {
		return ProofRule.rules[this.getAttribute('rule')];
	}
	set rule(new_rule) {
		this.setAttribute('rule', new_rule);
		let shadow = this.shadowRoot;
		// reset label
		shadow.querySelector('.label').textContent = this.rule.label;
		// reset inputs
		let n_inputs = this.rule.num_inputs;
		let slots = Array.from(shadow.querySelectorAll('slot'));
		slots.forEach( function(elem) {
			elem.classList.add('hidden');
		});
		if (n_inputs == 1) {
			slots[0].classList.remove('hidden');
		}
		else if (n_inputs == 2) {
			slots[0].classList.remove('hidden');
			slots[2].classList.remove('hidden');
		}
		else if (n_inputs == 3) {
			slots[0].classList.remove('hidden');
			slots[1].classList.remove('hidden');
			slots[2].classList.remove('hidden');
		}
	}
	draw() {
		this.shadowRoot.draw(this.expr);
	}
}
InferenceNode.templateID = 'inference-template';

class ExpressionNode extends ProofNode {
	// base class for premise and assumption
	// they both just display an expression
	constructor() {
		super();
	}
	get expr() {
		return parse(this.getAttribute('expr'));
	}
	set expr(val) {
		this.setAttribute('expr', val);
	}
	draw() {
		let text = formatEmpty(this.expr);
		let node = this.shadowRoot.querySelector('.node');
		node.textContent = '';
		node.insertAdjacentHTML('beforeend', text);
	}
}

class EmptyNode extends ProofNode {
	constructor() {
		super();
	}
}
EmptyNode.templateID = 'empty-template';

class PremiseNode extends ExpressionNode {
	constructor() {
		super();
	}
}
PremiseNode.templateID = 'premise-template';

class AssumptionNode extends ExpressionNode {
	constructor() {
		super();
	}
}
AssumptionNode.templateID = 'assumption-template';

customElements.define('proof-inference', InferenceNode);
customElements.define('proof-premise', PremiseNode);
customElements.define('proof-assumption', AssumptionNode);
customElements.define('proof-empty', EmptyNode);

proof_nodes_sel_str = 'proof-inference, proof-assumption, proof-premise';

function drawProofTree() {
	let elems = document.querySelectorAll(proof_nodes_sel_str);
	Array.from(elems).forEach( function(elem) {
		elem.draw();
	});
}

document.addEventListener('DOMContentLoaded', drawProofTree);