// The polyfill module doesn't return any data so we don't pass an arguments through for it
require(['Controllers/contacts', 'Models/contacts', 'Utils/polyfills'], function(Controller, Model){
	
	// After all our dependancies are loaded then we initialise the relevant Controller(s) for this page.
	Controller.init(Model);
	
	/*
		All our Controllers MUST be instantiated (and thus passed through the Model it controls).
		The Controller's init() method takes the passed through Model and calls that Model's internal getModelData() method.
		This getModelData() method uses a 'path' property (set separately on each Model instance) which tells the Model where its data source is.
	*/
	
});