define(['Controllers/Controller', 'jquery'], function(C, $){
	
	// We first create a new Controller that inherits from the top-level Controller object (C)
	var Controller = Object.create(C);
	
	// Each Controller instance needs to have a 'view' associated with it
	// We do this by creating an instance property (i.e. is only available on this instance)
	Controller.view = 'view-contacts';
	
	// Extend the default stub 'updateView' method
	Controller.updateView = function(data) {
		
		var doc = document,
			container = doc.getElementById(this.view),
			select = container.getElementsByTagName('select')[0],
			option = doc.createElement('option');
		
		// Loop through each record and take it's content and apply it to the page
		for (var i = 0, len = data.length; i < len; i++) {
			var opt = option.cloneNode(),
				txt = doc.createTextNode(data[i].name);
			
			opt.appendChild(txt);
			select.appendChild(opt);
		}
		
		console.log(this.template(container.innerHTML, { name: 'Mark', age: '29', address: '9 Cables Street, London' }));
		
	}
		
	return Controller;
	
});