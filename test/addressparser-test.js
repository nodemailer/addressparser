/* global it: false, describe: false */

'use strict';

var chai = require('chai');
var addressparser = require('../lib/addressparser');
var expect = chai.expect;

chai.config.includeStack = true;

describe('#addressparser', function () {
    it('should handle single address correctly', function () {
        var input = 'andris@tr.ee';
        var expected = [{
            address: 'andris@tr.ee',
            name: ''
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle multiple addresses correctly', function () {
        var input = 'andris@tr.ee, andris@example.com';
        var expected = [{
            address: 'andris@tr.ee',
            name: ''
        }, {
            address: 'andris@example.com',
            name: ''
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle unquoted name correctly', function () {
        var input = 'andris <andris@tr.ee>';
        var expected = [{
            name: 'andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle quoted name correctly', function () {
        var input = '"reinman, andris" <andris@tr.ee>';
        var expected = [{
            name: 'reinman, andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle quoted semicolons correctly', function () {
        var input = '"reinman; andris" <andris@tr.ee>';
        var expected = [{
            name: 'reinman; andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle unquoted name, unquoted address correctly', function () {
        var input = 'andris andris@tr.ee';
        var expected = [{
            name: 'andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle emtpy group correctly', function () {
        var input = 'Undisclosed:;';
        var expected = [{
            name: 'Undisclosed',
            group: []
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle address group correctly', function () {
        var input = 'Disclosed:andris@tr.ee, andris@example.com;';
        var expected = [{
            name: 'Disclosed',
            group: [{
                address: 'andris@tr.ee',
                name: ''
            }, {
                address: 'andris@example.com',
                name: ''
            }]
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle semicolon as a delimiter', function () {
        var input = 'andris@tr.ee; andris@example.com;';
        var expected = [{
            address: 'andris@tr.ee',
            name: ''
        }, {
            address: 'andris@example.com',
            name: ''
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle mixed group correctly', function () {
        var input = 'Test User <test.user@mail.ee>, Disclosed:andris@tr.ee, andris@example.com;,,,, Undisclosed:;';
        var expected = [{
            address: 'test.user@mail.ee',
            name: 'Test User'
        }, {
            name: 'Disclosed',
            group: [{
                address: 'andris@tr.ee',
                name: ''
            }, {
                address: 'andris@example.com',
                name: ''
            }]
        }, {
            name: 'Undisclosed',
            group: []
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('semicolon as delimiter should not break group parsing', function () {
        var input = 'Test User <test.user@mail.ee>; Disclosed:andris@tr.ee, andris@example.com;,,,, Undisclosed:; bob@example.com;';
        var expected = [{
            address: 'test.user@mail.ee',
            name: 'Test User'
        }, {
            name: 'Disclosed',
            group: [{
                address: 'andris@tr.ee',
                name: ''
            }, {
                address: 'andris@example.com',
                name: ''
            }]
        }, {
            name: 'Undisclosed',
            group: []
        }, {
            address: 'bob@example.com',
            name: ''
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle name from comment correctly', function () {
        var input = 'andris@tr.ee (andris)';
        var expected = [{
            name: 'andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle skip comment correctly', function () {
        var input = 'andris@tr.ee (reinman) andris';
        var expected = [{
            name: 'andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle missing address correctly', function () {
        var input = 'andris';
        var expected = [{
            name: 'andris',
            address: ''
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle apostrophe in name correctly', function () {
        var input = 'O\'Neill';
        var expected = [{
            name: 'O\'Neill',
            address: ''
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle particularily bad input, unescaped colon correctly', function () {
        var input = 'FirstName Surname-WithADash :: Company <firstname@company.com>';
        var expected = [{
            name: 'FirstName Surname-WithADash',
            group: [{
                name: undefined,
                group: [{
                    address: 'firstname@company.com',
                    name: 'Company'
                }]
            }]
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    // should not change an invalid email to valid email
    it('should handle invalid email address correctly', function () {
        var input = 'name@address.com@address2.com';
        var expected = [{
            name: '',
            address: 'name@address.com@address2.com'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle unexpected <', function () {
        var input = 'reinman > andris < test <andris@tr.ee>';
        var expected = [{
            name: 'reinman > andris',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle single-quoted address', function () {
        var input = 'andris reinman <\'andris@tr.ee\'>';
        var expected = [{
            name: 'andris reinman',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle double-quoted address', function () {
        var input = 'andris reinman <"andris@tr.ee">';
        var expected = [{
            name: 'andris reinman',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should handle quoted email name', function () {
        var input = '"andris@tr.ee" <"andris@tr.ee">';
        var expected = [{
            name: '',
            address: 'andris@tr.ee'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });

    it('should not handle email quoted midway', function () {
        var input = 'andris reinman <and"ris@tr.ee">';
        var expected = [{
            name: 'andris reinman',
            address: 'and"ris@tr.ee"'
        }];
        expect(addressparser(input)).to.deep.equal(expected);
    });
});
