# User API Spec

## Register user
- Endpoint: POST /api/users/register
- Request Body:
```json
{
  "username": "irvan",
  "email": "irvan@example.com",
  "password": "rifai$$",
  "name": "Irvan Rifai"
}
```
- Response Body Success:
```json
{
  "data": {
    "username": "irvan",
    "email": "irvan@example.com",
    "name": "Irvan Rifai"
  }
}
```
- Response Body Error:
```json
{
  "errors": "Username or email already exists"
}
```

## Login user
- Endpoint: POST /api/users/login
- Request Body:
```json
{
  "username_or_email": "irvan",
  "password": "rifai$$"
}
```
- Response Body Success:
```json
{
  "data": {
    "token": "eyJhbGciOi..."
  }
}
```
- Response Body Error:
```json
{
  "errors": "Wrong credentials"
}
```

## Get current user
- Endpoint: GET /api/users/current
- Headers:
  - Authorization: "Bearer ${token}"
- Response Body Success:
```json
{
  "data": {
    "username": "irvan",
    "email": "irvan@example.com",
    "name": "Irvan Rifai"
  }
}
```
- Response Body Error:
```json
{
  "errors": "Unauthorized"
}
```

## Update current user
- Endpoint: PATCH /api/users/current
- Headers:
  - Authorization: "Bearer ${token}"
- Request Body:
```json
{
  "name": "Irvan Rifai",
  "email": "irvan.updated@example.com",
  "password": "newpassword",
  "phone": "081234567890"
}
```
- Response Body Success:
```json
{
  "data": {
    "username": "irvan",
    "name": "Irvan Rifai",
    "email": "irvan.updated@example.com",
    "phone": "081234567890"
  }
}
```
- Response Body Error:
```json
{
  "errors": "Email already exists"
}
```
