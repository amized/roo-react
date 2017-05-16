var assert = require('assert');

import Reactoo, { Class, connect }  from '../src/Roo'
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




});