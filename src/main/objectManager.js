import _ from "lodash"

class ObjectManager {

	constructor() {
		this.clear();
	}

	clear() {
		this.tokenIds = 0;
		this.reactElements = {};
		this.updateIds = 0;	
		this.updateBuffer = [];
		this.isUpdating = false;
	}

	// Because this method gets invoked from component's constructor,
	// we can ensure that registered elements will always be in order
	// of component heirarchy
	registerElement(onUpdate, props) {
		const objs = this.getRooObjsShallow(props);
		if (objs.length === 0) {
			return null;
		}
		let token = this.tokenIds;
		this.reactElements[token] = {
			token: token,
			func: onUpdate
		};

		// Need to pass the update token to each some how 
		objs.forEach(obj=>{
			this.addToken(token, obj);
		})

		this.tokenIds++;

		return token;
	}

	deregisterElement(token) {
		this.reactElements[token] = undefined;
	}

	reRegisterElement(oldProps, newProps, token) {
		const element = this.reactElements[token];
		if (!element) return;
		
		// Finds all the Roo objects inside props that are passed
		// into the component. It compares prev and next and
		// updates tokens on the objects

		const oldObjs = this.getRooObjsShallow(oldProps);
		const newObjs = this.getRooObjsShallow(newProps);

		let removed = _.difference(oldObjs, newObjs);
		let added = _.difference(newObjs, oldObjs);

		added.forEach((obj) => {
			this.addToken(token, obj); 
		})

		removed.forEach((obj) => {
			this.removeToken(token, obj); 
		})

		return token;
	}


	addToken(token, obj) {
		let tokens = obj.__roo.tokens;
		if (tokens.indexOf(token) === -1) {
			obj.__roo.tokens.push(token);
		}
	}

	removeToken(token, obj) {
		let tokens = obj.__roo.tokens;
		let index = tokens.indexOf(token);
		if (index !== -1) {
			obj.__roo.tokens.splice(index, 1);
		}
	}

	getCurrentUpdateId() {
		return this.updateIds;
	}

	notifyUpdate(tokens) {
		// Sort tokens so the update functions are in heirachial order
		tokens.sort(function(a, b) {
		  return a - b;
		});

		const reactElements = tokens.map(token => this.reactElements[token]);
		const updateId = this.updateIds;
		reactElements.forEach(u=>u.func(updateId));
		this.updateIds++;
	}

	// Decorator function for notifying a state change
	stateChange(target, name, descriptor) {
	  let fn = descriptor.value;
	  let om = this;
	  
	  // Adds a property onto the prototype so that we can quickly
	  // check that this object is a Roo object
	  target.__roo_enabled = true;
	  let newFn  = function (...args) {
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


	isRooObject(obj) {
		if (typeof obj === "object") {
			if (obj.__roo !== undefined) {
				return true;
			}
			let proto = Object.getPrototypeOf(obj);
			if (proto.__roo_enabled) {
				obj.__roo = {
					tokens: []
				}
				return true;
			}
		}
		return false;
	}

	getRooObjsShallow(props) {
		return this.getRooObjs(props).list;
	}

	getRooObjsAsDict(props) {
		return this.getRooObjs(props).dict;
	}

	getRooObjs(props) {

		let objsAsList = [];
		let objsAsDict = {};

		Object.keys(props).forEach((key) => {
			let prop = props[key];
			if (prop === undefined || prop === null) {
				return;
			}
			if (this.isRooObject(prop)) {
				objsAsDict[key] = prop;
				objsAsList.push(prop);
			}
			else if (Array.isArray(prop)) {
				let list = prop.filter(item => this.isRooObject(item));
				objsAsDict[key] = list;
				objsAsList = objsAsList.concat(list);
			}
		});
		
		return {
			dict: objsAsDict,
			list: objsAsList
		}		
	}

}

const objectManager = new ObjectManager();

export default objectManager;