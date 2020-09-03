import { PiTypeDescriptor, PiFieldDescriptor, PiField, PiJstype, PiDescriptor } from "@pomgui/rest-lib";
import { PiGET, PiPOST, PiPUT, PiPATCH, PiDELETE, PiService } from '../../lib/service/PiService';
import * as express from 'express';
import * as request from 'supertest';
import { PiNoopDatabase } from '@pomgui/database';

class PiFakeDb extends PiNoopDatabase {
    close() { return Promise.reject('error on close database') };
}

type integer = number;
type Status = 'active' | 'inactive';

interface Person {
    name: string;
    single: boolean;
    status: Status[];
}

const person$: PiDescriptor =
    new PiTypeDescriptor([
        new PiFieldDescriptor(F('name', 'string', true)),
        new PiFieldDescriptor(F('single', 'boolean', false)),
        new PiFieldDescriptor(F('status', 'enum', false, true, ['active', 'inactive']))
    ]).render();

class TestApi1 {
    @PiGET('/persons', { descriptor: person$ })
    async getPersons(params: Person): Promise<Person> {
        return params;
    }
    @PiPOST('/persons', { descriptor: person$ })
    async newPerson(params: Person): Promise<Person> {
        return params;
    }
    @PiPUT('/persons') // without descriptor
    async replacePerson(params: Person): Promise<Person> {
        return params;
    }
};
class TestApi2 {
    @PiPATCH('/persons', { descriptor: person$, database: false })
    async updatePerson(params: Person): Promise<Person> {
        throw new Error('Unspecific error'); // It should be a 500 error
    }
    @PiDELETE('/persons', { descriptor: person$ })
    async deletePerson(params: Person): Promise<Person> {
        throw ['array-item1', 'item2'];
    }
}


var app = express();
app.use(express.json());
app.use('/nodb', PiService({ services: [TestApi1], dbFactoryFn: () => null }));
app.use('/fakedb', PiService({ services: [TestApi2], dbFactoryFn: () => new PiFakeDb() }));
var st = request(app);

describe('PiService Without database ', () => {

    it('Test GET with descriptors and converting data', () => {
        st.get('/nodb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
                expect(res.body).toEqual({ name: 'John', single: false, status: ['active'] });
            })
    })

    it('Test POST with descriptors and missing required field', () => {
        st.post('/nodb/persons').query({ single: 'false' }).send({ 'status': ['active', 'inactive'] })
            .end((err, res) => {
                expect(res.status).toEqual(400);
                expect(res.body.message).toMatch(/Fields \[name\] are required, but not found/);
            })
    })

    it('Test POST with descriptors and all fields', () => {
        st.post('/nodb/persons').query({ name: 'Mary', single: 'false' }).send({ 'status': 'inactive' })
            .end((err, res) => {
                expect(res.body).toEqual({ name: 'Mary', single: false, status: ['inactive'] });
            })
    })

    it('Test PUT that copies all the headers', () => {
        st.put('/nodb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
                expect(res.body.name).toEqual('John')
                expect(res.body.single).toEqual('false')
                expect(res.body.status).toEqual('active')
                // And... body has more fields (other headers)
                expect(Object.keys(res.body).find(k => !['name', 'single', 'status'].includes(k))).toBeTruthy();
            })
    })
});

describe('PiService With fake database ', () => {

    it('Test PATCH that throws an unexpected exception', () => {
        st.patch('/fakedb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
                expect(res.status).toEqual(500);
                expect(res.body.message).toMatch(/Unspecific error/);
            })
    })


    it('Test DELETE throws array of strings', () => {
        st.delete('/fakedb/persons').query({ name: 'John', single: 'false' }).set('status', 'active')
            .end((err, res) => {
                expect(res.status).toEqual(500);
                expect(res.body).toEqual(['array-item1', 'item2']);
            })
    })
})

function F(name: string, jsType: PiJstype, required: boolean, isArray?: boolean, values?: string[]): PiField {
    return { name, jsType, required, isArray, values };
}