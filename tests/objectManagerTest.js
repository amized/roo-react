var assert = require('assert');

import Roo, { stateChange, connect }  from '../src/Roo'
import React, { Component } from "react"
import sinon from "sinon";
import { mount, shallow } from 'enzyme';

import objectManager from "../src/main/objectManager";

import jsdom from 'jsdom'
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView


const om = objectManager;



class Company {

	constructor() {
		this.employees = [];
		this.name = "";
	}

	@stateChange
	setName(name) { this.name = name }
	
	@stateChange
	addEmployee(employee) {
		this.employees.push(employee);
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

describe('Object manager', function () {

	it('should re register elements correctlt', function(done) {

		om.clear();

		let onUpdate = ()=>false;
		let company1 = new Company;
		let company2 = new Company;
		let employee1 = new Employee("Barbie");
		let employee2 = new Employee("Boobie")
		let props = {
			company: company1, 
			num: 5, 
			someString: "hello"
		}
		om.registerElement(onUpdate, props);
		assert.deepEqual(company1.__roo.tokens, [0]);

		let nextProps = {
			company: null, 
			num: 5, 
			someString: "hello"			
		}

		om.reRegisterElement(nextProps, 0);
		assert.deepEqual(company1.__roo.tokens, []);

		props = nextProps;
		nextProps = {
			company: company2, 
			num: 5,
			someString: "hi"
		}
		om.reRegisterElement(nextProps, 0);
		assert.deepEqual(company1.__roo.tokens, []);
		assert.deepEqual(company2.__roo.tokens, [0]);
		done();
	});

	it('should re register array elements correctly', function(done) {

		om.clear();

		let onUpdate = ()=>false;
		let employee1 = new Employee("Barbie");
		let employee2 = new Employee("Boobie");
		let investor1 = new Investor("James");
		let investor2 = new Investor("Harry");

		let propsForEl0 = {
			company: [employee1, employee2], 
			num: 5, 
			someString: "hello"
		}
		om.registerElement(onUpdate, propsForEl0);
		assert.deepEqual(employee1.__roo.tokens, [0]);
		assert.deepEqual(employee2.__roo.tokens, [0]);

		let nextProps = {
			company: [employee1], 
			num: 5, 
			someString: "hello"			
		}

		om.reRegisterElement(nextProps, 0);
		assert.deepEqual(employee1.__roo.tokens, [0]);
		assert.deepEqual(employee2.__roo.tokens, []);

		propsForEl0 = nextProps;

		//props = nextProps;

		let propsForEl1  = {
			company: [employee1, employee2], 
			investors: [investor1, investor2],
			num: 5, 
			someString: "hello"	
		}
		om.registerElement(onUpdate, propsForEl1);

		//om.reRegisterElement(props, nextProps, 5);
		assert.deepEqual(employee1.__roo.tokens, [0, 1]);
		assert.deepEqual(employee2.__roo.tokens, [1]);
		assert.deepEqual(investor1.__roo.tokens, [1]);
		assert.deepEqual(investor2.__roo.tokens, [1]);

		nextProps = {
			company: [employee2], 
			investors: [investor1],
			num: 5, 
			someString: "hello"	
		}

		om.reRegisterElement(nextProps, 0);
		assert.deepEqual(employee1.__roo.tokens, [1]);
		assert.deepEqual(employee2.__roo.tokens, [1, 0]);
		assert.deepEqual(investor1.__roo.tokens, [1, 0]);
		assert.deepEqual(investor2.__roo.tokens, [1]);
		done();

	});

	it ('should remove tokens from all roo objects when an object is deregistered', function(done) {
		om.clear();

		let onUpdate = ()=>false;
		let employee1 = new Employee("Barbie");
		let employee2 = new Employee("Boobie");
		let investor1 = new Investor("James");
		let investor2 = new Investor("Harry");		

		let propsForEl0 = {
			company: [employee1, employee2], 
			num: 5, 
			someString: "hello"
		}
		let propsForEl1 = {
			company: [employee1, employee2, investor1], 
			num: 5, 
			someString: "hello"
		}
		om.registerElement(onUpdate, propsForEl0);
		om.registerElement(onUpdate, propsForEl1);
		om.deregisterElement(0);

		assert.equal(om.reactElements[0], undefined);
		assert.deepEqual(employee1.__roo.tokens, [1]);
		assert.deepEqual(employee2.__roo.tokens, [1]);
		assert.deepEqual(investor1.__roo.tokens, [1]);

		done();
	});

	it('should not try to run an update on an unmounted component', function(done) {

		om.clear();
		let onUpdate = ()=>false;
		let spied = sinon.spy(onUpdate);
		let company1 = new Company;
		let company2 = new Company;
		let employee1 = new Employee("Barbie");
		let employee2 = new Employee("Boobie")
		let props = {
			company: company1, 
			num: 5, 
			someString: "hello"
		}

		let token = om.registerElement(spied, props);
		om.notifyUpdate([token]);
		om.deregisterElement(token);
		om.notifyUpdate([token]);
		assert.equal(spied.calledOnce, true);
		done();
	})




});