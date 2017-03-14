import objectManager from "../utils/ObjectManager"

export default class ReactooClass {
	constructor(initialState = {}) {

		let state = initialState;
		let changed = false;
		Object.assign(this, state);

		this.__registeredTokens = [];

		this.isChanged = () => {
			return changed;
		}

		this.set = (newState) => {
			Object.assign(state, newState);
			Object.assign(this, state);
			if (this.__registeredTokens.length > 0) {
				changed = true;
				objectManager.notifyUpdate(this.__registeredTokens, newState, this);
				changed = false;
			}
		}
	}
}