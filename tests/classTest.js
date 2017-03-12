var assert = require('assert');

import { ReactooClass, connect } from '../src/Reactoo'
import React, { Component } from "react"
import sinon from "sinon";
import { mount, shallow } from 'enzyme';



import jsdom from 'jsdom'
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView


/*** Reactoo classes ***/

class Company extends ReactooClass {

	constructor() {
		super({
			employees: [],
			name: ""
		});
	}

	setName(name) { this.set({name}) }



	
	setName(name) {
		this.set({name})
	}

	addEmployee(employee) {
		this.employees.push(employee);
		this.set({
			employees: this.employees
		})
	}
}


class Employee extends ReactooClass {

	constructor(name) {
		super({
			name: name
		});
	}
	setName(name) {
		this.set({name})
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




ParentComp = connect(ParentComp);
ChildComp = connect(ChildComp);
console.log(ParentComp);
//const parentCompRenderSpy = sinon.spy(ParentComp, "render");

let spied = sinon.spy(ParentComp.prototype, 'render');
let childSpied = sinon.spy(ChildComp.prototype, 'render');

describe('Reactoo object', function () {
	it('should update properties when calling set()', function(done) {
		
		const company = new Company();
		company.setName("James");
		assert.equal(company.name, "James");
		done();

	});

	it('should construct with initial props', function(done) {
		const employee = new Employee("James");
		assert.equal(employee.name, "James");
		done();
	});

	it('should trigger a re-render of components when calling set()', function(done) {

		const company = new Company();
		const wrapper = mount(<ParentComp company={company} />);
		company.setName("James");
		assert.equal(ParentComp.prototype.render.callCount, 2);
		assert.equal(wrapper.html(), "<div><div>James</div></div>");
		done();
		spied.reset();
	});

	it('should trigger a re-render of components when calling set() on any linked objects', function(done) {
		
		const company = new Company();
		const wrapper = mount(<ParentComp company={company} />);
		const employee1 = new Employee("James");
		company.addEmployee(employee1);
		assert.equal(wrapper.html(), "<div><div></div><div>James</div></div>");
		employee1.setName("Birsham");
		assert.equal(wrapper.html(), "<div><div></div><div>Birsham</div></div>");
		done();
		spied.reset();
		childSpied.reset();
	});

	it('should not trigger a render more than once in one set() call', function(done) {
		
		const company = new Company();
		const wrapper = mount(<ParentComp company={company} />);
		spied.reset();
		const employee1 = new Employee("James");
		company.addEmployee(employee1);
		assert.equal(ParentComp.prototype.render.callCount, 1);
		assert.equal(ChildComp.prototype.render.callCount, 1);


		spied.reset();
		childSpied.reset();
		employee1.setName("Birsham");
		assert.equal(ParentComp.prototype.render.callCount, 1);
		assert.equal(ChildComp.prototype.render.callCount, 1);

		done();
		spied.reset();
		childSpied.reset();
	});

	it('should re register approriate objects when the props change', function(done) {
		
		const company = new Company();
		const employee1 = new Employee("James");
		const employee2 = new Employee("Henry");
		const employee3 = new Employee("Mary");
		company.addEmployee(employee1);

		const wrapper = mount(<ParentComp company={company} />);

		company.set({
			employees: [employee2]
		})

		employee2.setName("Henry the second");

		assert.equal(ParentComp.prototype.render.callCount, 3);
		assert.equal(ChildComp.prototype.render.callCount, 3);
		assert.equal(wrapper.html(), "<div><div></div><div>Henry the second</div></div>");

		employee1.setName("James the first");

		assert.equal(ParentComp.prototype.render.callCount, 3);
		assert.equal(ChildComp.prototype.render.callCount, 3);
		assert.equal(wrapper.html(), "<div><div></div><div>Henry the second</div></div>");

		done();
		spied.reset();
		childSpied.reset();
	});

});