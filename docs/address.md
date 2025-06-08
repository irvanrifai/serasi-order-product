# Address Api Spec

## Create address API
- Endpoint : POST /api/contacts/:contactId/addresses
- Headers : 
  - Authorization : "${token}"
- Request Body :
```json
{
  "street" : "Jalan 123",
  "city" : "Yogyakarta",
  "province" : "D I Yogyakarta",
  "country" : "Indonesia",
  "postal_code" : "78723",
}
```
- Response Body Succes :
```json
{
  "data" : {
    "id" : 1,
    "street" : "Jalan 123",
    "city" : "Yogyakarta",
    "province" : "D I Yogyakarta",
    "country" : "Indonesia",
    "postal_code" : "78723",
  }
}
```
- Response Body Error :
```json
{
  "errors" : "country is required"
}
```

## Update address API
- Endpoint : PUT /api/contacts/:contactId/addresses/:addressId
- Headers : 
  - Authorization : "${token}"
- Request Body :
```json
{
  "street" : "Jalan 123",
  "city" : "Yogyakarta",
  "province" : "D I Yogyakarta",
  "country" : "Indonesia",
  "postal_code" : "78723",
}
```
- Response Body Succes :
```json
{
  "data" : {
    "id" : 1,
    "street" : "Jalan 123",
    "city" : "Yogyakarta",
    "province" : "D I Yogyakarta",
    "country" : "Indonesia",
    "postal_code" : "78723",
  }
}
```
- Response Body Error :
```json
{
  "errors" : "country is required"
}
```

## Get address API
- Endpoint : GET /api/contacts/:contactId/addresses/:addressId
- Headers : 
  - Authorization : "${token}"
- Response Body Succes :
```json
{
  "data" : {
    "id" : 1,
    "street" : "Jalan 123",
    "city" : "Yogyakarta",
    "province" : "D I Yogyakarta",
    "country" : "Indonesia",
    "postal_code" : "78723",
  }
}
```
- Response Body Error :
```json
{
  "errors" : "Address is not found"
}
```

## List address API
- Endpoint : GET /api/contacts/:contactId/addresses
- Headers : 
  - Authorization : "${token}"
- Response Body Succes :
```json
{
  "data" : [
    {
      "id" : 1,
      "street" : "Jalan 123",
      "city" : "Yogyakarta",
      "province" : "D I Yogyakarta",
      "country" : "Indonesia",
      "postal_code" : "78723",
    },
    {
      "id" : 2,
      "street" : "Jalan 123",
      "city" : "Yogyakarta",
      "province" : "D I Yogyakarta",
      "country" : "Indonesia",
      "postal_code" : "78723",
    },
  ]
}
```
- Response Body Error :
```json
{
  "errors" : "contact is not found"
}
```

## Remove address API
- Endpoint : DELETE /api/contacts/:contactId/addresses/:addressId
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
  "errors" : "address is not found"
}
```