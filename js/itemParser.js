// Parsers the list of items and re-organises them into hierarchial list.

// Represents each item in the hierarchial list
function itemElem(id, name, childItems){
	this.id = id,
	this.name = name,
	this.childItems = childItems;
};


// Main function called from the controller. Expects the parameter as the list of 'Items' to be organised in the 
// hierarchial format.
function parseAllItems(jsonDataArr){
	itemList = [];
	//ITerate through the items list and Collect the list of all root items.
	jsonDataArr.forEach(
		function(itm , index){
			if((itm.parent_id == null) || (itm.parent_id == '')){
				itemList.push(new itemElem(itm.item_id, itm.name, []));
			}
		}
	);

	//Iterate through the items list and collect child items
	jsonDataArr.forEach(
		function(itm , index){
			if((itm.parent_id != null) && (itm.parent_id != '')){
				itemList.forEach(
					function(parentItm){
						//Recursive call to look for child items
						lookForChild(parentItm,itm);
					}
				);
			}
		}
		
	);
	console.log(itemList);
	return itemList;
}

// Recursive function that checks if the parent of the 'itm' is the current 'parentItm'. 
//If not matched looks for its parent in the 'childItems' of the parentItm
function lookForChild(parentItm, itm){
	var ret = false;
	if(parentItm.id == itm.parent_id){
		parentItm.childItems.push(new itemElem(itm.item_id, itm.name, []));
		return true;
	}
	parentItm.childItems.forEach(
		function(childItm){
			if(lookForChild(childItm,itm))
				return true;
		}
	);
}