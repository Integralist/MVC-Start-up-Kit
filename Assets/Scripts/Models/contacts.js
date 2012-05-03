define(['../Models/Model', '../Utils/Polyfills/object'], function (M) {
	
	// We first create a new Model that inherits from the top-level Model object (M)
	var Model = Object.create(M)
	
	// Every Controller has an init() method which calls the Model's getModelData() 
	// and passes through the following 'path' property (which tells the Model where it can grab its data from)
	Model.path = 'Assets/Includes/Contacts.php';
		
	return Model;
	
});