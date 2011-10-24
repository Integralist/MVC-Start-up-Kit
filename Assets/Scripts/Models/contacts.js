define(['jquery'], function($){
	
	// Extend the native Matho object so it can generate a random id
	Math.guid = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}).toUpperCase();      
	};
	
	var Model = {
	
		getModelData: function() {
			var dfd = $.Deferred(),
				data = $.ajax({
					type: 'GET',
					url: 'Assets/Includes/Contacts.php',
					dataType: 'json',
					error: dfd.reject,
					success: dfd.resolve
				});
				
			return dfd.promise();
		},
		
		generate_id: function() {
			// By wrapping the Math.guid() method we are free to change the implementation
			// without having to change the API
			return Math.guid();
		},
		
		/*
		 * Because there is potential for the data-set to be very large
		 * we need to use a timer to split the long array into chunks.
		 */
		populate: function(data) {
			var dfd = $.Deferred(),
				self = this, // the setTimeout causes the scope of 'this' (within the callback) to be lost
				todo = data.concat(); // create a clone of the original
			
			function process(arr) {
				var tempID = self.generate_id(),
					contact = {};
				
				for (item in arr) {
					// We're coding defensively as we may find our script in an environment
					// where the native Array object has been augmented by another script/developer.
					if (arr.hasOwnProperty(item)) {
						contact.id = tempID;
						contact[item] = arr[item];
					}
				}
				self.store.push(contact);
				console.log(contact);
				console.log('------------------------');
			}
			
			window.setTimeout(function timer(){
				var start = +new Date();
			
				// Process the current Array 
				// But only if the time that has passed so far hasn't exceeded 50ms
		        do {
		        	process(todo.shift());
		        } while (todo.length > 0 && (+new Date() - start < 50));
		
		        // If we've either passed 50ms (or the Processing of the Array hasn't completed)
		        // then execute this 'timer' function in 25ms time, 
		        // otherwise tell the Deferred object that the Promise has been resolved
		        if (todo.length > 0){
		            setTimeout(timer, 25);
		        } else {
		        	// We pass through the populated data to the resolver
		            dfd.resolve(self.store);
		        }				
			}, 25);
			
			// As this function is going to be executing asynchronously (due to the timed Array processing)
		 	// we'll be using Deferreds/Promises to help keep the UI from locking up
			return dfd.promise();
		},
		
		store: []
		
	};
	
	return Model;
	
});