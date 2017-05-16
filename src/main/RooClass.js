import objectManager from "../utils/ObjectManager"

export default class ReactooClass {
	constructor(initialState = {}) {

		let state = initialState;
		let changed = false;
		Object.assign(this, state);

		this.__roo = {
			tokens: [],
			isChanged: () => changed,
			set: (newState) => {
				Object.assign(state, newState);
				Object.assign(this, state);
				if (this.__roo.tokens.length > 0) {
					changed = true;
					objectManager.notifyUpdate(this.__roo.tokens, newState, this);
					changed = false;
				}				
			}
		}
	}

	set(newState) {
		this.__roo.set(newState);
	}

	isChanged() {
		return this.__roo.isChanged();
	}
}
