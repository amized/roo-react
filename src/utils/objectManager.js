import RooClass from '../main/RooClass'
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
		this.notifyMultipleUpdatesOn = false;
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

	notifyUpdate(tokens, props, obj) {
		if (this.notifyMultipleUpdatesOn) {
			this.updateBuffer.push(tokens);
			return;
		}

		// Sort tokens so the update functions are in heirachial order
		tokens.sort(function(a, b) {
		  return a - b;
		});

		const reactElements = tokens.map(token => this.reactElements[token]);
		const updateId = this.updateIds;
		reactElements.forEach(u=>u.func(updateId));
		this.updateIds++;
	}

	notifyMultipleUpdates() {
		const updateId = this.updateIds;
		const uniqTokens = _.uniq([].concat.apply([], this.updateBuffer));
		const reactElements = uniqTokens.map(token => this.reactElements[token]);
		reactElements.forEach(u=>u.func(updateId));
		this.updateIds++;
		this.updateBuffer = [];
	}



	getRooObjsShallow(props) {
		const objs = []
		Object.keys(props).forEach((key) => {
			let prop = props[key];
			if (prop === undefined || prop === null) {
				return;
			}
			if (typeof prop === "object" && prop instanceof RooClass) {
				objs.push(prop);
			}
		});
		return objs;		
	}

	updateOnce(func) {
		let self = this;
		return function(...args) {
			self.notifyMultipleUpdatesOn = true;
			func();
			self.notifyMultipleUpdates();
			self.notifyMultipleUpdatesOn = false;
		}
	}
}

const objectManager = new ObjectManager();

export default objectManager;