FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_PRODUCT_API=https://product-service-web-app-g7bhexgnaje3brbw.centralindia-01.azurewebsites.net
ARG VITE_PET_API=https://pet-service-web-app-adgkgbhmfchtfge0.centralindia-01.azurewebsites.net
ARG VITE_ORDER_API=https://order-service-wep-app-huhhatejg5adc0cr.centralindia-01.azurewebsites.net
ENV VITE_PRODUCT_API=$VITE_PRODUCT_API
ENV VITE_PET_API=$VITE_PET_API
ENV VITE_ORDER_API=$VITE_ORDER_API
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
