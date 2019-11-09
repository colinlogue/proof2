
function getChildrenByClass(elem, class_name) {
	return Array.from(elem.childNodes).filter( function(child) {
		return (child.classList &&
			child.classList.contains(class_name));
	});
}

function getChildByClass(elem, class_name) {
	// returns the first direct child that matches the
	// given class name
	try {
		return Array.from(elem.childNodes).find( function(child) {
			return (child.classList
				&& child.classList.contains(class_name));
		});
	}
	catch(error) {
		return null;
	}
}

function createDivWithClasses(...classes) {
	let elem = document.createElement('div');
	elem.classList.add(...classes);
	return elem;
}

function arrayToCommaList(arr) {
	if (arr.length == 0) { return ''; }
	let str = arr.shift().toString();
	while (arr.length > 0) {
		str += ', ' + arr.shift().toString();
	}
	return str;
}

function removeAllChildren(elem) {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
}