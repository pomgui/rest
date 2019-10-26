"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PiMysqlMock_1 = require("../../PiMysqlMock");
var PiMySqlDatabase_1 = require("../../../lib/dao/PiMySqlDatabase");
var mysqlTest, db;
console.debug = console.warn = function () { };
describe('MySQL Database', function () {
    beforeEach(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            mysqlTest = new PiMysqlMock_1.PiMysqlMock();
            mysqlTest.begin();
            db = new PiMySqlDatabase_1.PiMySqlDatabase('mysql://pomgui.com/testdb'); // any connection string will do. It's a mocked db.
            return [2 /*return*/];
        });
    }); });
    afterEach(function () {
        mysqlTest.end();
    });
    test('beginTransaction', function () { return db.beginTransaction(); });
    test('commit', function () { return db.commit(); });
    test('rollback', function () { return db.rollback(); });
    test('end', function () { return db.close(); });
    var rawRecords = [
        { PERSON_ID: 1, NAME: 'John', BIRTH_DATE: new Date('2019-01-01') },
        { PERSON_ID: 2, NAME: 'Mary', BIRTH_DATE: new Date('2019-01-02') }
    ], resRecords = [
        { personId: 1, name: 'John', birthDate: new Date('2019-01-01') },
        { personId: 2, name: 'Mary', birthDate: new Date('2019-01-02') }
    ];
    describe('Queries many records', function () {
        testQuery('query without params', function () { return db.query('select * from persons', []); }, /select.*from persons/, rawRecords, resRecords);
        testQuery('query with defined params', function () { return db.query('select * from persons where person_id >= :personId', { personId: 12 }); }, /select.*from persons/, rawRecords, resRecords);
        testQuery('query with dotted params', function () { return db.query('select * from persons where person_id >= :person.id', { person: { id: 12 } }); }, /select.*from persons/, rawRecords, resRecords);
        testQuery('query with undefined params', function () { return db.query('select * from persons where person_id >= :personId', { id: 12 }); }, /select.*from persons/, rawRecords, resRecords);
        testQuery('CALL procedure()', function () { return db.query('CALL procedure(:id)', { id: 12 }); }, /call procedure/i, [rawRecords, { affectedRows: 1 }], resRecords);
        testQuery('query excluding columns', function () { return db.query('select * from persons where person_id >= :personId', { personId: 12 }, { ignore: ['name', 'birth_date'] }); }, /select.*from persons/, rawRecords, resRecords.map(function (r) { return ({ personId: r.personId }); }));
        testQuery('query mapping columns', function () { return db.query('select * from persons where person_id >= :personId', { personId: 12 }, { map: { name: 'personName' } }); }, /select.*from persons/, rawRecords, resRecords.map(function (r) { return ({ personId: r.personId, personName: r.name, birthDate: r.birthDate }); }));
    });
    describe('Query single records', function () {
        it('query 1 reg', function () {
            db.querySingle('select * from persons where person_id = :id', { id: 12 })
                .then(function (r) { return expect(r).toEqual(resRecords[0]); });
            mysqlTest.expectOne('query', /select/).resolve(null, [rawRecords[0]]);
        });
        it("Query 0 records", function () {
            db.querySingle('select * from persons where person_id = :id', { id: 12 })
                .catch(function (e) { return expect(function () { throw e; }).toThrowError(/Not found/); });
            mysqlTest.expectOne('query', /select/).resolve(null, []);
        });
        it("Query too many rows", function () {
            db.querySingle('select * from persons where person_id = :id', { id: 12 })
                .catch(function (e) { return expect(function () { throw e; }).toThrowError(/Too many rows/); });
            mysqlTest.expectOne('query', /select/).resolve(null, rawRecords);
        });
    });
    describe('Insert/Update', function () {
        testQuery('Inserting 1 record', function () { return db.insert('insert into persons(name) values(:name)', { name: 'Wil' }); }, /insert/, { affectedRows: 1, insertId: 1000 }, 1000);
        testQuery('Inserting 5 records', function () { return db.insert('insert into persons(name) values(:name),...', { name: 'Wil' }); }, '', { affectedRows: 5, insertId: 1000 }, [1000, 1001, 1002, 1003, 1004]);
        testQuery('Updating', function () { return db.update('update persons set name = :name,...', { name: 'Wil' }); }, 'update', { affectedRows: 5 }, 5);
    });
    function test(type, run) {
        [false, true].forEach(function (error) {
            return it(type + ": " + (error ? 'Error' : 'Ok'), function () {
                var promise = expectAsync(run());
                if (error)
                    promise.toBeRejected();
                else
                    promise.toBeResolved();
                mysqlTest.expectOne(type).resolve(error ? 'Error' : null);
            });
        });
    }
    function testQuery(caption, run, sql, result, expected) {
        [false, true].forEach(function (error) {
            return it(caption + ": " + (error ? 'Error' : 'Ok'), function () {
                var promise = run();
                if (error)
                    promise.catch(function (e) { return expect(function () { throw e; }).toThrowError('Error!'); });
                else
                    promise.then(function (r) { return expect(r).toEqual(expected); });
                mysqlTest.expectOne('query', sql).resolve(error ? 'Error!' : null, result);
            });
        });
    }
});
//# sourceMappingURL=PiMySqlDatabase.spec.js.map