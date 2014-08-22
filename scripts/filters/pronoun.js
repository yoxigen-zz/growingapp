app.filter("pronoun", function(){
    return function(input){
        if (input === "f")
            return "she";

        if (input === "m")
            return "he";

        return "";
    }
});