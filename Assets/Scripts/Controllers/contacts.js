define(['../Controllers/Controller', '../Utils/Events/events', '../Utils/CSS/removeClass', '../Utils/Libraries/when', '../Utils/Libraries/pubsub', '../Utils/Polyfills/object'], function (C, events, removeClass, when, ps) {
	
	// We first create a new Controller that inherits from the top-level Controller object (C)
	var Controller = Object.create(C);
	
	// Each Controller instance needs to have a 'view' (or multiple views) associated with it
	// We do this by creating an instance property (i.e. is only available on this instance)
	// The views are the id attribute value for the corresponding element
	Controller.views = ['view-contacts', 'view-add'];
	
	// Every Controller instance is provided a stubbed function called 'updateView'
	// So here we're going to extend that stub
	Controller.updateView = handleUpdateView;
	
	// An instance object (e.g. only available on this Controller instance) for handling the event listeners
	Controller.handleEvents = {
	
		select: handleSelect,
		
		submit: handleSubmit
		
	};
	
	// An instance method (e.g. only available on this Controller instance) for setting-up event listeners for the specified View(s)
	Controller.bindEvents = handleBindEvents;
	
	/********************************************************************************************************************************
	 *
	 * FUNCTIONS: the following are all the functions specified above
	 * I purposely kept them separate so it was easier for someone new to the codebase to understand how the controllers worked
	 * Otherwise assigning function expressions meant too much code was inter-mingled and it was hard to read and follow the code
	 * 
	 ********************************************************************************************************************************/
	
	function handleUpdateView (data) {
		
		var dfd = when.defer(),
			doc = document;
			
		// Loop through the views and store the elements
		var tempViews = [];
		for (view in this.views) {
			if (this.views.hasOwnProperty(view)) {
				tempViews.push(doc.getElementById(this.views[view]));
			}
		}
		this.views = tempViews; // replace the id values with the actual elements
		
		var self = this, // the setTimeout causes the scope of 'this' (within the callback) to be lost
			container = this.views[0],
			select = container.getElementsByTagName('select')[0],
			option = doc.createElement('option'),
			counter = 0;
			todo = data.concat(); // create a clone of the original;
			
		// Take content from currently passed through record and apply it to the page
		function process (record) {
			var opt = option.cloneNode(false),
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
	        	removeClass(container, 'hide');
	        	
	        	// Pass through the callback we want executed (or leave empty if no callback needed)
	        	dfd.resolve(self.bindEvents);
	        }
		}, 25);
		
		// As this function is going to be executing asynchronously (due to the timed Array processing)
	 	// we'll be using Deferreds/Promises to help keep the UI from locking up
		return dfd.promise;
		
	}
	
	function handleSelect (e, template) {
			
		// Find out which Contact was selected
		var targ = e.target,
			id = targ.options[targ.selectedIndex].id.split('_')[1],
			doc = document,
			contact = doc.getElementById('tmpl_contact'),
			self = Controller;
		
		// If the user has selected a non-Contact (e.g. selected the option 'Please select a user')
		// then we need to make sure we just display nothing (or a generic message)
		if (id === undefined) {
			// The user can only reach this condition if they have already displayed a valid Contact
			// so we know that we can just use innerHTML on the 'contact' variable
			contact.innerHTML = '';
		}
		
		// If we've already added a template Contact to the View then just update it
		else if (!!contact) {
			// Add the new template
			contact.innerHTML = self.template(template, Controller.Model.store[id]);
		} 
		
		// Otherwise this is the first time we're running this function so we need to create the Contact
		else {
			// Create a new element to store the template content
			contact = doc.createElement('div');
			
			// We use an id to help us reference this element in the future, 
			// so we can update it's content the next time a Contact is selected
			contact.id = 'tmpl_contact';
			
			// Add the template to the containing element
			contact.innerHTML = self.template(template, Controller.Model.store[id]);
			
			// Now update the View by adding the template to it
			self.views[0].appendChild(contact);
		}
		
	}
	
	function handleSubmit (e) {
			
		// In this handler we validate the data entered and then 
		// post data to server via AJAX and let server-side store posted data in database.
		// Then on success we update our local store property (and also use localStorage if we wanted to)
		// But because this is just an example we've not written a server-side script to store in database so we've just ignore that part.
		
		// Prevent the form from submitting
		e.preventDefault();
		
		var errors = [],
			form = e.target,
			fullname = form.fullname.value,
			age = form.age.value,
			address = form.address.value,
			obj = {};
		
		// This regex tests for a first name with at least two characters, 
		// followed by an optional middle name with at least two characters (we use a non-capturing group to save the regex engine some work), 
		// followed by the last name with at least two characters.
		// This regex allows the first-middle name (and the middle-last) to be joined by a hypen (e.g. Georges St-Pierre or Georges-St Pierre)
		if (!/[\w-]{2,}(?:\s\w{2,})?[\s-]\w{2,}/.test(fullname)) {
			errors.push('Name was invalid');
		} 
		
		// We allow ages from 1-999
		if (!/\d{1,3}/.test(age)) {
			errors.push('Age was invalid (should be numeric value only)');
		}
		
		if (!address.length) {
			// Provide a default for the address (mainly because it's awkward to validate this type of field)
			address = 'No address provided';
		}
		
		// If there are any errors then we can't proceed
		if (errors.length) {
			// If the success message (from a previous successful record added) is still visible
			// then remove it to save from confusing the user.
			var success;
			if (success = document.getElementById('message-success')) {
				Controller.views[1].removeChild(success);
			}
			
			// Display errors
			alert(errors.join('\n'));
		} else {
			obj.name = fullname;
			obj.age = age;
			obj.address = address;
			obj.id = Controller.Model.generate_id();
			
			// AJAX function to post data to server-side script (for storing in db)
			
			// Insert the new record into the Model
			Controller.Model.add(obj);
			
			// Display success message and reset the form
			form.reset();
			
			// Create an element to hold our success message
			var doc = document,
				div = doc.createElement('div'),
				txt = doc.createTextNode('Record added successfully!');
			
			div.id = 'message-success';
				
			div.appendChild(txt);
			form.appendChild(div);
		}
		
	}
	
	function handleBindEvents(){
		
		var self = this,
			ViewContact = this.views[0],
			ViewAdd = this.views[1];
		
		// First we grab the Template we need to use for the View
		this.getTemplate('Contacts.tmpl').then(function (template) {
			
			// Bind an event listener to the <select> menu so we can load in the appropriate data
			events.add(ViewContact.getElementsByTagName('select')[0], 'change', function (e) {
				// We're using an anonymous function to call the relevant handler because 
				// we also need to pass through the 'template' object
				self.handleEvents.select(e, template);
			});
			
		});
		
		// Then we bind a listener to the form (for when the user adds a new user/record)
		events.add(ViewAdd, 'submit', self.handleEvents.submit);
		
	}
	
	/********************************************************************************************************************************
	 *
	 * SUBSCRIBERS: the following are all the subscribers for this Controller/Model set-up
	 * 
	 ********************************************************************************************************************************/
	
	// A single function has subscribed to the event triggered when a new record is added
	ps.subscribe('newrecord', newRecordData);
	
	// @note: The data passed through (if an Array) gets split into separate arguments!?
	// So the best way to access entire chunk of data is via the function's arguments object. 
	// Otherwise we'd have to manually specify the same number of arguments as items in the Array. 
	// Which in a dynamic system isn't possible as the number of items would be unknown.
	// Also, using 'arguments' wont long be supported in Js if the 'use strict' directive is also used.
	function newRecordData (topic, record) {
		var select = Controller.views[0].getElementsByTagName('select')[0],
			id = Controller.Model.getTotal(), // we give the <option> we add the same id value as the total number of records
			doc = document, 
			opt = doc.createElement('option'),
			txt = doc.createTextNode(record.name);
				
		opt.id = 'select_' + (--id); // the <select>'s are zero-indexed so we need to minus one from total length
		
		opt.appendChild(txt);
		select.appendChild(opt);
	}
		
	return Controller;
	
});