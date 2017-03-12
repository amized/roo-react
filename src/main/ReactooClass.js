import objectManager from "../utils/ObjectManager"

export default class ReactooClass {
	constructor() {

		let state = {};
		let changed = false;
		this.__registeredTokens = [];

		this.isChanged = () => {
			return changed;
		}

		this.set = (newState) => {
			// We don't notify an update is there's 
			// an update already in progress, because it means that
			// this set() call is being run from a parent set() call.
			console.log("calling set...",  this.constructor.name);
			Object.assign(state, newState);
			Object.assign(this, state);
			changed = true;
			objectManager.notifyUpdate(this.__registeredTokens, newState);
			changed = false;
		}
	}
}