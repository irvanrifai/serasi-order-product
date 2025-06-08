import supertest from "supertest";
import { web } from "../src/application/web.js";
import { createUser, getUser, removeUser } from "./test-util.js";
import bcrypt from "bcrypt"

describe('POST /api/users', () => {
  afterEach(async () => {
    await removeUser();
  })

  it('should can create a new user', async () => {
    const response = await supertest(web)
      .post('/api/users')
      .send({
        name: "Test",
        username: "test",
        password: "testing"
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.name).toBe("Test");
  });

  it('should reject if request invalid', async () => {
    const response = await supertest(web)
      .post('/api/users')
      .send({
        name: "",
        username: "",
        password: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject if username already exists', async () => {
    let response = await supertest(web)
      .post('/api/users')
      .send({
        name: "Test",
        username: "test",
        password: "testing"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.name).toBe("Test");

    response = await supertest(web)
      .post('/api/users')
      .send({
        name: "Test",
        username: "test",
        password: "testing"
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    });
});

describe('POST /api/users/login', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await removeUser();
  });

  it('should can login', async () => {
    const response = await supertest(web)
      .post('/api/users/login')
      .send({
        username: "test",
        password: "testing"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.token).not.toBe("test");
  });

  it('should reject login if request invalid', async () => {
    const response = await supertest(web)
      .post('/api/users/login')
      .send({
        username: "",
        password: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject login if username wrong', async () => {
    const response = await supertest(web)
      .post('/api/users/login')
      .send({
        username: "XXXXX",
        password: "testing"
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject login if password wrong', async () => {
    const response = await supertest(web)
      .post('/api/users/login')
      .send({
        username: "test",
        password: "XXXXX"
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
})

describe('GET /api/users/current', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await removeUser();
  });

  it('should can get current user', async () => {
    const response = await supertest(web)
      .get('/api/users/current')
      .set('Authorization', 'test');

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.name).toBe("Test");
  });

  it('should reject if token invalid', async () => {
    const response = await supertest(web)
      .get('/api/users/current')
      .set('Authorization', 'XXXXX');

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
})

describe('PATCH /api/users/current', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await removeUser();
  });

  it('should can update user', async () => {
    const response = await supertest(web)
      .patch('/api/users/current')
      .set('Authorization', 'test')
      .send({
        name: "Test Update",
        password: "pwdtesting"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.name).toBe("Test Update");

    const user = await getUser();
    expect(await bcrypt.compare("pwdtesting", user.password)).toBe(true);
  });

  it('should can update user name', async () => {
    const response = await supertest(web)
      .patch('/api/users/current')
      .set('Authorization', 'test')
      .send({
        name: "Test Update"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.name).toBe("Test Update");
  });

  it('should can update user password', async () => {
    const response = await supertest(web)
      .patch('/api/users/current')
      .set('Authorization', 'test')
      .send({
        password: "pwdtesting"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("test");
    expect(response.body.data.name).toBe("Test");

    const user = await getUser();
    expect(await bcrypt.compare("pwdtesting", user.password)).toBe(true);
  });

  it('should reject if request invalid', async () => {
    const response = await supertest(web)
      .patch('/api/users/current')
      .set('Authorization', 'test')
      .send({
        name: "",
        password: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

describe('DELETE /api/users/logout', () => {
  beforeEach(async () => {
    await createUser();
  });

  afterEach(async () => {
    await removeUser();
  });

  it('should can logout', async () => {
    const response = await supertest(web)
      .delete('/api/users/logout')
      .set('Authorization', 'test');

    expect(response.status).toBe(200);
    expect(response.body.data).toBe("OK");

    const user = await getUser();
    expect(user.token).toBeNull();
  });

  it('should reject if token invalid', async () => {
    const response = await supertest(web)
      .delete('/api/users/logout')
      .set('Authorization', 'XXXXX');

    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

})