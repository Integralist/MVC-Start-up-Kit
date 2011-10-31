define(function(){

	// This is our standard Controller object (all new Controller instances will inherit the following methods)
	
	var Controller = {
		
		// All Controller instances should have this initialisation method
		init: function(model) {
			var self = this;
			
			// We'll store the Model so we have constant access to it
			this.Model = model;
			
			// The Controller tells the Model it needs to grab data from the server
			// Note: originally I had the 'getModelData' method inside the Controller but discovered this was a 'bad practice'
			// and that the Model should be solely responsible for grabbing its own data (the Controller simply tells it 'when')
			model.getModelData(model.path).then(function(data) {
					
				// Populate the Model with the server data
				model.populate(data).then(function(storedData) {
					
					// Update the View to display the data
					self.updateView(storedData).then(function(callback) {
						// Once the View has been updated the next step is to pass through 
						// a callback to handle the binding of events
						if (!!callback) {
							// We need to make sure the callback is executed with the Controller instance as the 'this' context
							// Otherwise 'this' would be the DOMWindow
							callback.call(self);
						}
					});
						
				});
					
			})
			
			.fail(function(err) {
				console.log('fail? ', err);
			});
		},
		
		// An empty stub function which should be modified when a new Controller instance inherits from the main Controller object.
		// We've made it into an empty stub function just in case the user forgets about it
		updateView: function(){},
		
		// A super basic templating engine
		// Usage: this.template(container.innerHTML, { name: 'Mark', age: '29', address: '9 Cables Street, London' })
		template: function(string, obj) {
			for(var prop in obj) {
				string = string.replace(new RegExp('{{' + prop + '}}','g'), obj[prop]);
			}
			return string;
		},
		
		// We store templates so we don't have to keep grabbing them from the server if they've already been requested once before
		templates: {},
		
		// We store our templates in .tmpl files and retrieve via ajax
		getTemplate: function(template) {
			var dfd = $.Deferred(),
				data;
			
			if (!(template in this.templates)) {
				// Create new instance of specified element and store it
				this.templates[template] = data = $.ajax({
					type: 'GET',
					url: '/Assets/Templates/' + template,
					dataType: 'html',
					error: dfd.reject,
					success: dfd.resolve
				});
			} else {
				// If we've already stored the requested template then return that
				dfd.resolve(this.templates[template]);
			}
				
			return dfd.promise();
		}
		
	};
	
	return Controller;
	
});