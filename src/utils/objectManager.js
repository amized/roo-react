import ReactooClass from '../main/ReactooClass'
import _ from "lodash"
class ObjectManager {

	constructor() {

		this.registeredObjects = [];
		this.isUpdating = false;
		this.tokenIds = 0;
		this.updates = {};
		this.updateIds = 0;
	}

	setUpdating(isUpdating) {
		this.isUpdating = isUpdating;
	}

	// Because this method gets invoked from componentWillMount(),
	// we can ensure that registered elements will always be in order
	// of component heirarchy
	registerElementToObjects(onUpdate, props) {
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
	}

	addToken(token, obj) {
		let tokens = obj.__registeredTokens;
		if (tokens.indexOf(token) === -1) {
			obj.__registeredTokens.push(token);
		}
	}

	removeToken(token, obj) {
		let tokens = obj.__registeredTokens;
		let index = tokens.indexOf(token);
		if (index !== -1) {
			obj.__registeredTokens.splice(index, 1);
		}
	}

	getCurrentUpdateId() {
		return this.updateIds;
	}

	notifyUpdate(tokens, props) {

		// Sort tokens so the update functions are in heiarchial order
		tokens.sort(function(a, b) {
		  return a - b;
		});

		const updates = tokens.map(token=> {
			let update = this.updates[token];
			// The update may have been deleted from a component unmounting
			if (update === undefined) {
				this.removeToken(token, obj);
				return null;
			}
			return update;
		}).filter(update=>update!==null);

		updates.forEach(u=>u.func(this.updateIds));
		this.updateIds++;

		// Update any ancestor nodes because a reactoo element may have been added
		const objs = this.getAllReactooObjs(props);
		objs.forEach(obj=> {
			tokens.forEach(token => {
				this.addToken(token, obj);
			})
		})
	}


	getAllReactooObjs(propTree) {
		let objs = [];
		this.getAllReactooObjsRecurse(propTree, objs);
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