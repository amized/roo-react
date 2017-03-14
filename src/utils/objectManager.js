import ReactooClass from '../main/ReactooClass'
import _ from "lodash"
class ObjectManager {

	constructor() {
		this.clear();
	}

	clear() {
		this.registeredObjects = [];
		this.tokenIds = 0;
		this.updates = {};
		this.updateIds = 0;		
	}

	// Because this method gets invoked from componentWillMount(),
	// we can ensure that registered elements will always be in order
	// of component heirarchy
	registerElement(onUpdate, props) {
		const objs = this.getAllReactooObjs(props);

		if (objs.length === 0) {
			return null;
		}

		let token = this.tokenIds;
		let update = {
			token: token,
			func: onUpdate
		}
		this.updates[token] = update;
		this.tokenIds++;
		// Need to pass the update token to each some how 
		objs.forEach(obj=>{
			this.addToken(token, obj);
		})
		return token;
	}

	deregisterElement(token) {
		this.updates[token] = undefined;
		this.registeredObjects = this.registeredObjects.filter(obj=>{
			this.removeToken(token, obj);
			return obj.__registeredTokens.length > 0;
		})
	}

	addToken(token, obj) {
		let tokens = obj.__registeredTokens;
		if (tokens.indexOf(token) === -1) {
			obj.__registeredTokens.push(token);
		}
		if (this.registeredObjects.indexOf(obj) === -1) {
			this.registeredObjects.push(obj);
		}
	}

	removeToken(token, obj) {
		let tokens = obj.__registeredTokens;
		let index = tokens.indexOf(token);
		if (index !== -1) {
			obj.__registeredTokens.splice(index, 1);
		}
	}

	getRegisteredObjs(tokens) {
		return this.registeredObjects.filter((obj) => {
			return _.intersection(obj.__registeredTokens, tokens).length > 0;
		})
	}

	getCurrentUpdateId() {
		return this.updateIds;
	}

	notifyUpdate(tokens, props, obj) {

		// Sort tokens so the update functions are in heiarchial order
		tokens.sort(function(a, b) {
		  return a - b;
		});

		const updates = tokens.map(token => this.updates[token]);
		updates.forEach(u=>u.func(this.updateIds));
		this.updateIds++;

		this.refreshObjects(tokens, props, obj);
	}


	refreshObjects(tokens, props, obj) {

		// Spread each of the tokens to all the descendants added,
		// and remove the tokens from any that were removed
		const newObjs = this.getAllReactooObjs(props).concat([obj]);
		const prevObjs = this.getRegisteredObjs(tokens);

		let toAdd = _.difference(newObjs, prevObjs);
		let toRemove = _.difference(prevObjs, newObjs);

		toAdd.forEach(obj=> {
			tokens.forEach(token => {
				this.addToken(token, obj);
			})
		})
		toRemove.forEach(obj=> {
			tokens.forEach(token => {
				this.removeToken(token, obj);
			})
		})
	}

	reRegisterElement(oldProps, newProps, token) {

		const update = this.updates[token];
		const oldObjs = this.getReactooObjsShallow(oldProps);
		const newObjs = this.getReactooObjsShallow(newProps);

		let newToken = token;
		let diff = _.xor(oldObjs, newObjs);

		if (diff.length > 0) {
			this.deregisterElement(token);
			newToken = this.registerElement(update.func, newProps);
		}



		return newToken;
	}

	getAllReactooObjs(propTree) {
		let objs = [];
		this.getAllReactooObjsRecurse(propTree, objs);
		return objs;
	}

	getReactooObjsShallow(props) {
		const objs = []
		Object.keys(props).forEach((key) => {
			let prop = props[key];
			if (prop === undefined || prop === null) {
				return;
			}
			if (typeof prop === "object") {
				if (prop instanceof ReactooClass) {
					// No duplicates and avoid infinite loops with circular chains
					if (objs.indexOf(prop) !== -1) {
						return;
					}
					objs.push(prop);
				}
			}
		});
		return objs;		
	}

	getAllReactooObjsRecurse(props, objs) {
		Object.keys(props).forEach((key) => {
			let prop = props[key];
			if (prop === undefined || prop === null) {
				return;
			}
			if (typeof prop === "object") {
				if (prop instanceof ReactooClass) {
					// No duplicates and avoid infinite loops with circular chains
					if (objs.indexOf(prop) !== -1) {
						return;
					}
					objs.push(prop);
				}
				this.getAllReactooObjsRecurse(prop, objs);
			}
		});		
	}
}


const objectManager = new ObjectManager();

export default objectManager;