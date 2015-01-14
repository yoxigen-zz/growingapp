(function(){
    angular.module("DataObjectCollection", []).factory("DataObjectCollection", function(){
        function DataObjectCollection(type){
            this.itemsType = type;
            this.items = [];
        }

        /**
         * Adds an item to the collection. Checks that the type of the object is the collection's type. Accept both array and single object.
         * @param item
         * @param isFirst Boolean, whether to add the item(s) at the beginning of the collection rather than the end.
         */
        DataObjectCollection.prototype.add = function(item, isFirst){
            var self = this;
            if (item.constructor === Array) {
                item.forEach(function (item) {
                    self.add(item);
                });
            }
            else{
                if (!(item instanceof this.itemsType))
                    throw new TypeError("Invalid item type for DataObjectCollection. Expected an instance of " + this.itemsType.constructor.name + ".");

                if (isFirst)
                    this.items.splice(0, 0, item);
                else
                    this.items.push(item);
            }
        };

        DataObjectCollection.prototype.setItems = function(items){
            this.clearItems();
            this.items = items;
        };

        DataObjectCollection.prototype.clearItems = function(){
            while(this.items.length) {
                this.items.pop();
            }
        };

        DataObjectCollection.prototype.remove = function(item){
            var itemIndexOf = this.items.indexOf(item);
            if (!~itemIndexOf)
                throw new Error("Can't remove item, not found in the collection.");

            item.remove();
            this.lastRemovedItem = { item: this.items.splice(itemIndexOf, 1), index: itemIndexOf };
        };

        DataObjectCollection.prototype.unremoveLast = function(){
            if (!this.lastRemovedEntry)
                return false;

            this.items.splice(this.lastRemovedItem.index, 0, this.lastRemovedItem.item);
            this.lastRemovedItem.item.unremove();
            delete this.lastRemovedItem;
        };

        return DataObjectCollection;
    });
})();