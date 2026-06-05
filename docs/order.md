# Order API Spec

## Create order
- Endpoint: POST /api/orders
- Headers:
  - Authorization: "Bearer ${token}"
  - x-idempotency-key: "e3c9b7f1-7234-4bca-bc08-62d7c5ba84f9"
- Required role: CUSTOMER
- Request Body:
```json
{
  "payment_method": "QRIS",
  "items": [
    {
      "product_id": 4,
      "quantity": 3
    }
  ]
}
```
- Response Body Success:
```json
{
  "data": {
    "id": 1,
    "user_id": 10,
    "payment_method": "QRIS",
    "total_price": 45000,
    "admin_fee": 0,
    "shipping_fee": 0,
    "status": "PENDING",
    "idempotency_key": "e3c9b7f1-7234-4bca-bc08-62d7c5ba84f9",
    "created_at": "2026-06-05T06:00:00.000Z",
    "updated_at": "2026-06-05T06:00:00.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 4,
        "quantity": 3,
        "price": 15000,
        "product": {
          "id": 4,
          "sku": "PRODUCTS-123456789",
          "name": "Produk Bingkisan"
        }
      }
    ]
  }
}
```
- Response Body When the same `x-idempotency-key` is reused:
```json
{
  "data": {
    "id": 1,
    "user_id": 10,
    "payment_method": "QRIS",
    "total_price": 45000,
    "admin_fee": 0,
    "shipping_fee": 0,
    "status": "PENDING",
    "idempotency_key": "e3c9b7f1-7234-4bca-bc08-62d7c5ba84f9",
    "created_at": "2026-06-05T06:00:00.000Z",
    "updated_at": "2026-06-05T06:00:00.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 4,
        "quantity": 3,
        "price": 15000,
        "product": {
          "id": 4,
          "sku": "PRODUCTS-123456789",
          "name": "Produk Bingkisan"
        }
      }
    ]
  }
}
```
```json
{
  "errors": "Stok produk Produk A tidak mencukupi atau tidak ditemukan"
}
```

## Order history
- Endpoint: GET /api/orders
- Headers:
  - Authorization: "Bearer ${token}"
- Required role: CUSTOMER
- Query Params:
  - `page` (optional, default 1)
  - `size` (optional, default 10)
- Response Body Success:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 10,
      "payment_method": "QRIS",
      "total_price": 90000,
      "admin_fee": 0,
      "shipping_fee": 0,
      "status": "PENDING",
      "idempotency_key": "e3c9b7f1-...",
      "created_at": "2026-06-05T00:00:00.000Z",
      "updated_at": "2026-06-05T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 4,
          "quantity": 3,
          "price": 30000,
          "product": {
            "id": 4,
            "sku": "PRODUCTS-001",
            "name": "Produk A"
          }
        }
      ]
    }
  ],
  "paging": {
    "page": 1,
    "total_item": 1,
    "total_page": 1
  }
}
```

## Order detail
- Endpoint: GET /api/orders/:orderId
- Headers:
  - Authorization: "Bearer ${token}"
- Required role: CUSTOMER
- Response Body Success:
```json
{
  "data": {
    "id": 1,
    "user_id": 10,
    "payment_method": "QRIS",
    "total_price": 90000,
    "admin_fee": 0,
    "shipping_fee": 0,
    "status": "PENDING",
    "idempotency_key": "e3c9b7f1-...",
    "created_at": "2026-06-05T00:00:00.000Z",
    "updated_at": "2026-06-05T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 4,
        "quantity": 3,
        "price": 30000,
        "product": {
          "id": 4,
          "sku": "PRODUCTS-001",
          "name": "Produk A"
        }
      }
    ]
  }
}
```
- Response Body Error:
```json
{
  "errors": "order is not found"
}
```
