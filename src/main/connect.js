import React, { Component, PropTypes, createElement } from 'react'
import objectManager from "./ObjectManager"

export default function connect(WrappedComponent) {
	
	return class RooComp extends Component {
		constructor(props) {
			super(props);
			this.rooToken = objectManager.registerElement(this.onUpdate, props);
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
			objectManager.reRegisterElement(this.props, nextProps, this.rooToken);
		}

		componentWillUnmount() {
			objectManager.deregisterElement(this.rooToken);
		}

		render() {
			return createElement(WrappedComponent, {...this.props})
		}
	}

}