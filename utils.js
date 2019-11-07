
function getChildrenByClass(elem, class_name) {
	return Array.from(elem.childNodes).filter( function(child) {
		return (child.classList &&
			child.classList.contains(class_name));
	});
}

function getChildByClass(elem, class_name) {
	// returns the first direct child that matches the
	// given class name
	return Array.from(elem.childNodes).find( function(child) {
		return (child.classList
			&& child.classList.contains(class_name));
	});
}

function createDivWithClasses(...classes) {
	let elem = document.createElement('div');
	elem.classList.add(...classes);
	return elem;
}