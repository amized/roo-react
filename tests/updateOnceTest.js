var assert = require('assert');

import Roo, { connect, stateChange } from '../src/Roo'
import React, { Component } from "react"
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



/*** React components ***/

class ParentComp extends Component {
	render() {
		return (
			<div>
				<div>{this.props.company.name}</div>
				{
					this.props.company.employees.map((employee, index) => {
						return <ChildComp employee={employee} key={index} />
					})
				}
			</div>
		)
	}
}

class ChildComp extends Component {
	render() {
		return (
			<div>{this.props.employee.name}</div>
		)
	}
}




ParentComp = connect()(ParentComp);
ChildComp = connect()(ChildComp);
//const parentCompRenderSpy = sinon.spy(ParentComp, "render");

let spied = sinon.spy(ParentComp.prototype, 'render');
let childSpied = sinon.spy(ChildComp.prototype, 'render');

describe('Roo object', function () {

	it('should be able to run multiple state changes inside a updateOnce wrapper, and only update once', function(done) {

		const company = new Company();
		const employee1 = new Employee("James");
		const employee2 = new Employee("Henry");
		const employee3 = new Employee("Mary");

		company.addEmployee(employee1);
		company.addEmployee(employee2);
		company.addEmployee(employee3);

		// 1, 3
		const wrapper = mount(<ParentComp company={company} />);

		let update = () => {
			company.setName("Best company");
			company.setName("Worst company");
			company.setName("Ok company");
			employee1.setName("James2");
		}

		update = Roo.updateOnce(update);

		update();
		assert.equal(wrapper.html(), "<div><div>Ok company</div><div>James2</div><div>Henry</div><div>Mary</div></div>");
		assert.equal(ParentComp.prototype.render.callCount, 2);
		
		done();
		spied.reset();
		childSpied.reset();
	});


	it('should be able to run updateOnce with arguments', function(done) {
		const func = function(a,b) {
			return a + b;
		}
		let decorated = Roo.updateOnce(func);
		let c = decorated(5, 3);
		assert.equal(c, 8);
		done();
	});	

});








