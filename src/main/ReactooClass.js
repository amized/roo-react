import objectManager from "../utils/ObjectManager"

export default class ReactooClass {
	constructor(initialState = {}) {

		let state = initialState;
		let changed = false;
		Object.assign(this, state);

		this.__registeredTokens = [];
		this.__reactooProps = {
			registeredTokens: [],
			isChanged: () => changed,
			set: (newState) => {
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

	set(newState) {
		this.__reactooProps.set(newState);
	}

	isChanged() {
		return this.__reactooProps.isChanged();
	}
}
