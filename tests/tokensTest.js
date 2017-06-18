var assert = require('assert');

import Roo, { connect, stateChange } from '../src/Roo'
import objectManager from '../src/main/objectManagerGetter'
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

class Investor {

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

	it('should be able to bind multiple arrays of Roo objects and assign them all the correct tokens', function(done) {

		objectManager.clear();

		class Wrapper extends Component {
			render() {
				const { investors, employees } = this.props;
				return (
					<div>
						<CompanyComponent employees={employees} investors={investors}/>
					</div>
				)
			}
		}

		class CompanyComponent extends Component {
			render () {
				return (
					<div>
						{ 
							this.props.employees.map((e,index) => <div key={index}>{e.name}</div>) 
						}
						{ 
							this.props.investors.map((i,index) => <div key={index}>{i.name}</div>) 
						}
					</div>
				)
			}
		}

		CompanyComponent = Roo.connect()(CompanyComponent);

		//class CompanyComp

		const david = new Employee("David");
		const jess = new Employee("Jess");
		const thomasinvestor = new Investor("Thomas");
		const barryinvestor = new Investor("Barry");

		const wrapper1 = mount(<Wrapper employees={[david, jess]} investors={[thomasinvestor, barryinvestor]}/>);
		
		assert.deepEqual(david.__roo.tokens, [0]);
		assert.deepEqual(jess.__roo.tokens, [0]);
		assert.deepEqual(thomasinvestor.__roo.tokens, [0]);
		assert.deepEqual(barryinvestor.__roo.tokens, [0]);

		const wrapper2 = mount(<Wrapper employees={[david]} investors={[thomasinvestor, barryinvestor]}/>);

		assert.deepEqual(david.__roo.tokens, [0, 1]);
		assert.deepEqual(jess.__roo.tokens, [0]);
		assert.deepEqual(thomasinvestor.__roo.tokens, [0, 1]);
		assert.deepEqual(barryinvestor.__roo.tokens, [0, 1]);

		//assert.equal(wrapper.html(), "<div><div><p>David</p><p>Jess</p></div></div>");


		/*
		assert.equal(wrapper.html(), "<div><div><p>David</p><p>Jess</p></div></div>");
		david.setName("Germain");
		assert.equal(wrapper.html(), "<div><div><p>Germain</p><p>Jess</p></div></div>");
		*/
		done();
	});

});








