var assert = require('assert');

import Reactoo, { connect, stateChange }  from '../src/Roo'
import React, { Component } from "react"
import sinon from "sinon";
import { mount, shallow } from 'enzyme';

import jsdom from 'jsdom'

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.document = doc
global.window = doc.defaultView

describe('Decorator', function () {

	it('should create a roo class when applied', function(done) {
		class Rootest {
			@stateChange
			test() {

			}
		}
		let proto = Rootest.prototype;
		assert.equal(proto.__roo_enabled, true);
		done();
	});
});