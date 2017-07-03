/* conroller.js  is the controller of this app.It defines the controller and the business logic

 $urlRouterProvider configures the states and routes to the different views accordingly*/

var app = angular.module('itemsApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
	
	// Default Screen
    $urlRouterProvider.otherwise('/partials/home');

    $stateProvider
        	// Home page
     	.state('home', {
            url: '/partials/home',
            templateUrl: 'partials/home.html'
        })

        // create page 
        .state('create', {
            url: '/partials/create',
            templateUrl: 'partials/create.html'       
        })

        // Edit Page 
        .state('edit', {
            url: '/partials/edit',
            templateUrl: 'partials/edit.html'      
        })

        // Delete Page
        .state('delete', {
            url: '/partials/delete',
            templateUrl: 'partials/delete.html'       
        })

        // View all records Page
        .state('viewAll', {
            url: '/partials/viewAll',
            templateUrl: 'partials/viewAll.html'       
        })

        // View single Record Page
        .state('viewOne', {
            url: '/partials/viewOne',
            templateUrl: 'partials/viewOne.html'       
        })

        // View Hierarchial List Page
        .state('viewList', {
            url: '/partials/listView',
            templateUrl: 'partials/listView.html'       
        })
});

// All state change methods in the controller try to get/send data from/to the server
// but update the state model regardless of the outcome. This is done to show the demo
// Functionality in the absence of a server
app.controller('itemsCtrl', function($scope, $http, $state, $transitions) {

    //Registring scope variables
    // This contains all data retrived from the server, and used to render views in all states
    $scope.itemsData = {};
    // This repesents the same data as in itemsData, but re-organised into a hierarchial format. See itemParser.js
    $scope.listViewItems = {}; 
    // A temporary storage for editing/updating an item
    $scope.item = { item_id: '', parent_id: '', name: '', description:''};
    
    

    //Try to get the data from the server on page load.
    $http.get("http://localhost:3000/items", {timeout:50})
    .then(
        function (response) {
            // Update local model with server data
            $scope.itemsData = response.data;
        },
        function(response) {
            //Update from local json file on server error.
            $scope.itemsData=JSON.parse(localItems);
            
        }
    );


    // *** SHOW HIERACHIAL LIST VIEW OF ITEMS ****
    //State transistion interceptor for rendering a hierarchial view. We update the hierarchial view from the current data model.
    $transitions.onEnter({ entering: 'viewList' }, function(transition, state) {
        console.log("Entered " + state.name + " module while transitioning to " + transition.to().name);
        $scope.listViewItems = parseAllItems($scope.itemsData);
    });



    // *** CREATE NEW ITEM ****
    // State transistion interceptor for creating new Item. We reset the local temporary variable to blank beore rendering the view.
    $transitions.onEnter({ entering: 'create' }, function(transition, state) {
        console.log("Entered " + state.name + " module while transitioning to " + transition.to().name);
        $scope.item = { item_id: '', parent_id: '', name: '', description:''};
    });

    // Called on creation of new Item
    $scope.addItem = function (){

        if(this.item.name) {
            // Client Validations??
        }
        //selectedParent is bound in the create.html. It represents the parent selected by the user.
        this.item.parent_id = this.selectedParent.item_id;

       //Post the new item to the server.
        $http.post("http://localhost:3000/items" , this.item, {timeout:50})
        .then(
            function(response) {
                console.log(response.data);
                // Updating local model with response from the server. Assuming ID is populated on the server
                $scope.itemsData.push(response.data);
                $state.go('viewAll');
            },
            function(response){
                // For demo purpose, Not generating ID as there is no reliable way for auto incrementing
                console.log('Processing due to error', $scope.item);
                $scope.itemsData.push($scope.item);
                $state.go('viewAll');
            }
        );
        
    };


    // *** DELETE ITEM ****
    // Called on Item delete
    $scope.deleteItem = function(itemId) {

        if(confirm("Are you sure you want to delete this item?")) {
            //Call to delete the item on the server
            $http.delete("http://localhost:3000/items/" + itemId)
            .then(
                function(response) {
                    // Any client notification on server delete success
                },
                function(response){
                    // We should be alerting user that delete failed
                }
            );
            //Since this is demo and may not have server, updating local data model
            this.itemsData.forEach(function(currentItem, index){
                if(currentItem.item_id == itemId){
                    $scope.itemsData.splice(index,1); 
                    console.log("Item Deleted Sucessfully.");
                }
            });
        }
    };



    // *** VIEW ITEM ****
    //Load selected item for viewing from the server
    $scope.viewItem = function(itemId){
        //Get data from the server. Can support fetching additional attributes of the selected item
        getItemFromServerAndNavigate(itemId,'viewOne');
        console.log("Local Item" + this.item);
        
    };


    // *** EDIT ITEM ****
    //Load selected item for editing from the server
    $scope.editItem = function(itemId) {
       getItemFromServerAndNavigate(itemId,'edit');
        
    };

    $scope.updateItem = function(itemId) {

        var currentItem = {};
        $http.put("http://localhost:3000/items/" + itemId, this.item, {timeout:50})
        .then(
            function (response) {
                // Any client notification on server update success
            },
            function(response) {
               // Any client notification on server update failure
            }
        );
        //Since this is demo and may not have server, updating local data model
        this.itemsData.forEach(function(currentItem, index){
            if(currentItem.item_id == $scope.item.item_id){
                console.log('retrn item' + currentItem);
                $scope.itemsData[index].description = $scope.item.description;
                $scope.itemsData[index].name = $scope.item.name;
            }
        });
        $state.go('viewAll');
    };


    function getItemFromServerAndNavigate(itemId,state)
    {
         var currentItem = {};
        $http.get("http://localhost:3000/items/" + itemId, {timeout:50})
        .then(
            function (response) {
                console.log("From Server"  + response.data)
                currentItem = response.data;
                //duplicate code
                $scope.item.item_id =  currentItem.item_id;
                $scope.item.parent_id = currentItem.parent_id;
                $scope.item.description = currentItem.description;
                $scope.item.name = currentItem.name;
                $state.go(state);
            },
            function(response) {
                $scope.itemsData.forEach(function(itm, index){
                    if(itm.item_id == itemId){
                        currentItem = itm;
                        //Duplicate code move to common fuction
                        $scope.item.item_id =  currentItem.item_id;
                        $scope.item.parent_id = currentItem.parent_id;
                        $scope.item.description = currentItem.description;
                        $scope.item.name = currentItem.name;
                        $state.go(state);
                    }

                });
            }
        );

    }

});
    