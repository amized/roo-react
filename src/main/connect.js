import React, { Component, PropTypes, createElement } from 'react'
import objectManager from "../utils/ObjectManager"

export default function connect(WrappedComponent) {
	
	return class ReactooComp extends Component {
		constructor(props) {
			super(props);
			this.lastUpdatedId = -1;
			const onUpdate = (updateId) => {
				if (updateId !== this.lastUpdatedId) {
					this.forceUpdate();
					this.lastUpdatedId = updateId;
				}
			}
			this.reactooToken = objectManager.registerElementToObjects(onUpdate, this.props);
		}

		componentWillUpdate() {
			// Makes sure we don't render this component again if
			// rendered from an ancestor component with connect()
			this.lastUpdatedId = objectManager.getCurrentUpdateId();
		}

		componentWillUnmount() {
			objectManager.deregisterElement(this.reactooToken);
		}

		render() {
			return createElement(WrappedComponent, {...this.props})
		}
	}

}