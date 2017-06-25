import objectManager from "./ObjectManager"
import _ from "lodash"

const om = objectManager;

// Decorator function for method notifying a state change
export function stateChange(target, name, descriptor) {
  let fn = descriptor.value;
  // Adds a property onto the prototype so that we can quickly
  // check that this object is a Roo object
  target.__roo_enabled = true;
  let newFn = function (...args) {
  	if (this.__roo) {
  		om.updateBuffer.push(this.__roo.tokens);
  	}
  	if (!om.isUpdating) {
	  	om.isUpdating = true;
	    const result = fn.apply(this, arguments);
	    const uniqTokens = _.uniq([].concat.apply([], om.updateBuffer));
	    om.notifyUpdate(uniqTokens);
	    om.updateBuffer = [];
	    om.isUpdating = false;
	    return result;
  	}
  	return fn.apply(this, arguments);
  };
  descriptor.value = newFn;
  return descriptor;
}

// Decorator for a function declaration
export function updateOnce(func) {
    om.isUpdating = true;
    const result = func();
    const uniqTokens = _.uniq([].concat.apply([], om.updateBuffer));
    om.notifyUpdate(uniqTokens);
    om.updateBuffer = [];
    om.isUpdating = false;
    return result;
}