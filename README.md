# Success Farms

A three-tier farm stand application for Success Farms Inc., built with React, Java Spring Boot, and PostgreSQL. Add, edit, or remove products in the storefront; changes are saved in PostgreSQL and remain there across restarts.

## Run with Docker Compose

1. Copy `.env.example` to `.env` and set a database password, or use the included local-development defaults.
2. From this directory, run:

   ```sh
   docker compose up --build
   ```

3. Visit [http://localhost:3000](http://localhost:3000). The API is available through [http://localhost:3000/api/products](http://localhost:3000/api/products) (and internally at `http://backend:8080/api/products` on the Compose network). PostgreSQL is exposed on `localhost:5433` for local database tools by default; change `POSTGRES_PORT` in `.env` if needed.

The database starts with a small sample catalog the first time its volume is empty. The database uses the named volume `borderless-volume` and the services share the `borderless-network2` network.

## Product API

| Method | Path | Action |
| --- | --- | --- |
| `GET` | `/api/products` | List products |
| `POST` | `/api/products` | Add a product |
| `PUT` | `/api/products/{id}` | Update a product |
| `DELETE` | `/api/products/{id}` | Remove a product |

Example request body:

```json
{
  "name": "Heirloom tomatoes",
  "category": "Fresh produce",
  "description": "Sun-ripened and picked fresh.",
  "price": 4.99,
  "stock": 32,
  "imageUrl": ""
}
```

In the UI, use **Add a product** to create products and the pencil/trash controls on a product card to update or remove it. To inspect the stored rows from a local PostgreSQL client, connect to `localhost:5433` with database `success_farms` and user `success_farms` (or the values in your `.env` file).

## Local frontend development

With the Compose API and database running, use `npm ci` and `npm run dev` in `frontend/`. Vite forwards `/api` requests to `localhost:8080`.
