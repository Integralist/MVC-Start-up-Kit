// We need to define jQuery as a 'named module' so we can specify it as a dependancy
require.config({ 
	paths : { 
		'jquery' : 'Utils/jquery'
	} 
});

require(['Controllers/contacts', 'Models/contacts'], function(Controller, Model){
	
	// After all our dependancies are loaded then we initialise the relevant Controller(s) for this page.
	// In this example we pass through the Model that needs to be populated with data to the Controllers initialisation method.
	Controller.init(Model);
	
});