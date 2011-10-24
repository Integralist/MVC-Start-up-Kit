define(['jquery'], function($){
	
	var Controller = {
		
		init: function(model) {
			var self = this;
			
			// The Controller tells the Model it needs to grab data from the server
			// Note: originally I had the 'getModelData' method inside the Controller but discovered this was a 'bad practice'
			// and that the Model should be solely responsible for grabbing its own data (the Controller simply tells it 'when')
			model.getModelData()
				.then(function(data){
					// Populate the Model with the server data
					model.populate(data)
						// Update the View to display the data
						.then(function(storedData){
							self.updateView('view', storedData);
						});
				})
				.fail(function(err){
					console.log('fail? ', err);
				});
		},
		
		updateView: function(element_id, data) {
			var doc = document,
				container = doc.getElementById(element_id),
				select = container.getElementsByTagName('select')[0];
			console.log(select, data);
		}
		
	}
		
	return Controller;
	
});