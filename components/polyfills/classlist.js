define(function(){
    var svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (svgEl.classList)
        return;

    defineElementGetter(SVGElement.prototype, 'classList', function () {
        if (!this.__classList__)
            this.__classList__ = new DOMTokenListPolyfill(this);

        return this.__classList__;
    });

    function DOMTokenListPolyfill(el){
        this.el = el;

        var currentClass = this.el.getAttribute("class");
        this.classes = currentClass ? currentClass.split(" ") : [];
    }

    DOMTokenListPolyfill.prototype = {
        add: function(token){
            if (!this.contains(token))
                this.classes.push(token);

            this.el.setAttribute("class", this.toString());
        },
        contains: function(token){
            return !!~this.classes.indexOf(token);
        },
        item: function(index){
            return this.classes[index];
        },
        remove: function(token){
            var tokenIndex = this.classes.indexOf(token);
            if (~tokenIndex)
                this.classes.splice(tokenIndex, 1);

            this.el.setAttribute("class", this.toString());
        },
        toggle: function(token){
            if (this.contains(token))
                this.remove(token);
            else
                this.add(token);
        },
        toString: function(){
            return this.classes.join(" ");
        }
    };

    function defineElementGetter (obj, prop, getter) {
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop,{
                get : getter
            });
        } else {
            obj.__defineGetter__(prop, getter);
        }
    }
});