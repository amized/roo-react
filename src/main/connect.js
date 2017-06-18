import React, { Component, PropTypes, createElement } from 'react'
import objectManager from "./ObjectManager"

export default function connect(mapObjsToProps) {

	return function makeComponent(WrappedComponent) {

		class RooProvider extends Component {
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
				objectManager.reRegisterElement(nextProps, this.rooToken);
			}

			componentWillUnmount() {
				objectManager.deregisterElement(this.rooToken);
			}

			getProps() {
				if (mapObjsToProps) {
					let objs = objectManager.getRooObjsAsDict(this.props);
					let newProps = mapObjsToProps(objs);
					if (typeof newProps !== "object") {
						throw new Error("Roo: MapObjsToProps function must return an object");
						return this.props;
					}
					return Object.assign({}, this.props, newProps);
				}
				else {
					return this.props;
				}
			}

			render() {
				return createElement(WrappedComponent, this.getProps())
			}
		}	

		return RooProvider;
	}
}