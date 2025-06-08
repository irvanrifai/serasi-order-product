# User Api Spec

## Register user API
- Endpoint : POST /api/users
- Request Body : 
```json
{
  "username" : "irvan",
  "password" : "rifai$$",
  "name" : "Irvan Rifai"
}
```
- Response Body Succes :
```json
{
  "data" : {
    "username" : "irvan",
    "name" : "Irvan Rifai"
  }
}
```
- Response Body Error :
```json
{
  "errors" : "Username already registered"
}
```

## Login user API
- Endpoint : POST /api/users/login
- Request Body : 
```json
{
  "username" : "irvan",
  "password" : "rifai$$",
}
```
- Response Body Succes :
```json
{
  "data" : {
    "token" : "blablabalball2390r32"
  }
}
```
- Response Body Error :
```json
{
  "errors" : "username or password wrong"
}
```

## Update user API
- Endpoint : PATCH /api/users/current
- Headers : 
  - Authorization : "${token}"
- Request Body : 
```json
{
  "name" : "Irvan Rif", //optional
  "password" : "rifai" //optional
}
```
- Response Body Succes :
```json
{
  "data" : {
    "name" : "Irvan Rif",
    "password" : "rifai"
  }
}
```
- Response Body Error :
```json
{
  "errors" : "name length max 100 character"
}
```

## Get user API
- Endpoint : GET /api/users/current
- Headers : 
  - Authorization : "${token}"
- Response Body Succes :
```json
{
  "data" : {
    "name" : "Irvan Rif",
    "password" : "rifai"
  }
}
```
- Response Body Error :
```json
{
  "errors" : "Unauthorized"
}
```

## Logout user API
- Endpoint : DELETE /api/users/logout
- Headers : 
  - Authorization : "${token}"
- Response Body Succes :
```json
{
  "data" : "OK"
}
```
- Response Body Error :
```json
{
  "errors" : "Unauthorized"
}
```