# Contact Api Spec

## Create contact API
- Endpoint : POST /api/contacts
- Headers : 
  - Authorization : "${token}"
- Request Body :
```json
{
  "first_name" : "Irvan",
  "last_name" : "Rifai",
  "email" : "irvan@rifai.id",
  "phone" : 082138109809
}
```
- Response Body Succes :
```json
{
  "data" : {
    "id" : 1, // autoincrement
    "first_name" : "Irvan",
    "last_name" : "Rifai",
    "email" : "irvan@rifai.id",
    "phone" : 082138109809
  }
}
```
- Response Body Error :
```json
{
  "errors" : "Email invalid format"
}
```

## Update contact API
- Endpoint : PUT /api/contacts/:id
- Headers : 
  - Authorization : "${token}"
- Request Body :
```json
{
  "first_name" : "Irvan",
  "last_name" : "Rifai",
  "email" : "irvan@rifai.id",
  "phone" : 082138109809
}
```
- Response Body Succes :
```json
{
  "data" : {
    "id" : 1,
    "first_name" : "Irvan",
    "last_name" : "Rifai",
    "email" : "irvan@rifai.id",
    "phone" : 082138109809
  }
}
```
- Response Body Error :
```json
{
  "errors" : "Email invalid format"
}
```

## Get contact API
- Endpoint : GET /api/contacts/:id
- Headers : 
  - Authorization : "${token}"
- Response Body Succes :
```json
{
  "data" : {
    "id" : 1,
    "first_name" : "Irvan",
    "last_name" : "Rifai",
    "email" : "irvan@rifai.id",
    "phone" : 082138109809
  }
}
```
- Response Body Error :
```json
{
  "errors" : "Contact not found"
}
```

## Search contact API
- Endpoint : GET /api/contacts
- Headers : 
  - Authorization : "${token}"
- Query Param : 
  - name : search by first_name or last_name, using LIKE //optional
  - email : search by email, using LIKE //optional
  - phone : search by phone, using LIKE //optional
  - page : number of page, default 1
  - size : size per page, default 10

- Response Body Succes :
```json
{
  "data" : [
    {
      "id" : 1,
      "first_name" : "Irvan",
      "last_name" : "Rifai",
      "email" : "irvan@rifai.id",
      "phone" : 082138109809
    },
    {
      "id" : 2,
      "first_name" : "Irvan",
      "last_name" : "Rifai",
      "email" : "irvan@rifai.id",
      "phone" : 082138109809
    },
    {
      "id" : 3,
      "first_name" : "Irvan",
      "last_name" : "Rifai",
      "email" : "irvan@rifai.id",
      "phone" : 082138109809
    },
  ],
  "paging" : {
    "page" : 1,
    "total_page" : 2,
    "total_item" : 30
  }
}
```

## Remove contact API
- Endpoint : DELETE /api/contacts/:id
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
  "errors" : "Contact not found"
}
```