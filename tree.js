function setupProofNode(elem, rule) {
	// adds interface functions to a new proof node element
	let in_and_out = getChildByClass(elem, 'in-and-out');
	elem.inputs_elem = getChildByClass(in_and_out, 'inputs');
	elem.output_elem = getChildByClass(in_and_out, 'output');
	elem.rule = rule;
	elem.getProofInputs = function() {
		return getChildrenByClass(this.inputs_elem, 'node');
	};
	elem.validate = function() {
		if (this.isEmpty()) {
			throw "Cannot have an empty node in tree";
		}
		let inputs = this.getProofInputs();
		if (inputs.length != rule.num_inputs) {
			throw "Number of inputs does not match rule";
		}
		let retval = true;
		let input_exprs = inputs.map( function(input) {

		});
		inputs.forEach( function(child) {
			if (!child.validate()) retval = false;
		});
		return retval;
	}
	elem.isEmpty = function() {
		return this.classList.contains('empty');
	}
	elem.getExpression = function() {
		if (this.isEmpty()) {
			return Var('*EMPTY');
		}
		return this.rule.output;
	}
	elem.updateOutput = function() {
		this.output_elem.textContent = this.getExpression();
	}
	elem.updateOutput();
}

function createProofNode(rule) {
	let node = createDivWithClasses('node');
	document.getElementById('display').appendChild(node);
	let in_and_out = createDivWithClasses('in-and-out');
	node.appendChild(in_and_out);
	let inputs = createDivWithClasses('inputs');
	in_and_out.appendChild(inputs);
	for (let i = 0; i < rule.num_inputs; ++i) {
		let node_input = createDivWithClasses('node', 'empty');
		inputs.appendChild(node_input);
	}
	let output = createDivWithClasses('output');
	in_and_out.appendChild(output);
	let label = createDivWithClasses('label');
	label.textContent = rule.label;
	node.appendChild(label);
	setupProofNode(node, rule);
}