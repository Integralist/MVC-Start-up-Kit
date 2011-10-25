define(function(){

	// This is our standard Controller object (all new Controller instances will inherit the following methods)
	
	var Controller = {
		
		// All Controller instances should have this initialisation method
		init: function(model) {
			var self = this;
			
			// The Controller tells the Model it needs to grab data from the server
			// Note: originally I had the 'getModelData' method inside the Controller but discovered this was a 'bad practice'
			// and that the Model should be solely responsible for grabbing its own data (the Controller simply tells it 'when')
			model.getModelData(model.path)
				.then(function(data){
					// Populate the Model with the server data
					model.populate(data)
						// Update the View to display the data
						.then(function(storedData){
							self.updateView(storedData);
						});
				})
				.fail(function(err){
					console.log('fail? ', err);
				});
		},
		
		// A super basic templating engine
		// Usage: this.template(container.innerHTML, { name: 'Mark', age: '29', address: '9 Cables Street, London' })
		template: function(string, obj) {
			for(var prop in obj) {
				string = string.replace(new RegExp('{{' + prop + '}}','g'), obj[prop]);
			}
			return string;
		},
		
		// An empty stub function which should be extended when a new Controller instance inherits from the main Controller object.
		// We've made it into an empty stub function just in case the user forgets about it
		updateView: function(){}
		
	};
	
	return Controller;
	
});