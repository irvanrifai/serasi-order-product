import supertest from 'supertest'
import { createContact, createUser, getContact, removeAllAddresses, removeAllContacts, removeUser } from './test-util.js';
import { web } from '../src/application/web.js';

describe('POST /api/contacts/:contactId/addresses', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
  });
  
  afterEach(async () => {
    await removeAllAddresses();
    await removeAllContacts();
    await removeUser();
  });
  
  it('should can create new address', async () => {
    const contact = await getContact();
    const address = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };
  
    const response = await supertest(web)
      .post('/api/contacts/' + contact.id + '/addresses')
      .set('Authorization', 'test')
      .send(address);
  
    expect(response.status).toBe(200);
    expect(response.body.data.street).toBe(address.street);
    expect(response.body.data.city).toBe(address.city);
    expect(response.body.data.province).toBe(address.province);
    expect(response.body.data.country).toBe(address.country);
    expect(response.body.data.postal_code).toBe(address.postal_code);
  });

  it('should can create new address even just country and postal code fullfiled', async () => {
    const contact = await getContact();
    const address = {
      country: 'Indonesia',
      postal_code: '12345',
    };
  
    const response = await supertest(web)
      .post('/api/contacts/' + contact.id + '/addresses')
      .set('Authorization', 'test')
      .send(address);
  
    expect(response.status).toBe(200);
    expect(response.body.data.country).toBe(address.country);
    expect(response.body.data.postal_code).toBe(address.postal_code);
  });

  it('should reject create new address if country and postal code is null', async () => {
    const contact = await getContact();
    const address = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
    };
  
    const response = await supertest(web)
      .post('/api/contacts/' + contact.id + '/addresses')
      .set('Authorization', 'test')
      .send(address);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined;
  });

  it('should reject create new address if request invalid', async () => {
    const contact = await getContact();
    const address = {
      street: '',
      city: '',
      province: '',
      country: '',
      postal_code: '',
    };
  
    const response = await supertest(web)
      .post('/api/contacts/' + contact.id + '/addresses')
      .set('Authorization', 'test')
      .send(address);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined;
  });

  it('should reject create new address if contact not found', async () => {
    const contact = await getContact();
    const address = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };
  
    const response = await supertest(web)
      .post('/api/contacts/' + (contact.id + 1) + '/addresses')
      .set('Authorization', 'test')
      .send(address);
  
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined;
  });

  it('should reject create new address if unauthorized', async () => {
    const contact = await getContact();
    const address = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };
  
    const response = await supertest(web)
      .post('/api/contacts/' + contact.id + '/addresses')
      .send(address);
  
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined;
  });
});