import supertest from 'supertest'
import { createAddress, createContact, createUser, getAddress, getContact, removeAllAddresses, removeAllContacts, removeUser } from './test-util.js';
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

describe('GET /api/contacts/:contactId/addresses/:addressId', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
    await createAddress();
  });
  
  afterEach(async () => {
    await removeAllAddresses();
    await removeAllContacts();
    await removeUser();
  });

  it('should can get address', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const response = await supertest(web)
      .get('/api/contacts/' + contact.id + '/addresses/' + address.id)
      .set('Authorization', 'test');

    expect(response.status).toBe(200);
    expect(response.body.data.street).toBe(address.street);
    expect(response.body.data.city).toBe(address.city);
    expect(response.body.data.province).toBe(address.province);
    expect(response.body.data.country).toBe(address.country);
    expect(response.body.data.postal_code).toBe(address.postal_code);
  });

  it('should reject get address if address not found', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const response = await supertest(web)
      .get('/api/contacts/' + contact.id + '/addresses/' + (address.id + 1))
      .set('Authorization', 'test');

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined;
  });

  it('should reject get address if contact not found', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const response = await supertest(web)
      .get('/api/contacts/' + (contact.id + 1) + '/addresses/' + address.id)
      .set('Authorization', 'test');

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined;
  });

  it('should reject get address if unauthorized', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const response = await supertest(web)
      .get('/api/contacts/' + contact.id + '/addresses/' + address.id);

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined;
  });
});

describe('PUT /api/contacts/:contactId/addresses/:addressId', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
    await createAddress();
  });
  
  afterEach(async () => {
    await removeAllAddresses();
    await removeAllContacts();
    await removeUser();
  });

  it('should can update address', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const addressData = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };

    const response = await supertest(web)
      .put('/api/contacts/' + contact.id + '/addresses/' + address.id)
      .set('Authorization', 'test')
      .send(addressData);

    expect(response.status).toBe(200);
    expect(response.body.data.street).toBe(addressData.street);
    expect(response.body.data.city).toBe(addressData.city);
    expect(response.body.data.province).toBe(addressData.province);
    expect(response.body.data.country).toBe(addressData.country);
    expect(response.body.data.postal_code).toBe(addressData.postal_code);
  });
  
  it('should can update address even only country and postal code fulfilled', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const addressData = {
      country: 'Indonesia',
      postal_code: '12345',
    };

    const response = await supertest(web)
      .put('/api/contacts/' + contact.id + '/addresses/' + address.id)
      .set('Authorization', 'test')
      .send(addressData);

    expect(response.status).toBe(200);
    expect(response.body.data.country).toBe(addressData.country);
    expect(response.body.data.postal_code).toBe(addressData.postal_code);
  });
  
  it('should reject update address if request is invalid', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const addressData = {
      street: '',
      city: '',
      province: '',
      country: '',
      postal_code: '',
    };

    const response = await supertest(web)
      .put('/api/contacts/' + contact.id + '/addresses/' + address.id)
      .set('Authorization', 'test')
      .send(addressData);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
  
  it('should reject update address if address not found', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const addressData = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };

    const response = await supertest(web)
      .put('/api/contacts/' + contact.id + '/addresses/' + (address.id + 1))
      .set('Authorization', 'test')
      .send(addressData);

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject update address if contact not found', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const addressData = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };

    const response = await supertest(web)
      .put('/api/contacts/' + (contact.id + 1) + '/addresses/' + address.id)
      .set('Authorization', 'test')
      .send(addressData);

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject update address if unauthorized', async () => {
    const contact = await getContact();
    const address = await getAddress();

    const addressData = {
      street: 'Jalan Sudirman',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'Indonesia',
      postal_code: '12345',
    };

    const response = await supertest(web)
      .put('/api/contacts/' + contact.id + '/addresses/' + address.id)
      .send(addressData);

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});

describe('DELETE /api/contacts/:contactId/addresses/:addressId', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
    await createAddress();
  });

  afterEach(async () => {
    await removeAllAddresses();
    await removeAllContacts();
    await removeUser();
  });

  it('should can delete address', async () => {
    const contact = await getContact();
    let address = await getAddress();

    const response = await supertest(web)
      .delete('/api/contacts/' + contact.id + '/addresses/' + address.id)
      .set('Authorization', 'test');

    expect(response.status).toBe(200);
    expect(response.body.data).toBe('OK');

    address = await getAddress();
    expect(address).toBeNull();
  });

  it('should reject delete address if address not found', async () => {
    const contact = await getContact();
    let address = await getAddress();

    const response = await supertest(web)
      .delete('/api/contacts/' + contact.id + '/addresses/' + (address.id + 1))
      .set('Authorization', 'test');

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject delete address if contact not found', async () => {
    const contact = await getContact();
    let address = await getAddress();

    const response = await supertest(web)
      .delete('/api/contacts/' + (contact.id + 1) + '/addresses/' + address.id)
      .set('Authorization', 'test');

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject delete address if unauthorized', async () => {
    const contact = await getContact();
    let address = await getAddress();

    const response = await supertest(web)
      .delete('/api/contacts/' + contact.id + '/addresses/' + address.id);

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});

describe('GET /api/contacts/:contactId/addresses', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
    await createAddress();
  });

  afterEach(async () => {
    await removeAllAddresses();
    await removeAllContacts();
    await removeUser();
  });

  it('should can get list of addresses', async () => {
    const contact = await getContact();

    const response = await supertest(web)
      .get('/api/contacts/' + contact.id + '/addresses')
      .set('Authorization', 'test');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
  });

  it('should reject get list of addresses if contact not found', async () => {
    const contact = await getContact();

    const response = await supertest(web)
      .get('/api/contacts/' + (contact.id + 1) + '/addresses')
      .set('Authorization', 'test');

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject get list of addresses if unauthorized', async () => {
    const contact = await getContact();

    const response = await supertest(web)
      .get('/api/contacts/' + contact.id + '/addresses');

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
})