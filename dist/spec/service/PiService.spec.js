"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rest_lib_1 = require("@pomgui/rest-lib");
const PiService_1 = require("../../lib/service/PiService");
const express = require("express");
const request = require("supertest");
const database_1 = require("@pomgui/database");
class PiFakeDb extends database_1.PiNoopDatabase {
    close() { return Promise.reject('error on close database'); }
    ;
}
const person$ = new rest_lib_1.PiTypeDescriptor([
    new rest_lib_1.PiFieldDescriptor(F('name', 'string', true)),
    new rest_lib_1.PiFieldDescriptor(F('single', 'boolean', false)),
    new rest_lib_1.PiFieldDescriptor(F('status', 'enum', false, true, ['active', 'inactive']))
]).render();
class TestApi1 {
    async getPersons(params) {
        return params;
    }
    async newPerson(params) {
        return params;
    }
    async replacePerson(params) {
        return params;
    }
}
tslib_1.__decorate([
    PiService_1.PiGET('/persons', { descriptor: person$ }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TestApi1.prototype, "getPersons", null);
tslib_1.__decorate([
    PiService_1.PiPOST('/persons', { descriptor: person$ }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TestApi1.prototype, "newPerson", null);
tslib_1.__decorate([
    PiService_1.PiPUT('/persons') // without descriptor
    ,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TestApi1.prototype, "replacePerson", null);
;
class TestApi2 {
    async updatePerson(params) {
        throw new Error('Unspecific error'); // It should be a 500 error
    }
    async deletePerson(params) {
        throw ['array-item1', 'item2'];
    }
}
tslib_1.__decorate([
    PiService_1.PiPATCH('/persons', { descriptor: person$, database: false }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TestApi2.prototype, "updatePerson", null);
tslib_1.__decorate([
    PiService_1.PiDELETE('/persons', { descriptor: person$ }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], TestApi2.prototype, "deletePerson", null);
var app = express();
app.use(express.json());
app.use('/nodb', PiService_1.PiService({ services: [TestApi1], dbFactoryFn: () => null }));
app.use('/fakedb', PiService_1.PiService({ services: [TestApi2], dbFactoryFn: () => new PiFakeDb() }));
var st = request(app);
describe('PiService Without database ', () => {
    it('Test GET with descriptors and converting data', () => {
        st.get('/nodb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
            expect(res.body).toEqual({ name: 'John', single: false, status: ['active'] });
        });
    });
    it('Test POST with descriptors and missing required field', () => {
        st.post('/nodb/persons').query({ single: 'false' }).send({ 'status': ['active', 'inactive'] })
            .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/Fields \[name\] are required, but not found/);
        });
    });
    it('Test POST with descriptors and all fields', () => {
        st.post('/nodb/persons').query({ name: 'Mary', single: 'false' }).send({ 'status': 'inactive' })
            .end((err, res) => {
            expect(res.body).toEqual({ name: 'Mary', single: false, status: ['inactive'] });
        });
    });
    it('Test PUT that copies all the headers', () => {
        st.put('/nodb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
            expect(res.body.name).toEqual('John');
            expect(res.body.single).toEqual('false');
            expect(res.body.status).toEqual('active');
            // And... body has more fields (other headers)
            expect(Object.keys(res.body).find(k => !['name', 'single', 'status'].includes(k))).toBeTruthy();
        });
    });
});
describe('PiService With fake database ', () => {
    it('Test PATCH that throws an unexpected exception', () => {
        st.patch('/fakedb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
            expect(res.status).toEqual(500);
            expect(res.body.message).toMatch(/Unspecific error/);
        });
    });
    it('Test DELETE throws array of strings', () => {
        st.delete('/fakedb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
            expect(res.status).toEqual(500);
            expect(res.body).toEqual(['array-item1', 'item2']);
        });
    });
});
function F(name, jsType, required, isArray, values) {
    return { name, jsType, required, isArray, values };
}
//# sourceMappingURL=PiService.spec.js.map