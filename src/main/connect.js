import React, { Component, PropTypes, createElement } from 'react'
import objectManager from "../utils/ObjectManager"

export default function connect(WrappedComponent) {
	
	return class ReactooComp extends Component {
		constructor(props) {
			super(props);
			this.lastUpdatedId = -1;
			this.reactooToken = objectManager.registerElement(this.onUpdate, props);
			this.state = {
				lastUpdatedId: -1
			}
		}

		onUpdate = (updateId) => {
			if (updateId !== this.state.lastUpdatedId) {
				this.setState({
					lastUpdatedId: updateId
				})
			}
		}

		componentWillReceiveProps(nextProps) {
			this.setState({
				lastUpdatedId: objectManager.getCurrentUpdateId()
			})
			objectManager.reRegisterElement(this.props, nextProps, this.reactooToken);
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