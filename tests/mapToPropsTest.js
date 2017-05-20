var assert = require('assert');

import Roo, { connect, stateChange } from '../src/Roo'
import React, { Component, PropTypes } from "react"
import sinon from "sinon";
import { mount, shallow } from 'enzyme';


import jsdom from 'jsdom'
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView


/*** Roo classes ***/

class Company {

	constructor() {
		this.employees = [];
	}

	@stateChange
	setName(name) {
		this.name = name;
	}

	@stateChange
	addEmployee(employee) {
		this.employees.push(employee);
	}

	@stateChange
	setEmployees(employeeList) {
		this.employees = employeeList;
	}

	@stateChange
	setAllToJose() {
		this.employees.forEach((e)=>{
			e.setName("JOSE");
		})
	}

}


class Employee {

	constructor(name) {
		this.name = name;
	}

	@stateChange
	setName(name) {
		this.name = name;
	}
}


class Superpower {

	constructor(type) {
		this.type = type;
	}

	@stateChange
	setType(type) {
		this.type = type;
	}
}

/*** React components ***/






//ParentComp = connect()(ParentComp);
//ChildComp = connect()(ChildComp);
//const parentCompRenderSpy = sinon.spy(ParentComp, "render");

//let spied = sinon.spy(ParentComp.prototype, 'render');
//let childSpied = sinon.spy(ChildComp.prototype, 'render');

describe('Roo component', function () {


	class ParentComp extends Component {
		render() {
			return (
				<div>
					<div>{this.props.company.name}</div>
					{
						this.props.company.employees.map((employee, index) => {
							return <ConnectedChildComp employee={employee} key={index} />
						})
					}
				</div>
			)
		}
	}

	class ChildComp extends Component {
		static propTypes = {
			name: PropTypes.string
		} 
		render() {
			return (
				<div>{this.props.name}</div>
			)
		}
	}



	class ParentCompTwo extends Component {
		static propTypes = {
			name: PropTypes.string
		} 
		render() {
			return (
				<div>{this.props.name}</div>
			)
		}
	}

	const mapToProps = function(objs) {
		return {
			name: objs.employee.name
		}

	}


	const ConnectedChildComp = connect(mapToProps)(ChildComp);

	

	it('should pass the correct props to the child given a mapToProps function', function(done) {

		console.log("------ ROOO COMPOENNTN TEST ------");
		const mapToProps = function(objs) {
			return {
				name: objs.employee.name
			}

		}

		const company = new Company();
		company.setName("PlayFi")
		company.addEmployee(new Employee("David"));
		company.addEmployee(new Employee("Jess"));
		console.log("The company", company);
		const wrapper = mount(<ParentComp company={company} />);
		assert.equal(wrapper.html(), "<div><div>PlayFi</div><div>David</div><div>Jess</div></div>");
		done();
	});

	it('should be able to deal with multiple objects', function(done) {

		class GuyWithPower extends Component {
			static propTypes = {
				name: PropTypes.string,
				powerType: PropTypes.string
			} 
			render() {
				return (
					<div>
						<p>{this.props.name}</p>
						<p>{this.props.powerType}</p>
					</div>
				)
			}
		}

		const mapToProps = function(objs) {
			return {
				name: objs.employee.name,
				powerType: objs.superpower.type
			}

		}

		GuyWithPower = connect(mapToProps)(GuyWithPower);		
		
		class TestComp extends Component {
			render() {
				return (
					<div>
						{
							this.props.company.employees.map((employee, index) => {
								return <GuyWithPower employee={employee} superpower={this.props.superpower} key={index} />
							})
						}
					</div>
				)
			}
		}

		const company = new Company();
		const david = new Employee("David");
		const jess = new Employee("Jess");
		company.addEmployee(david);
		company.addEmployee(jess);

		let sp = new Superpower("flying");
		console.log("The company", company);
		const wrapper = mount(<TestComp company={company} superpower={sp} />);
		assert.equal(wrapper.html(), "<div><div><p>David</p><p>flying</p></div><div><p>Jess</p><p>flying</p></div></div>");
		sp.setType("invisibility");
		assert.equal(wrapper.html(), "<div><div><p>David</p><p>invisibility</p></div><div><p>Jess</p><p>invisibility</p></div></div>");
		david.setName("Germain");
		assert.equal(wrapper.html(), "<div><div><p>Germain</p><p>invisibility</p></div><div><p>Jess</p><p>invisibility</p></div></div>");
		done();
	});

});








