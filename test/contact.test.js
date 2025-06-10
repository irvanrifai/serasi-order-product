import supertest from "supertest";
import { createContact, createManyContacts, createUser, getContact, removeAllContacts, removeUser } from "./test-util.js";
import { web } from "../src/application/web.js";

describe('POST /api/contacts', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUser();
  });
  it('should create contact', async () => {
    const response = await supertest(web)
      .post('/api/contacts')
      .set('Authorization', 'test')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.first_name).toBe('John');
    expect(response.body.data.last_name).toBe('Doe');
    expect(response.body.data.email).toBe('john.doe@example.com');
    expect(response.body.data.phone).toBe('1234567890');
  });

  it('should create contact even only fill first name', async () => {
    const response = await supertest(web)
      .post('/api/contacts')
      .set('Authorization', 'test')
      .send({
        first_name: 'John',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('John');
    });

  it('should reject if first name not filled', async () => {
    const response = await supertest(web)
      .post('/api/contacts')
      .set('Authorization', 'test')
      .send({
        first_name: '',
        last_name: 'Doe',
        email: 'not-an-email',
        phone: '08123456789',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject if unauthorized', async () => {
    const response = await supertest(web)
      .post('/api/contacts')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});

describe('GET /api/contacts/:contactId', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUser();
  });

  it('should get contact', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .get('/api/contacts/' + contact.id)
      .set('Authorization', 'test');
    
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.first_name).toBe('first');
    expect(response.body.data.last_name).toBe('last');
    expect(response.body.data.email).toBe('mail@mail.id');
    expect(response.body.data.phone).toBe('08123456789');
  });

  it('should reject if contact not found', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .get('/api/contacts/' + (contact.id + 1))
      .set('Authorization', 'test');

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject if unauthorized', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .get('/api/contacts/' + contact.id);

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});

describe('PUT /api/contacts/:contactId', () => {
  beforeEach(async () => {
    await createUser();
    await createContact();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUser();
  });

  it('should update contact', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .put('/api/contacts/' + contact.id)
      .set('Authorization', 'test')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(contact.id);
    expect(response.body.data.first_name).toBe('John');
    expect(response.body.data.last_name).toBe('Doe');
    expect(response.body.data.email).toBe('john.doe@example.com');
    expect(response.body.data.phone).toBe('1234567890');
  });

  it('should reject update contact if first name not filled', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .put('/api/contacts/' + contact.id)
      .set('Authorization', 'test')
      .send({
        first_name: '',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject update contact even only fill first name', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .put('/api/contacts/' + contact.id)
      .set('Authorization', 'test')
      .send({
        first_name: 'John'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(contact.id);
    expect(response.body.data.first_name).toBe('John');
  });

  it('should reject if contact not found', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .put('/api/contacts/' + (contact.id + 1))
      .set('Authorization', 'test')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject if unauthorized', async () => {
    const contact = await getContact();
    const response = await supertest(web)
      .put('/api/contacts/' + contact.id)
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});

describe('GET /api/contacts', () => {
  beforeEach(async () => {
    await createUser();
    await createManyContacts();
  });

  afterEach(async () => {
    await removeAllContacts();
    await removeUser();
  });

  it('should can search without param', async () => {
    const response = await supertest(web)
      .get('/api/contacts')
      .set('Authorization', 'test');
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(10);
    expect(response.body.paging.page).toBe(1);
    expect(response.body.paging.total_page).toBe(2);
    expect(response.body.paging.total_item).toBe(15);
  });

  it('should can search to page 2', async () => {
    const response = await supertest(web)
      .get('/api/contacts')
      .set('Authorization', 'test')
      .query({
        page: 2
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(5);
    expect(response.body.paging.page).toBe(2);
    expect(response.body.paging.total_page).toBe(2);
    expect(response.body.paging.total_item).toBe(15);
  });

  it('should can search using name', async () => {
    const response = await supertest(web)
      .get('/api/contacts')
      .set('Authorization', 'test')
      .query({
        name: 'first 1'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(6);
    expect(response.body.paging.page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.total_item).toBe(6);
  });

  it('should can search using email', async () => {
    const response = await supertest(web)
      .get('/api/contacts')
      .set('Authorization', 'test')
      .query({
        email: 'mail1'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(6);
    expect(response.body.paging.page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.total_item).toBe(6);
  });

  it('should can search using phone', async () => {
    const response = await supertest(web)
      .get('/api/contacts')
      .set('Authorization', 'test')
      .query({
        phone: '6781'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(6);
    expect(response.body.paging.page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.total_item).toBe(6);
  });

  it('should reject if unauthorized', async () => {
    const response = await supertest(web)
      .get('/api/contacts');

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});