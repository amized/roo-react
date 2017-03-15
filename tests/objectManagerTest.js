var assert = require('assert');

import Reactoo, { Class, connect }  from '../src/Reactoo'
import React, { Component } from "react"
import sinon from "sinon";
import { mount, shallow } from 'enzyme';

import objectManager from "../src/utils/objectManager";

import jsdom from 'jsdom'
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView


const om = objectManager;



class Company extends Class {

	constructor() {
		super({
			employees: [],
			name: ""
		});
	}

	setName(name) { this.set({name}) }
	
	addEmployee(employee) {
		this.employees.push(employee);
		this.set({
			employees: this.employees
		})
	}
}


class Employee extends Class {

	constructor(name) {
		super({
			name: name
		});
	}
	setName(name) {
		this.set({name})
	}
}



describe('Object manager', function () {


	it('should register the appropriate objects on registering an element', function(done) {

		om.clear();

		let onUpdate = ()=>false;
		let company1 = new Company;
		let employee1 = new Employee("Barbie");
		let employee2 = new Employee("Boobie")
		let props = [company1, 5, "hello"];

		om.registerElement(onUpdate, props);

		assert.deepEqual([company1], om.registeredObjects);
		assert.deepEqual(company1.__registeredTokens, [0]);
		assert.deepEqual(employee1.__registeredTokens, []);

		company1.addEmployee(employee1);
		assert.deepEqual(company1.__registeredTokens, [0]);
		assert.deepEqual(employee1.__registeredTokens, [0]);
		assert.deepEqual([company1, employee1], om.registeredObjects);

		company1.set({
			assistants: {
				friend: employee2
			}
		})

		assert.deepEqual([company1, employee1, employee2], om.registeredObjects);
		done();

	});


	it('should clear registered objects when they have no update tokens', function(done) {

		om.clear();

		let onUpdate = ()=>false;
		let company1 = new Company;
		let employee1 = new Employee("Barbie");
		let employee2 = new Employee("Boobie")
		let props = [company1, 5, "hello"];
		om.registerElement(onUpdate, props);
		assert.deepEqual([company1], om.registeredObjects);
		om.deregisterElement(0);
		assert.deepEqual([], om.registeredObjects);
		done();
	});


});