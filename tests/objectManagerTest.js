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

		om.reRegisterElement(props, nextProps, 0);
		assert.deepEqual(company1.__roo.tokens, []);

		props = nextProps;
		nextProps = {
			company: company2, 
			num: 5,
			someString: "hi"
		}
		om.reRegisterElement(props, nextProps, 0);
		assert.deepEqual(company1.__roo.tokens, []);
		assert.deepEqual(company2.__roo.tokens, [0]);
		done();
	});

	it('should not try to run an update on an unmounted component', function(done) {

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

		let token = om.registerElement(onUpdate, props);
		om.deregisterElement(token);
		om.notifyUpdate([token]);
		done();
	})



});