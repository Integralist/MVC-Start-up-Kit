define(function(){
	/**
	 * @license Copyright (c) 2011 Mark McDonnell
	 * LICENSE: see the LICENSE.txt file. 
	 * If file is missing, this file is subject to the MIT License at: 
	 * http://www.opensource.org/licenses/mit-license.php.
	 */
		
	// Stand.ard.iz.er library
	var standardizer = (function(){
	
		// Private implementation
		var __standardizer = {
		
			/**
			 * Following property indicates whether the current rendering engine is Trident (i.e. Internet Explorer)
			 * 
			 * @return v { Integer|undefined } if IE then returns the version, otherwise returns 'undefined' to indicate NOT a IE browser
			 */
			isIE: (function() {
				var undef,
					 v = 3,
					 div = document.createElement('div'),
					 all = div.getElementsByTagName('i');
			
				while (
					div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
					all[0]
				);
			
				return v > 4 ? v : undef;
			}()),
			
			/**
			 * The following method is a direct copy from Douglas Crockfords json2.js script (https://github.com/douglascrockford/JSON-js/blob/master/json2.js)
			 * It is used to replicate the native JSON.parse method found in most browsers.
			 * e.g. IE<8 hasn't got a native implementation.
			 * 
			 * @return { Object } a JavaScript Object Notation (JSON) compatible object
			 */
			json: function(text) {
				// The parse method takes a text and returns a JavaScript value if the text is a valid JSON text.
				var j,
					 cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
				
				function walk(holder, key) {
					// The walk method is used to recursively walk the resulting structure so that modifications can be made.
					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}
				
				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.
				text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
            	text = text.replace(cx, function(a) {
               	return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
            }
            
            // In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with '()' and 'new'
				// because they can cause invocation, and '=' because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.
				
				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
				// replace all simple value tokens with ']' characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.				
				if (/^[\],:{}\s]*$/
					.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
				   .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
				   .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				
				// In the third stage we use the eval function to compile the text into a
				// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
				// in JavaScript: it can begin a block or an object literal. We wrap the text
				// in parens to eliminate the ambiguity.				
					j = eval('(' + text + ')');
				
				// In the optional fourth stage, we recursively walk the new structure, passing
				// each name/value pair to a reviver function for possible transformation.				
				   return typeof reviver === 'function' ? walk({'': j}, '') : j;
				}
				
				// If the text is not JSON parseable, then a SyntaxError is thrown.				
				throw new SyntaxError('JSON.parse');
			},
			
			// Errors for AJAX request
			errors: [],
			
			/**
			 * XMLHttpRequest abstraction.
			 * 
			 * @return xhr { XMLHttpRequest|ActiveXObject } a new instance of either the native XMLHttpRequest object or the corresponding ActiveXObject
			 */
		 	xhr: (function() {
	
				// Create local variable which will cache the results of this function
				var xhr;
				
				return function() {
					// Check if function has already cached the value
					if (xhr) {
						// Create a new XMLHttpRequest instance
						return new xhr();
					} else {
						// Check what XMLHttpRequest object is available and cache it
						xhr = (!window.XMLHttpRequest) ? function() {
							return new ActiveXObject(
								// Internet Explorer 5 uses a different XMLHTTP object from Internet Explorer 6
								(__standardizer.isIE < 6) ? "Microsoft.XMLHTTP" : "MSXML2.XMLHTTP"
							);
						} : window.XMLHttpRequest;
						
						// Return a new XMLHttpRequest instance
						return new xhr();
					}
				};
				
			}()),
			
			/**
			 * A basic AJAX method.
			 * 
			 * @param settings { Object } user configuration
			 * @return undefined {  } no explicitly returned value
			 */
		 	ajax: function(settings) {
		 	
		 		// JavaScript engine will 'hoist' variables so we'll be specific and declare them here
		 		var xhr, url, requestDone, xhrTimeout,  
		 		
		 		// Load the config object with defaults, if no values were provided by the user
				config = {
					// The type of HTTP Request
					method: settings.method || 'POST',
					
					// The data to POST to the server
					data: settings.data || '',
				
					// The URL the request will be made to
					url: settings.url || '',
				
					// How long to wait before considering the request to be a timeout
					timeout: settings.timeout || 5000,
				
					// Functions to call when the request fails, succeeds, or completes (either fail or succeed)
					onComplete: settings.onComplete || function(){},
					onError: settings.onError || function(){},
					onSuccess: settings.onSuccess || function(){},
				
					// The data type that'll be returned from the server
					// the default is simply to determine what data was returned from the server and act accordingly.
					dataType: settings.dataType || ''
				};
				
				// Create new cross-browser XMLHttpRequest instance
				xhr = __standardizer.xhr();
				
				// Open the asynchronous request
				xhr.open(config.method, config.url, true);
				
				// Determine the success of the HTTP response
				function httpSuccess(r) {
					try {
						// If no server status is provided, and we're actually
						// requesting a local file, then it was successful
						return !r.status && location.protocol == 'file:' ||
						
						// Any status in the 200 range is good
						( r.status >= 200 && r.status < 300 ) ||
						
						// Successful if the document has not been modified
						r.status == 304 ||
						
						// Safari returns an empty status if the file has not been modified
						navigator.userAgent.indexOf('Safari') >= 0 && typeof r.status == 'undefined';
					} catch(e){
						// Throw a corresponding error
						throw new Error("httpSuccess Error = " + e);
					}
					
					// If checking the status failed, then assume that the request failed too
					return false;
				}
				
				// Extract the correct data from the HTTP response
				function httpData(xhr, type) {
					
					if (type === 'json') {
						// Make sure JSON parser is natively supported
						if (window.JSON !== undefined) {
							return JSON.parse(xhr.responseText);
						} 
						// IE<8 hasn't a native JSON parser so instead of eval()'ing the code we'll use Douglas Crockford's json2 parse() method
						else {
							return __standardizer.json(xhr.responseText);
							//return eval('(' + xhr.responseText + ')');
						}
					} 
					
					/*
					// If the specified type is "script", execute the returned text response as if it was JavaScript
					else if (type === 'script') {
						eval.call(window, xhr.responseText);
					}
					*/
					
					//
					else if (type === 'html') {
						return xhr.responseText;
					}
					
					//
					else if (type === 'xml') {
						return xhr.responseXML;
					}
					
					// Attempt to work out the content type
					else {
						// Get the content-type header
						var contentType = xhr.getResponseHeader("content-type"), 
							 data = !type && contentType && contentType.indexOf("xml") >= 0; // If no default type was provided, determine if some form of XML was returned from the server
						
						// Get the XML Document object if XML was returned from the server,
						// otherwise return the text contents returned by the server
						data = (type == "xml" || data) ? xhr.responseXML : xhr.responseText;	
						
						// Return the response data (either an XML Document or a text string)
						return data;
					}
					
				}
				
				// Initalize a callback which will fire within the timeout range, also cancelling the request (if it has not already occurred)
				xhrTimeout = window.setTimeout(function() {
					requestDone = true;
					config.onComplete();
				}, config.timeout);
				
				// Watch for when the state of the document gets updated
				xhr.onreadystatechange = function() {
					
					// Wait until the data is fully loaded, and make sure that the request hasn't already timed out
					if (xhr.readyState == 4 && !requestDone) {
						
						// Check to see if the request was successful
						if (httpSuccess(xhr)) {
							// Execute the success callback
							config.onSuccess(httpData(xhr, config.dataType));
						}
						
						/**
						 * For some reason, in an example PHP script that returns JSON data,
						 * even though the request 'timed out' it still generated a readyState of 4.
						 * I believe this was because although the script used sleep() to delay the data returned, the fact it returned data after the timeout caused an error.
						 * So when the httpSuccess expression used in the above condition returns false we need to execute the onError handler.
						 */
						else {
							config.onError(xhr);
						}
			
						// Call the completion callback
						config.onComplete();
						
						// Clean up after ourselves (+ help to avoid memory leaks)
						clearTimeout(xhrTimeout);
						xhr.onreadystatechange = null;
						xhr = null;
						
					} else if (requestDone && xhr.readyState != 4) {
						// If the script timed out then keep a log of it so the developer can query this and handle any exceptions
						__standardizer.errors.push(url + " { timed out } ");
						
						// Bail out of the request immediately
						xhr.onreadystatechange = null;
						xhr = null;
					}
					
				};
				
				// Get if we should POST or GET...
				if (config.data) {
					// Settings
					xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					
					// Establish the connection to the server
					xhr.send(config.data);
				} else {					
					// Establish the connection to the server
					xhr.send(null);
				}
	
			},
			
			/**
			 * Event management
			 * 
			 * Based on: addEvent/removeEvent written by Dean Edwards, 2005
			 * http://dean.edwards.name/weblog/2005/10/add-event/
			 * http://dean.edwards.name/weblog/2005/10/add-event2/
			 * 
			 * It doesn't utilises the DOM Level 2 Event Specification (http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/ecma-script-binding.html)
			 * Instead it uses the traditional DOM Level 1 methods along with a hash map object to correlate the different listeners/handlers.
			 * 
			 * Originally I had used a branching technique for add/removeEventListener (W3C) & add/detachEvent (IE).
			 * But discovered that trying to standardise the event object for a listener was impossible because it meant wrapping the callback in a function.
			 * And within that function then executing the callback and passing through a normalised event object.
			 * Problem is the removeEventListener can't remove listeners for anonymous functions.
			 * 
			 * e.g. this doesn't work...
			   
				element.addEventListener(eventType, function(e) {
            		handler(__standardizer.events.standardize(e));
            	}, false); 
            
			*/
			events: {
			
				/**
				 * A counter to generate a unique event handler ID
				 */
				id: 1,
			
				/**
				 * The add method allows us to assign a function to execute when an event of a specified type occurs on a specific element
				 * 
				 * @param element { Element/Node } the element that will have the event listener attached
				 * @param eventType { String } the event type, e.g. 'click' that will trigger the event handler
				 * @param handler { Function } the function that will execute as the event handler
				 * @return undefined {  } no explicitly returned value
				 */
				add: function(element, eventType, handler) {
					
					// Normalise user input
					eventType = eventType.toLowerCase();

					// Assign each event handler function a unique ID (via a static property '$$guid')
					if (!handler.$$guid) { 
						handler.$$guid = __standardizer.events.id++;
					}
					
					// Create hash table of event types for the element.
					// As there could be different events for the same element.
					if (!element.events) { 
						element.events = {};
					}
					
					// Create hash table of event handlers for each element/event pair
					var handlers = element.events[eventType];
					if (!handlers) {
						// If no eventType found then create empty hash for it
						handlers = element.events[eventType] = {};

						// Store the current event handler.
						// As each eventType could have multiple handlers needed to be executed for it.
						if (element["on" + eventType]) {
							handlers[0] = element["on" + eventType];
						}
					}
					
					// Store the event handler in the hash table
					handlers[handler.$$guid] = handler;
					
					// Assign a global event handler to do all the work
					element["on" + eventType] = __standardizer.events.handler;
					
				},
				
				/**
				 * The remove method allows us to remove previously assigned code from an event
				 * 
				 * @param element { Element/Node } the element that will have the event listener detached
				 * @param eventType { String } the event type, e.g. 'click' that triggered the event handler
				 * @param handler { Function } the function that was to be executed as the event handler
				 * @return undefined {  } no explicitly returned value
				 */
				remove: function(element, eventType, handler) {
				
					// Normalise user input
					eventType = eventType.toLowerCase();
					
					// Delete the event handler from the hash table
					if (element.events && element.events[eventType]) {
						delete element.events[eventType][handler.$$guid];
					}
					
				},
			
				/**
				 * This method handles the event hash map object and executes each event handler for each event type stored
				 */
				handler: function(e) {
				
					var returnValue = true,
						 handlers,
						 fn;
	
					// Standardise the event object
					e = e || window.event;
					
					// If you try and pass e to standardize method without first checking for e || window.event then a race condition issue happens with IE<8
					e = __standardizer.events.standardize(e);
					
					// Get a reference to the hash table of event handlers
					handlers = this.events[e.type];

					// Execute each event handler
					for (var i in handlers) {
						// Store current handler to be executed
						fn = handlers[i];
						
						// If after executing the function it's return value is false, then explicitly set the return value
						if (fn(e) === false) {
							returnValue = false;
						}
					}
					
					return returnValue;
					
				},
								
				/**
				 * The standardize method produces a unified set of event properties, regardless of the browser
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } an un-named object literal with the relevant event properties normalised
				 */
			 	standardize: function(event) { 
				
					// These two methods, defined later, return the current position of the 
					// mouse pointer, relative to the document as a whole, and relative to the 
					// element the event occurred within 
					var page = this.getMousePositionRelativeToDocument(event),
						 offset = this.getMousePositionOffset(event),
						 type = event.type;
					
					// Let's stop events from firing on element nodes above the current...
					
					// W3C method 
					if (event.stopPropagation) { 
						event.stopPropagation(); 
					} 
					
					// Internet Explorer method 
					else { 
						event.cancelBubble = true; 
					}
					
					// We return an object literal containing seven properties and one method 
					return { 
					
						// The event type
						type: type,
						
						// The target is the element the event occurred on 
						target: this.getTarget(event), 
						
						// The relatedTarget is the element the event was listening for, 
						// which can be different from the target if the event occurred on an 
						// element located within the relatedTarget element in the DOM 
						relatedTarget: this.getRelatedTarget(event), 
						
						// If the event was a  keyboard- related one, key returns the character 
						key: this.getCharacterFromKey(event), 
						
						// Return the x and y coordinates of the mouse pointer, 
						// relative to the document 
						pageX: page.x, 
						pageY: page.y, 
						
						// Return the x and y coordinates of the mouse pointer, 
						// relative to the element the current event occurred on 
						offsetX: offset.x, 
						offsetY: offset.y, 
						
						// The preventDefault method stops the default event of the element 
						// we're acting upon from occurring. If we were listening for click 
						// events on a hyperlink, for example, this method would stop the 
						// link from being followed 
						preventDefault: function() {
						 
						 	// W3C method
							if (event.preventDefault) {
								event.preventDefault();
							} 
							
							// Internet Explorer method
							else { 
								event.returnValue = false; 
							} 
							
						}
						
					};
					
				},
				
				/**
				 * The getTarget method locates the element the event occurred on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return target { Element/Node } the element that was the target of the triggered event
				 */
			 	getTarget: function(event) { 
				
					// Internet Explorer value is srcElement, W3C value is target 
					var target = event.srcElement || event.target; 
					
					// Window resize event causes 'undefined' value for target
					if (target !== undefined) {
						// Fix legacy Safari bug which reports events occurring on a text node instead of an element node 
						if (target.nodeType == 3) { // 3 denotes a text node 
							target = target.parentNode; // Get parent node of text node 
						}
					}
					
					// Return the element node the event occurred on 
					return target;
					 
				},
				
				/**
				 * The getCharacterFromKey method returns the character pressed when keyboard events occur. 
				 * You should use the keypress event as others vary in reliability
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return character { String } the character pressed when keyboard events occurred
				 */
			 	getCharacterFromKey: function(event) {
				 
					var character = "",
						 keycode; 
					
					// Internet Explorer 
					if (event.keyCode) {
						keycode = event.keyCode;
						character = String.fromCharCode(event.keyCode); 
					} 
					
					// W3C 
					else if (event.which) {
						keycode = event.which;
						character = String.fromCharCode(event.which); 
					} 
					
					return { code:keycode, character:character };
					
				},
				
				/**
				 * The getMousePositionRelativeToDocument method returns the current mouse pointer position relative to the top left edge of the current page.
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } the x and y coordinates
				 */
			 	getMousePositionRelativeToDocument: function(event) { 
					
					var x = 0, y = 0; 
					
					// pageX gets coordinates of pointer from left of entire document 
					if (event.pageX) { 
						x = event.pageX; 
						y = event.pageY; 
					} 
					
					// clientX gets coordinates from left of current viewable area 
					// so we have to add the distance the page has scrolled onto this value 
					else if (event.clientX) { 
						x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
						y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
					}
					
					// Return an object literal containing the x and y mouse coordinates 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				/**
				 * The getMousePositionOffset method returns the distance of the mouse pointer from the top left of the element the event occurred on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return anonymous { Object } the x and y coordinates of the mouse relative to the element
				 */
			 	getMousePositionOffset: function(event) {
				 
					var x = 0, y = 0; 
				
					if (event.layerX) { 
						x = event.layerX; 
						y = event.layerY; 
					}
					
					// Internet Explorer proprietary
					else if (event.offsetX) { 
						x = event.offsetX; 
						y = event.offsetY; 
					} 
					
					// Returns an object literal containing the x and y coordinates of the mouse relative to the element the event fired on 
					return { 
						x: x, 
						y: y 
					};
					
				},
				
				/**
				 * The getRelatedTarget method returns the element node the event was set up to fire on, 
				 * which can be different from the element the event actually fired on
				 * 
				 * @param event { Object } the event object associated with the event that was triggered
				 * @return relatedTarget { Element/Node } the element the event was set up to fire on
				 */
			 	getRelatedTarget: function(event) { 
				
					var relatedTarget = event.relatedTarget; 
					
					// With mouseover events, relatedTarget is not set by default 
					if (event.type == "mouseover") { 
						relatedTarget = event.fromElement; 
					} 
					
					// With mouseout events, relatedTarget is not set by default
					else if (event.type == "mouseout") { 
						relatedTarget = event.toElement; 
					}
					
					return relatedTarget; 
					
				}
				
			},
			
			css: {
			
				/**
				 * The getArrayOfClassNames method is a utility method which returns an array of all the CSS class names assigned to a particular element.
				 * Multiple class names are separated by a space character
				 * 
				 * @param element { Element/Node } the element we wish to retrieve class names for
				 * @return classNames { String } a list of class names separated with a space in-between
				 */
			 	getArrayOfClassNames: function(element) {
			 	
					var classNames = []; 
					
					if (element.className) { 
						// If the element has a CSS class specified, create an array 
						classNames = element.className.split(' '); 
					} 
					
					return classNames;
					
				},
				
				/**
				 * The addClass method adds a new CSS class of a given name to a particular element
				 * 
				 * @param element { Element/Node } the element we want to add a class name to
				 * @param className { String } the class name we want to add
				 * @return undefined {  } no explicitly returned value
				 */
			 	addClass: function(element, className) {
			 	
					// Get a list of the current CSS class names applied to the element 
					var classNames = this.getArrayOfClassNames(element); 
					
					// Make sure the class doesn't already exist on the element
				   if (this.hasClass(element, className)) {
				   	return;
				   }
				   
					// Add the new class name to the list 
					classNames.push(className);
					
					// Convert the list in space-separated string and assign to the element 
					element.className = classNames.join(' '); 
					
				},
				
				/**
				 * The removeClass method removes a given CSS class name from a given element
				 * 
				 * @param element { Element/Node } the element we want to remove a class name from
				 * @param className { String } the class name we want to remove
				 * @return undefined {  } no explicitly returned value
				 */
			 	removeClass: function(element, className) { 
			 	
					var classNames = this.getArrayOfClassNames(element),
						 resultingClassNames = []; // Create a new array for storing all the final CSS class names in 
			        
					for (var index = 0, len = classNames.length; index < len; index++) { 
					
						// Loop through every class name in the list 
						if (className != classNames[index]) { 
						
							// Add the class name to the new list if it isn't the one specified 
							resultingClassNames.push(classNames[index]); 
							
						} 
						
					}
					  
					// Convert the new list into a  space- separated string and assign it 
					element.className = resultingClassNames.join(" "); 
					
				},
				
				/**
				 * The hasClass method returns true if a given class name exists on a specific element, false otherwise
				 * 
				 * @param element { Element/Node } the element we want to check whether a class name exists on
				 * @param className { String } the class name we want to check for
				 * @return isClassNamePresent { Boolean } if class name was found or not
				 */
			 	hasClass: function(element, className) { 
			 	
					// Assume by default that the class name is not applied to the element 
					var isClassNamePresent = false,
						 classNames = this.getArrayOfClassNames(element); 
			        
					for (var index = 0, len = classNames.length; index < len; index++) { 
					
						// Loop through each CSS class name applied to this element 
						if (className == classNames[index]) { 
						
							// If the specific class name is found, set the return value to true 
							isClassNamePresent = true; 
							
						} 
						
					} 
			        
					// Return true or false, depending on if the specified class name was found 
					return isClassNamePresent; 
					
				}
				
			}
			
		};
	
		// Return public API
		return {
			load: __standardizer.ajax,
			events: __standardizer.events,
			css: __standardizer.css
		};
		
	}());
	
	return standardizer;
		
});