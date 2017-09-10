import objectManager from "./ObjectManager"
import _ from "lodash"

const om = objectManager;

let lastUpdated = Date.now();
let throttleMs = 500;
let updateBuffer = [];
let updateTimeout = null;

function throttledUpdate() {
  const uniqTokens = _.uniq([].concat.apply([], updateBuffer));
  om.notifyUpdate(uniqTokens);
  updateBuffer = [];
  lastUpdated = Date.now();
  updateTimeout = null;
}



// Decorator function for method notifying a state change
export function stateChange(target, name, descriptor) {
  let fn = descriptor.value;
  // Adds a property onto the prototype so that we can quickly
  // check that this object is a Roo object
  target.__roo_enabled = true;
  let newFn = function (...args) {
  	if (this.__roo) {
  		updateBuffer.push(this.__roo.tokens);
  	}
  	if (!om.isUpdating) {
	  	om.isUpdating = true;
	    const result = fn.apply(this, arguments);
      if (updateTimeout === null) {
        const now = Date.now();
        const elapsed = now - lastUpdated;
        const timeoutMs = elapsed < throttleMs ? throttleMs - elapsed : 0;
        updateTimeout = setTimeout(() => {
          throttledUpdate();
        }, timeoutMs);
      }
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

  let newFn = function (...args) {
    if (!om.isUpdating) {
      om.isUpdating = true;
      const result = func(...args);
      const uniqTokens = _.uniq([].concat.apply([], om.updateBuffer));
      om.notifyUpdate(uniqTokens);
      om.updateBuffer = [];
      om.isUpdating = false;
      return result;
    }
    return func(...args);
  }

  return newFn;
}