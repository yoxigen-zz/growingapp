angular.module("app.filters").filter("toFixed", function(){
	var decimalMatch = /^(\d+\.)(\d+)$/;

	return function(input, decimalPoints){
		var str = String(input),
			match = str.match(decimalMatch);

		if (!match)
			return input;

		return match[1] + match[2].substr(0, decimalPoints);
	}
});