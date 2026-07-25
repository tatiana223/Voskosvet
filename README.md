# Candle Shop Backend

Backend for a candle ordering web application.

## Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Spring Security
- MapStruct
- Flyway
- H2 for local development
- PostgreSQL for production
- Maven

## Local Run

Build the project:

```bash
mvn clean package -DskipTests
```

Run the application:

```bash
java -jar target/candles-1.0-SNAPSHOT.jar
```

The application starts on:

```text
http://localhost:8080
```

The active local profile is:

```properties
spring.profiles.active=dev
```

## Swagger

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

## H2 Console

H2 console:

```text
http://localhost:8080/h2-console
```

Connection settings:

```text
JDBC URL: jdbc:h2:mem:candle_shop
User Name: sa
Password: empty
```

## Dev Admin Access

Admin endpoints use Basic Auth.

```text
Username: admin
Password: admin
```

## Public API

Candles:

```http
GET /api/candles
GET /api/candles/{id}
GET /api/candles/slug/{slug}
```

Categories:

```http
GET /api/categories
```

Orders:

```http
POST /api/orders
```

## Admin API

Admin candle management:

```http
POST /api/admin/candles
PUT /api/admin/candles/{id}
DELETE /api/admin/candles/{id}
```

Admin category management:

```http
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

Admin order management:

```http
GET /api/admin/orders
GET /api/admin/orders/{id}
PATCH /api/admin/orders/{id}/status
```

## Useful Query Parameters

Catalog:

```http
GET /api/candles?page=0&size=12
GET /api/candles?categoryId=1
GET /api/candles?featured=true
GET /api/candles?scent=vanilla
GET /api/candles?minPrice=500&maxPrice=1500
GET /api/candles?sort=price,asc
GET /api/candles?sort=createdAt,desc
```

Admin orders:

```http
GET /api/admin/orders?page=0&size=20
GET /api/admin/orders?status=NEW
GET /api/admin/orders?search=phone-or-name
```

## Production Environment Variables

For the `prod` profile:

```text
DB_URL=jdbc:postgresql://localhost:5432/candle_shop
DB_USERNAME=candle_user
DB_PASSWORD=change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
```

Production run example:

```bash
java -jar target/candles-1.0-SNAPSHOT.jar --spring.profiles.active=prod
```

## Notes

- Flyway migrations are stored in `src/main/resources/db/migration`.
- `DataInitializer` works only in the `dev` profile.
- Public catalog endpoints are open.
- Admin endpoints are protected by Basic Auth.
