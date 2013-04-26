var intervalHandle = setInterval(function() {
	var lastElement = document;
	//get last element
	while (lastElement.childNodes.length !== 0) {
		lastElement = lastElement.childNodes[lastElement.childNodes.length - 1];
	}
	
	if(lastElement !== document) {
		lastElement.parentNode.removeChild(lastElement);
	} else {
		clearInterval(intervalHandle);
	}
}, 50);