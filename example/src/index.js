function foo(x) {
	if (x) {
		return JSON.stringify(x);
	}
	return 'default string';
}

foo(55);
