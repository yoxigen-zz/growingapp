(function(){
    angular.module("DataObjectCollection", []).factory("DataObjectCollection", function(){
        function DataObjectCollection(type){
            this.items = [];
        }

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