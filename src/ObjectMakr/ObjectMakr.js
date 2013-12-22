/* ObjectMakr.js
 * A factory for JavaScript objects derived from Full Screen Mario
*/
function ObjectMakr(settings) {
  "use strict";
  
  /* Member Variables
  */
  var version = "1.0",
      
      // The default settings, applied to all objects
      defaults,
      // Settings for each of the sub-types
      type_defaults,
      
      // An associative array of types, as "name"=>{properties}
      types,
      
      // The sketch of which objects inherit from where
      inheritance,
      
      // An optional member function to be run immediately on made objects
      on_make,
      
      // If allowed, what to call the parent type from an object
      // Be aware this is read/write, and the end-user can mess things up!
      parent_name;
      
  // make("type"[, {settings})
  // Outputs a thing of the given type, optionally with user-given settings
  this.make = function(type, settings) {
    if(!types.hasOwnProperty(type)) {
      console.error("Type'" + type + "' does not exist.");
      return;
    }
    
    var thing = {};
    
    // Copy the default settings from the specified type
    proliferate(thing, types[type]);
    
    // Override in any user-defined settings
    if(settings)
      proliferate(thing, settings);
      
    // If specified, run a function on the object immediately
    if(on_make && thing[on_make]) {
      console.log("The settings are", settings);
      thing[on_make](type, settings);
    }
    
    return thing;
  }
  
  /* Simple gets
  */
  this.getInheritance = function() { return inheritance; }
  this.getDefaults = function() { return defaults; }
  this.getTypeDefaults = function() { return type_defaults; }
  
  /* Proliferate helper
   * Proliferates all members of the donar to the recipient recursively
  */
  function proliferate(recipient, donor, no_override) {
    var setting, i;
    // For each attribute of the donor
    for(i in donor) {
      // If no_override is specified, don't override if it already exists
      if(no_override && recipient.hasOwnProperty(i)) continue;
      // If it's an object, recurse on a new version of it
      if(typeof(setting = donor[i]) == "object") {
        if(!recipient.hasOwnProperty(i)) recipient[i] = new setting.constructor();
        proliferate(recipient[i], setting, no_override);
      }
      // Regular primitives are easy to copy otherwise
      else recipient[i] = setting;
    }
    return recipient;
  }
  
  /* Resetting
  */
  function reset(settings) {
    on_make = settings.on_make;
    parent_name = settings.parent_name;
    
    // Create the default attributes every produced Object will have
    defaults = {};
    proliferate(defaults, settings.defaults || {});
    
    // Create the initial attributes for everything
    type_defaults = {};
    proliferate(type_defaults, settings.type_defaults || {});
    
    // Set up the default type attributes
    // (By default, 'defaults' is the parent of everything)
    inheritance = { defaults: {} };
    types = {};
    proliferate(inheritance.defaults, settings.inheritance || {});
    // Recursively proliferate the type inheritences
    resetInheritance(defaults, inheritance, "defaults");
  }
  // For each type and all its children, submissively copy the type's attributes
  function resetInheritance(source, structure, name, parent) {
    var type_name, type;
    for(type_name in structure) {
      // Make sure the new type exists
      if(!type_defaults[type_name])
        type_defaults[type_name] = {};
      
      // Submissively copy over all of them
      proliferate(type_defaults[type_name], source, true);
      types[type_name] = type_defaults[type_name];
      
      // If specified, keep a reference to the parent
      if(parent_name)
        type_defaults[type_name][parent_name] = parent;
      
      // Recurse on the child type
      resetInheritance(type_defaults[type_name], structure[type_name], type_name, source);
    }
  }
  reset(settings || {});
}
