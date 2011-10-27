define(['Controllers/Controller', 'jquery'], function(C, $){
	
	// We first create a new Controller that inherits from the top-level Controller object (C)
	var Controller = Object.create(C);
	
	// Each Controller instance needs to have a 'view' associated with it
	// We do this by creating an instance property (i.e. is only available on this instance)
	Controller.view = 'view-contacts';
	
	// Extend the default stub 'updateView' method
	Controller.updateView = function(data) {
		
		var dfd = $.Deferred(),
			self = this, // the setTimeout causes the scope of 'this' (within the callback) to be lost
			doc = document,
			container = doc.getElementById(this.view),
			select = container.getElementsByTagName('select')[0],
			option = doc.createElement('option'),
			counter = 0;
			todo = data.concat(); // create a clone of the original;
		
		// Saves us from having to keep grabbing the View
		Controller.viewElement = container;
			
		// Take content from currently passed through record and apply it to the page
		function process(record) {
			var opt = option.cloneNode(),
				txt = doc.createTextNode(record.name);
				
			// This helps us keep track of which <option> was selected
			opt.id = 'select_' + (counter++);
			
			opt.appendChild(txt);
			select.appendChild(opt);
		}
		
		/*
		 * Because there is potential for the data-set to be very large
		 * we need to use a timer to split the long array into chunks.
		 */
		window.setTimeout(function timer(){
			var start = +new Date();
		
			// Process the current Array 
			// But only if the time that has passed so far hasn't exceeded 50ms
	        do {
	        	process(todo.shift());
	        } while (todo.length > 0 && (+new Date() - start < 50));
	
	        // If we've either passed 50ms (or the Processing of the Array hasn't completed)
	        // then execute this 'timer' function in 25ms time (this helps keep the UI from locking up), 
	        // otherwise tell the Deferred object that the Promise has been resolved
	        if (todo.length > 0){
	            setTimeout(timer, 25);
	        } else {
	        	// Show the View
	        	$(container).removeClass('hide');
	        	
	        	// Pass through the callback we want executed (or leave empty if no callback needed)
	        	dfd.resolve(self.bindEvents);
	        }
		}, 25);
		
		// As this function is going to be executing asynchronously (due to the timed Array processing)
	 	// we'll be using Deferreds/Promises to help keep the UI from locking up
		return dfd.promise();
		
	}
	
	// Extend the default stub 'bindEvents' method
	Controller.bindEvents = function(Model) {
		
		var self = this,
			View = $(this.viewElement); // I wrap element in jQuery simply because I like using their delegate() method
		
		function handler(e, template) {
			// Find out which Contact was selected
			var id = this.options[this.selectedIndex].id.split('_')[1],
				doc = document,
				contact = doc.getElementById('tmpl_contact');
			
			// If the user has selected a non-Contact (e.g. selected the option 'Please select a user')
			// then we need to make sure we just display nothing (or a generic message)
			if(id === undefined) {
				// The user can only reach this condition if they have already displayed a valid Contact
				// so we know that we can just use innerHTML on the 'contact' variable
				contact.innerHTML = '';
			}
			// If we've already added a template Contact to the View then just update it
			else if (!!contact) {
				// Add the new template
				contact.innerHTML = self.template(template, Model.store[id]);
			} 
			// Otherwise this is the first time we're running this function so we need to create the Contact
			else {
				// Create a new element to store the template content
				contact = doc.createElement('div');
				
				// We use an id to help us reference this element in the future, 
				// so we can update it's content the next time a Contact is selected
				contact.id = 'tmpl_contact';
				
				// Add the template to the containing element
				contact.innerHTML = self.template(template, Model.store[id]);
				
				// Now update the View by adding the template to it
				self.viewElement.appendChild(contact);
			}
		}
		
		// First we grab the Template we need to use for the View
		this.getTemplate('Contacts.tmpl').then(function(template) {
			
			// Bind an event listener to the <select> menu so we can load in the appropriate data
			View.delegate('select', 'change', function(e) {
				// The context of 'this' is lost when just calling handler()
				// So we have to manually specify the context of 'this' using handler.call() instead.
				handler.call(this, e, template);
			});
			
		});
		
	}
		
	return Controller;
	
});