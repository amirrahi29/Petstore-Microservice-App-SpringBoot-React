# PetStore

A shop where every pet is a product for sale. Visitors browse without signing in. Checkout, order history, and administration need a login. The cart stays in the browser. Login is issued by the order service, and the product service trusts the same JWT.

The four applications are deployed on Azure App Service. Each app pulls its image from Azure Container Registry. Traffic Manager health-checks those apps and answers DNS for a healthy endpoint.

## Services

| Service | Port | Responsibility |
| --- | --- | --- |
| product-service | 8081 | Pets for sale, categories, image upload |
| order-service | 8083 | Register, login, checkout, orders |
| pet-service | 8082 | Pet API on the same database. The shop UI sells through the product service |
| petstore-ui | 3000 locally, 80 on App Service | React storefront and the admin UI |

Public health on the three Java services, with no login: `GET /`, `GET /health`, and `GET /api/health`. Each returns `{"service":"...","status":"UP"}`.

Swagger:

- http://localhost:8081/swagger-ui/index.html
- http://localhost:8082/swagger-ui/index.html
- http://localhost:8083/swagger-ui/index.html

## Accounts

| Account | Password | Role |
| --- | --- | --- |
| demo | demo123 | USER |
| admin | admin123 | ADMIN |

Shop and admin sessions are separate. A customer login does not sign the administrator out. Admin screens are only at `/admin`.

A customer can register, sign in, browse, add to the cart, check out, and see their own orders. An admin can add, update, and delete pets (a photo is required), manage categories, and see or delete every order.

## Azure

Resource group `Petstore-Resource-Group`, subscription Petstore subscription.

| Piece | Name | Role |
| --- | --- | --- |
| PostgreSQL | `petstore-server-name`, database `petstore` | Shared database. Hibernate uses `ddl-auto: update` and creates missing tables. Tables are not dropped |
| Blob Storage | account `petstore`, container `pet-container` | Pet photos. The API returns a 60-minute read link. Deleting a pet deletes its blob |
| Key Vault | `db-credentials-petstore` | Secrets `username`, `password`, `connection-string`, and `account-key`. No database password or storage key is stored in the YAML |
| Container Registry | `petstoreazurecontainerregistry.azurecr.io` | Images `product-service-image`, `order-service-image`, `pet-service-image`, `petstore-ui-image` |
| App Service plan | `ASP-PetstoreResourceGroup-9881`, Basic B3, Central India | One plan for the four Linux web apps |
| Traffic Manager | four Priority profiles | One External endpoint each. Monitor status Online means that deployed app answered the HTTPS probe |

A push to `main` runs the four workflows in `.github/workflows`. Each workflow builds an image and pushes it to the registry. The web apps pull those images. Continuous deployment is turned on for the product container, and the other apps use the same registry.

| Web app | Public hostname |
| --- | --- |
| product-service-web-app | https://product-service-web-app-g7bhexgnaje3brbw.centralindia-01.azurewebsites.net |
| order-service-wep-app | https://order-service-wep-app-huhhatejg5adc0cr.centralindia-01.azurewebsites.net |
| pet-service-web-app | https://pet-service-web-app-adgkgbhmfchtfge0.centralindia-01.azurewebsites.net |
| petstoreui-web-app | https://petstoreui-web-app-e3cahqc4bad5dthh.centralindia-01.azurewebsites.net |

The hosted shop is the UI hostname. Its image is built with the product and order hostnames above, so the browser calls those apps directly. The order app keeps the name `order-service-wep-app` from when it was created.

Traffic Manager profiles, one endpoint each:

| Profile | DNS name | App |
| --- | --- | --- |
| ui-traffic-manager | ui-traffic-manager.trafficmanager.net | petstoreui-web-app |
| product-traffic-manager | product-traffic-manager.trafficmanager.net | product-service-web-app |
| petstore-traffic-manager | petstore-traffic-manager.trafficmanager.net | order-service-wep-app |
| pet-traffic-manager | pet-traffic-manager.trafficmanager.net | pet-service-web-app |

Traffic Manager returns the address of an endpoint whose probe is passing. The probe is HTTPS on port 443, path `/`. The apps answer on the hostnames in the table above. Those hostnames are what the probes check.

On App Service the Java apps read Key Vault with the app’s managed identity. On a developer machine the same read uses `az login` for an account that can get secrets.

Screenshots and the written record are in `docs/PetStore-Implementation-Report.pdf`.

## Run locally

Use Java 17, Maven, Node 20, and an Azure CLI login that can read `db-credentials-petstore`. The database and the blob account are already in Azure.

```bash
cd product-service
java -jar target/product-service-0.1.0.jar --spring.config.additional-location=file:./src/main/resources/application.yml

cd pet-service
java -jar target/pet-service-0.1.0.jar --spring.config.additional-location=file:./src/main/resources/application.yml

cd order-service
java -jar target/order-service-0.1.0.jar --spring.config.additional-location=file:./src/main/resources/application.yml
```

The extra configuration location makes the source YAML win over the copy packed inside the jar. The order service creates the admin account when that username is missing. It does not reset an existing admin password.

The UI is `npm run dev` in `petstore-ui`, which serves http://localhost:3000 and calls product-service on 8081 and order-service on 8083. Override those with `VITE_PRODUCT_API` and `VITE_ORDER_API` if needed.
