"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var piservices_common_1 = require("piservices-common");
var PiService_1 = require("../../lib/service/PiService");
var express = require("express");
var request = require("supertest");
var PiNoopDatabase_1 = require("../../lib/dao/PiNoopDatabase");
var PiFakeDb = /** @class */ (function (_super) {
    tslib_1.__extends(PiFakeDb, _super);
    function PiFakeDb() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PiFakeDb.prototype.close = function () { return Promise.reject('error on close database'); };
    ;
    return PiFakeDb;
}(PiNoopDatabase_1.PiNoopDatabase));
var person$ = new piservices_common_1.PiTypeDescriptor([
    new piservices_common_1.PiFieldDescriptor('name', 'string', true),
    new piservices_common_1.PiFieldDescriptor('single', 'boolean', false),
    new piservices_common_1.PiFieldDescriptor('status', 'enum[]', false, ['active', 'inactive'])
]);
var TestApi1 = /** @class */ (function () {
    function TestApi1() {
    }
    TestApi1.prototype.getPersons = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, params];
            });
        });
    };
    TestApi1.prototype.newPerson = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, params];
            });
        });
    };
    TestApi1.prototype.replacePerson = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, params];
            });
        });
    };
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
    return TestApi1;
}());
;
var TestApi2 = /** @class */ (function () {
    function TestApi2() {
    }
    TestApi2.prototype.updatePerson = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw new Error('Unspecific error'); // It should be a 500 error
            });
        });
    };
    TestApi2.prototype.deletePerson = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw ['array-item1', 'item2'];
            });
        });
    };
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
    return TestApi2;
}());
var app = express();
app.use(express.json());
app.use('/nodb', PiService_1.PiService({ services: [TestApi1], dbFactoryFn: function () { return null; } }));
app.use('/fakedb', PiService_1.PiService({ services: [TestApi2], dbFactoryFn: function () { return new PiFakeDb(); } }));
var st = request(app);
describe('PiService Without database ', function () {
    it('Test GET with descriptors and converting data', function () {
        st.get('/nodb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end(function (err, res) {
            expect(res.body).toEqual({ name: 'John', single: false, status: ['active'] });
        });
    });
    it('Test POST with descriptors and missing required field', function () {
        st.post('/nodb/persons').query({ single: 'false' }).send({ 'status': ['active', 'inactive'] })
            .end(function (err, res) {
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/Fields \[name\] are required, but not found/);
        });
    });
    it('Test POST with descriptors and all fields', function () {
        st.post('/nodb/persons').query({ name: 'Mary', single: 'false' }).send({ 'status': 'inactive' })
            .end(function (err, res) {
            expect(res.body).toEqual({ name: 'Mary', single: false, status: ['inactive'] });
        });
    });
    it('Test PUT that copies all the headers', function () {
        st.put('/nodb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end(function (err, res) {
            expect(res.body.name).toEqual('John');
            expect(res.body.single).toEqual('false');
            expect(res.body.status).toEqual('active');
            // And... body has more fields (other headers)
            expect(Object.keys(res.body).find(function (k) { return !['name', 'single', 'status'].includes(k); })).toBeTruthy();
        });
    });
});
describe('PiService With fake database ', function () {
    it('Test PATCH that throws an unexpected exception', function () {
        st.patch('/fakedb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end(function (err, res) {
            expect(res.status).toEqual(500);
            expect(res.body.message).toMatch(/Unspecific error/);
        });
    });
    it('Test DELETE throws array of strings', function () {
        st.delete('/fakedb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end(function (err, res) {
            expect(res.status).toEqual(500);
            expect(res.body).toEqual(['array-item1', 'item2']);
        });
    });
});
//# sourceMappingURL=PiService.spec.js.map