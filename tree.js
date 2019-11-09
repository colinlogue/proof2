function setupProofNode(elem, rule) {
	// adds interface functions to a new proof node element
	elem.inputs_elem = getChildByClass(elem, 'inputs');
	elem.output_elem = getChildByClass(elem, 'output');
	elem.rule = rule;
	elem.isEmpty = function() {
		return this.classList.contains('empty');
	};
	elem.isPremise = function() {
		return this.classList.contains('premise');
	}
	elem.getProofInputs = function() {
		if (this.isEmpty() || this.isPremise()) { return []; }
		return getChildrenByClass(this.inputs_elem, 'node');
	};
	elem.getInputExprs = function() {
		return this.getProofInputs().map( x => x.getExpression());
	};
	elem.getExpression = function() {
		if (this.isEmpty()) {
			return Var('*EMPTY');
		}
		if (this.isPremise()) {
			return this.expr;
		}
		let inputs = this.getInputExprs();
		return this.rule.output(inputs);
	};
	elem.validate = function() {
		if (this.isEmpty()) {
			throw "Cannot have an empty node in tree";
		}
		if (this.isPremise()) {
			return true;
		}
		let inputs = this.getProofInputs();
		if (inputs.length != rule.num_inputs) {
			throw "Number of inputs does not match rule";
		}
		let input_vals = this.getInputExprs();
		let retval = true;
		inputs.forEach( function(child) {
			if (!child.validate()) retval = false;
		});
		return retval;
	};
	elem.attachNodeAt = function(new_node, pos) {
		let ref_node = this.getProofInputs()[pos];
		this.inputs_elem.replaceChild(new_node, ref_node);
		this.renderOutput();
	};
    elem.renderOutput = function() {
    	if (this.isPremise()) {
    		this.textContent = this.expr;
    	}
    	else if (!(this.isEmpty())) {
	        let expr = this.getExpression().toString();
	        let regex = /\*EMPTY/g
	        expr = expr.replace(regex, `<span class="empty"></span>`);
	        this.output_elem.textContent = '';
	        this.output_elem.insertAdjacentHTML('beforeend', expr);
			let label = createDivWithClasses('label');
			label.textContent = this.rule.label;
			this.output_elem.appendChild(label);
	    }
    };
	elem.renderOutput();
}

function createProofNode(rule) {
	let node = createDivWithClasses('node');
	let inputs = createDivWithClasses('inputs');
	node.appendChild(inputs);
	for (let i = 0; i < rule.num_inputs; ++i) {
		let node_input = createDivWithClasses('node', 'empty');
		setupProofNode(node_input, Empty);
		inputs.appendChild(node_input);
	}
	let output = createDivWithClasses('output');
	node.appendChild(output);
	setupProofNode(node, rule);
	return node;
}

function createPremiseNode(expr) {
	let node = createDivWithClasses('node', 'premise');
	node.expr = expr;
	setupProofNode(node);
	return node;
}


