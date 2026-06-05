# Product API Spec

## Search products
- Endpoint: GET /api/products
- Query Params:
  - `name` (optional) - filter products by name substring
  - `page` (optional, default 1)
  - `size` (optional, default 10)
- Response Body Success:
```json
{
  "data": [
    {
      "id": 1,
      "sku": "PRODUCTS-123456789",
      "name": "Produk Bingkisan",
      "description": null,
      "price": 15000,
      "stock": 100
    }
  ],
  "paging": {
    "page": 1,
    "total_item": 1,
    "total_page": 1
  }
}
```

## Get product detail
- Endpoint: GET /api/products/:productId
- Response Body Success:
```json
{
  "data": {
    "id": 1,
    "sku": "PRODUCTS-123456789",
    "name": "Produk Bingkisan",
    "description": null,
    "price": 15000,
    "stock": 100
  }
}
```
- Response Body Error:
```json
{
  "errors": "product is not found"
}
```

## Create product
- Endpoint: POST /api/products
- Headers:
  - Authorization: "Bearer ${token}"
- Required role: MERCHANT
- Request Body:
```json
{
  "sku": "PRODUCTS-123456789",
  "name": "Produk Bingkisan",
  "description": "Optional description",
  "price": 15000,
  "stock": 100
}
```
- Response Body Success:
```json
{
  "data": {
    "id": 1,
    "sku": "PRODUCTS-123456789",
    "name": "Produk Bingkisan",
    "description": "Optional description",
    "price": 15000,
    "stock": 100
  }
}
```

## Update product
- Endpoint: PUT /api/products/:productId
- Headers:
  - Authorization: "Bearer ${token}"
- Required role: MERCHANT
- Request Body:
```json
{
  "sku": "PRODUCTS-123456789",
  "name": "Produk Bingkisan Baru",
  "description": "Updated description",
  "price": 17000,
  "stock": 120
}
```
- Response Body Success:
```json
{
  "data": {
    "id": 1,
    "sku": "PRODUCTS-123456789",
    "name": "Produk Bingkisan Baru",
    "description": "Updated description",
    "price": 17000,
    "stock": 120
  }
}
```

## Delete product
- Endpoint: DELETE /api/products/:productId
- Headers:
  - Authorization: "Bearer ${token}"
- Required role: MERCHANT
- Response Body Success:
```json
{
  "data": "OK"
}
```
- Response Body Error:
```json
{
  "errors": "product is not found"
}
```
