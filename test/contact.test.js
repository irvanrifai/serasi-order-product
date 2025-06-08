import supertest from "supertest";
import { createUser, removeAllContacts, removeUser } from "./test-util.js";
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

  it('should reject if request invalid', async () => {
    const response = await supertest(web)
      .post('/api/contacts')
      .set('Authorization', 'test')
      .send({
        first_name: '',
        last_name: '',
        email: 'not-an-email',
        phone: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});