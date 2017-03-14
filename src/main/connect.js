import React, { Component, PropTypes, createElement } from 'react'
import objectManager from "../utils/ObjectManager"

export default function connect(WrappedComponent) {
	
	return class ReactooComp extends Component {
		constructor(props) {
			super(props);
			this.lastUpdatedId = -1;
			this.reactooToken = objectManager.registerElement(this.onUpdate, this.props);
		}

		onUpdate = (updateId) => {
			if (updateId !== this.lastUpdatedId) {
				this.forceUpdate();
				this.lastUpdatedId = updateId;
			}
		}

		componentWillUpdate(nextProps) {
			// Makes sure we don't render this component again if
			// rendered from an ancestor component with connect()
			this.lastUpdatedId = objectManager.getCurrentUpdateId();
			const newToken = objectManager.reRegisterElement(this.props, nextProps, this.reactooToken);
			if (newToken !== null) {
				this.reactooToken = newToken;
			}
		}

		componentWillUnmount() {
			objectManager.deregisterElement(this.reactooToken);
		}

		render() {
			return createElement(WrappedComponent, {...this.props})
		}
	}

}