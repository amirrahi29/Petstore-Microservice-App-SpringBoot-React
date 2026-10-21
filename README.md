# PetStore

A small shop for trying Azure later. Pets are the products: each one has a price and an image. The cart stays in the browser. Login is issued by the order service, and the product service trusts the same JWT.

## Services

| Service | Port | Database | Responsibility |
| --- | --- | --- | --- |
| product-service | 8081 | petstore | Pets for sale, image upload |
| order-service | 8083 | petstore | Register, login, checkout, orders |
| petstore-ui | 3000 | — | React app |

Swagger:

- http://localhost:8081/swagger-ui.html
- http://localhost:8083/swagger-ui.html

## Accounts

| Account | Password | Role |
| --- | --- | --- |
| demo | demo123 | USER |
| admin | admin123 | ADMIN |

Each service reads the database username and password from Azure Key Vault `db-credentials-petstore` at startup. The product service also reads the blob connection string and account key from that vault.

## What each role can do

A user can register, sign in, browse pets, open one, add it to the cart, remove it, check out, and see their own orders.

An admin can do that too, and can add, update, and delete pets, upload a photo with the pet, and see every order.

## Image storage

Pet photos are saved in the Azure Blob container `pet-container`. The product service loads the storage connection string and account key from Key Vault. The container is created if it does not exist. The database stores the blob URL, and the API gives the UI a temporary read link so the image can be shown. Deleting a pet also deletes its image from that container.

## Run locally

Use Java 17, Maven, Node 20, and PostgreSQL.

```sql
CREATE DATABASE petstore OWNER petstore;
```

```bash
cd /Users/amir/Desktop/Petstore/product-service
java -jar target/product-service-0.1.0.jar --spring.config.additional-location=file:./src/main/resources/application.yml

cd /Users/amir/Desktop/Petstore/pet-service
java -jar target/pet-service-0.1.0.jar --spring.config.additional-location=file:./src/main/resources/application.yml

cd /Users/amir/Desktop/Petstore/order-service
java -jar target/order-service-0.1.0.jar --spring.config.additional-location=file:./src/main/resources/application.yml
```

The UI calls `http://localhost:8081` and `8083`. Override those with `VITE_PRODUCT_API` and `VITE_ORDER_API` if needed.      

On startup each service checks PostgreSQL and creates any missing tables (`ddl-auto: update`). The order service also makes sure the admin account exists, even when the other tables are already there.