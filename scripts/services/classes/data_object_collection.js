define(["angular", "services/utils"], function(angular){
    "use strict";

    angular.module("DataObjectCollection", ["Utils"]).factory("DataObjectCollection", DataObjectCollectionClass);

    DataObjectCollectionClass.$inject = ["utils"];

    function DataObjectCollectionClass(utils){
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

        DataObjectCollection.prototype.__defineGetter__("size", function(){
            return this.items.length;
        });

        DataObjectCollection.prototype.hasItem = function(item){
            return !!~this.items.indexOf(item);
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

            item.remove();

            if (~itemIndexOf)
                this.lastRemovedItem = { item: this.items.splice(itemIndexOf, 1), index: itemIndexOf };
            return { index: itemIndexOf, item: item };
        };

        DataObjectCollection.prototype.unremoveLast = function(){
            if (!this.lastRemovedEntry)
                return false;

            this.items.splice(this.lastRemovedItem.index, 0, this.lastRemovedItem.item);
            this.lastRemovedItem.item.unremove();
            delete this.lastRemovedItem;
        };

        DataObjectCollection.prototype.updateItems = function(){
            if (this.itemsType.prototype.clearParsedValues){
                this.items.forEach(function(item){
                    item.clearParsedValues();
                });
            }
        };

        /**
         * Given an item ID, removes the item with the specified ID from the collection and inserts another one instead
         * @param itemId
         * @param newItem
         */
        DataObjectCollection.prototype.updateItem = function(newItem){
            var item = utils.arrays.find(this.items, function(item){
                return item.id === newItem.id;
            });

            if (item){
                this.items.splice(this.items.indexOf(item), 1, newItem);
            }
        };

        return DataObjectCollection;
    }
});