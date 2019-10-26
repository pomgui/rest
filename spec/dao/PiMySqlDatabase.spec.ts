import { PiMysqlMock, PiActionType } from '../PiMysqlMock';
import { PiDatabase } from '../../lib/dao/PiDatabase';
import { PiMySqlDatabase } from '../../lib/dao/PiMySqlDatabase';

var
    mysqlTest: PiMysqlMock,
    db: PiDatabase;

console.debug = console.warn = () => { }

describe('MySQL Database', () => {
    beforeEach(async () => {
        mysqlTest = new PiMysqlMock();
        mysqlTest.begin();
        db = new PiMySqlDatabase('mysql://pomgui.com/testdb'); // any connection string will do. It's a mocked db.
    })
    afterEach(() => {
        mysqlTest.end();
    })

    test('beginTransaction', () => db.beginTransaction());
    test('commit', () => db.commit());
    test('rollback', () => db.rollback());
    test('end', () => db.close());

    const
        rawRecords = [
            { PERSON_ID: 1, NAME: 'John', BIRTH_DATE: new Date('2019-01-01') },
            { PERSON_ID: 2, NAME: 'Mary', BIRTH_DATE: new Date('2019-01-02') }
        ],
        resRecords = [
            { personId: 1, name: 'John', birthDate: new Date('2019-01-01') },
            { personId: 2, name: 'Mary', birthDate: new Date('2019-01-02') }
        ];

    describe('Queries many records', () => {
        testQuery('query without params',
            () => db.query('select * from persons', []),
            /select.*from persons/, rawRecords, resRecords
        );
        testQuery('query with defined params',
            () => db.query('select * from persons where person_id >= :personId', { personId: 12 }),
            /select.*from persons/, rawRecords, resRecords
        );
        testQuery('query with dotted params',
            () => db.query('select * from persons where person_id >= :person.id', { person: { id: 12 } }),
            /select.*from persons/, rawRecords, resRecords
        );
        testQuery('query with undefined params',
            () => db.query('select * from persons where person_id >= :personId', { id: 12 }),
            /select.*from persons/, rawRecords, resRecords
        );
        testQuery('CALL procedure()',
            () => db.query('CALL procedure(:id)', { id: 12 }),
            /call procedure/i, [rawRecords, { affectedRows: 1 }], resRecords
        );
        testQuery('query excluding columns',
            () => db.query('select * from persons where person_id >= :personId', { personId: 12 },
                { ignore: ['name', 'birth_date'] }),
            /select.*from persons/, rawRecords, resRecords.map(r => ({ personId: r.personId }))
        );
        testQuery('query mapping columns',
            () => db.query('select * from persons where person_id >= :personId', { personId: 12 },
                { map: { name: 'personName' } }),
            /select.*from persons/, rawRecords,
            resRecords.map(r => ({ personId: r.personId, personName: r.name, birthDate: r.birthDate }))
        );
    });

    describe('Query single records', () => {
        it('query 1 reg', () => {
            db.querySingle('select * from persons where person_id = :id', { id: 12 })
                .then(r => expect(r).toEqual(resRecords[0]));
            mysqlTest.expectOne('query', /select/).resolve(null, [rawRecords[0]]);
        });
        it(`Query 0 records`, () => {
            db.querySingle('select * from persons where person_id = :id', { id: 12 })
                .catch(e => expect(() => { throw e }).toThrowError(/Not found/));
            mysqlTest.expectOne('query', /select/).resolve(null, []);
        });
        it(`Query too many rows`, () => {
            db.querySingle('select * from persons where person_id = :id', { id: 12 })
                .catch(e => expect(() => { throw e }).toThrowError(/Too many rows/));
            mysqlTest.expectOne('query', /select/).resolve(null, rawRecords);
        });
    });

    describe('Insert/Update', () => {
        testQuery('Inserting 1 record',
            () => db.insert('insert into persons(name) values(:name)', { name: 'Wil' }),
            /insert/, { affectedRows: 1, insertId: 1000 }, 1000
        );
        testQuery('Inserting 5 records',
            () => db.insert('insert into persons(name) values(:name),...', { name: 'Wil' }),
            '', { affectedRows: 5, insertId: 1000 }, [1000, 1001, 1002, 1003, 1004]
        )
        testQuery('Updating',
            () => db.update('update persons set name = :name,...', { name: 'Wil' }),
            'update', { affectedRows: 5 }, 5
        )
    })

    function test(type: PiActionType, run: { (): Promise<any> }) {
        [false, true].forEach(error =>
            it(`${type}: ${error ? 'Error' : 'Ok'}`, () => {
                let promise = expectAsync(run());
                if (error) promise.toBeRejected();
                else promise.toBeResolved();
                mysqlTest.expectOne(type).resolve(error ? 'Error' : null);
            }))
    }
    function testQuery(caption: string, run: { (): Promise<any> }, sql: string | RegExp, result: any, expected: any) {
        [false, true].forEach(error =>
            it(`${caption}: ${error ? 'Error' : 'Ok'}`, () => {
                let promise = run();
                if (error) promise.catch(e => expect(() => { throw e }).toThrowError('Error!'));
                else promise.then(r => expect(r).toEqual(expected));
                mysqlTest.expectOne('query', sql).resolve(error ? 'Error!' : null, result);
            }))
    }


})
