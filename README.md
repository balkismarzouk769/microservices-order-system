# Microservices Order System

## Description du projet

Ce projet est une application basée sur une architecture microservices développée avec Node.js.

L’application permet de gérer :

* les utilisateurs ;
* les produits ;
* les commandes.

Elle met en œuvre plusieurs technologies modernes :

* REST API ;
* GraphQL ;
* gRPC ;
* Apache Kafka ;
* SQLite ;
* RxDB ;
* API Gateway ;
* Docker ;
* microservices indépendants.

---

# Architecture du projet

```text
Client / Postman
        |
        | REST / GraphQL
        v
+----------------------+
|     API Gateway      |
|      Port 4000       |
+----------------------+
        |
        | gRPC
        |
---------------------------------------------------
|                    |                            |
v                    v                            v
+----------------+  +----------------+  +----------------+
| Users Service  |  |Products Service|  | Orders Service |
|   Port 50051   |  |   Port 50052   |  |   Port 50053   |
+----------------+  +----------------+  +----------------+
        |                    |                    |
    users.db            products.db           RxDB
                                                    |
                                                    | Kafka Event
                                                    v
                                              +-------------+
                                              |   Kafka     |
                                              | Port 9092   |
                                              +-------------+
```

---

# Technologies utilisées

| Technologie      | Rôle                              |
| ---------------- | --------------------------------- |
| Node.js          | Runtime backend                   |
| Express.js       | API REST                          |
| GraphQL          | Requêtes flexibles                |
| gRPC             | Communication entre microservices |
| Protocol Buffers | Contrats gRPC                     |
| Apache Kafka     | Communication asynchrone          |
| KafkaJS          | Client Kafka Node.js              |
| SQLite3          | Base de données SQL               |
| RxDB             | Base NoSQL                        |
| Docker           | Exécution Kafka                   |

---

# Microservices

## Users Service

Port : 50051

Fonctionnalités :

* ajouter utilisateur ;
* afficher utilisateurs ;
* afficher utilisateur par ID ;
* supprimer utilisateur ;
* vérifier existence utilisateur.

Base de données :

```txt
users.db
```

---

## Products Service

Port : 50052

Fonctionnalités :

* ajouter produit ;
* afficher produits ;
* afficher produit par ID ;
* supprimer produit ;
* vérifier stock ;
* mise à jour automatique stock via Kafka.

Base de données :

```txt
products.db
```

---

## Orders Service

Port : 50053

Fonctionnalités :

* créer commande ;
* afficher commandes ;
* afficher commande par ID ;
* afficher commandes par utilisateur ;
* validation utilisateur ;
* validation stock ;
* publication événement Kafka.

Base de données :

```txt
RxDB
```

Topic Kafka :

```txt
order-created
```

---

# API Gateway

Port : 4000

L’API Gateway représente le point d’entrée principal du système.

Elle permet :

* d’exposer les endpoints REST ;
* d’exposer GraphQL ;
* de communiquer avec les microservices via gRPC.

---

# Endpoints REST

## Users

| Méthode | Endpoint   | Description                 |
| ------- | ---------- | --------------------------- |
| POST    | /users     | Ajouter utilisateur         |
| GET     | /users     | Afficher utilisateurs       |
| GET     | /users/:id | Afficher utilisateur par ID |
| DELETE  | /users/:id | Supprimer utilisateur       |

---

## Products

| Méthode | Endpoint      | Description             |
| ------- | ------------- | ----------------------- |
| POST    | /products     | Ajouter produit         |
| GET     | /products     | Afficher produits       |
| GET     | /products/:id | Afficher produit par ID |
| DELETE  | /products/:id | Supprimer produit       |

---

## Orders

| Méthode | Endpoint             | Description                    |
| ------- | -------------------- | ------------------------------ |
| POST    | /orders              | Créer commande                 |
| GET     | /orders              | Afficher commandes             |
| GET     | /orders/:id          | Afficher commande par ID       |
| GET     | /orders/user/:userId | Afficher commandes utilisateur |
| DELETE  | /orders/:id          | Supprimer commande             |

---

# GraphQL

Endpoint :

```txt
http://localhost:4000/graphql
```

---

## Exemple Query Users

```graphql
{
  users {
    id
    name
    email
  }
}
```

---

## Exemple Query Products

```graphql
{
  products {
    id
    name
    stock
  }
}
```

---

## Exemple Query Orders

```graphql
{
  orders {
    id
    userId
    total
  }
}
```

---

# Communication gRPC

L’API Gateway communique avec les microservices via gRPC.

Flux :

```text
Client
  ↓
API Gateway
  ↓
gRPC
  ↓
Microservices
  ↓
Databases
```

Les contrats gRPC sont définis dans :

```txt
proto/
```

Fichiers utilisés :

* users.proto
* products.proto
* orders.proto

---

# Kafka

Kafka est utilisé pour la communication asynchrone.

Lorsqu’une commande est créée, Orders Service publie événement :

```txt
ORDER_CREATED
```

Topic utilisé :

```txt
order-created
```

Products Service consomme cet événement afin de :

* mettre à jour le stock ;
* synchroniser données.

---

## Exemple message Kafka

```json
{
  "id": "1778671998689",
  "userId": 1,
  "products": [
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "total": 3500
}
```

---

# Bases de données

Chaque microservice possède sa propre base.

| Microservice     | Base de données |
| ---------------- | --------------- |
| Users Service    | users.db        |
| Products Service | products.db     |
| Orders Service   | RxDB            |

---

# Structure du projet

```text
microservices-order-system/
│
├── api-gateway/
│   └── server.js
│
├── users-service/
│   ├── grpc-server.js
│   ├── server.js
│   └── database.js
│
├── products-service/
│   ├── grpc-server.js
│   ├── kafkaConsumer.js
│   ├── server.js
│   └── database.js
│
├── orders-service/
│   ├── grpc-server.js
│   ├── kafkaProducer.js
│   └── database.js
│
├── proto/
│   ├── users.proto
│   ├── products.proto
│   └── orders.proto
│
├── docker-compose.yml
├── README.md
└── architecture.png
```

---

# Installation

Installer dépendances dans chaque service :

```bash
npm install
```

---

# Lancement du projet

## 1. Lancer Docker Kafka

```bash
docker compose up -d
```

---

## 2. Vérifier Docker

```bash
docker ps
```

---

## 3. Lancer Users Service

```bash
cd users-service
node grpc-server.js
```

---

## 4. Lancer Products Service

```bash
cd products-service
node grpc-server.js
```

---

## 5. Lancer Orders Service

```bash
cd orders-service
node grpc-server.js
```

---

## 6. Lancer API Gateway

```bash
cd api-gateway
node server.js
```

---

# Tests REST

Base URL :

```txt
http://localhost:4000
```

---

## Vérifier API Gateway

```txt
GET /
```

---

## Ajouter utilisateur

```txt
POST /users
```

---

## Ajouter produit

```txt
POST /products
```

---

## Créer commande

```txt
POST /orders
```

---

# Tests GraphQL

URL :

```txt
http://localhost:4000/graphql
```

Exemple :

```graphql
{
  products {
    id
    name
    stock
  }
}
```

---

# Validation Kafka

Après création commande, terminal Products Service doit afficher :

```txt
ORDER CREATED EVENT RECEIVED
```

---

# Validation communication microservices

## User inexistant

```json
{
  "userId": 999
}
```

Résultat :

```txt
User not found
```

---

## Stock insuffisant

```json
{
  "quantity": 999
}
```

Résultat :

```txt
Insufficient stock
```

---

# Fonctionnalités validées

* REST API fonctionnelle ;
* GraphQL fonctionnel ;
* gRPC fonctionnel ;
* Kafka Producer fonctionnel ;
* Kafka Consumer fonctionnel ;
* bases séparées ;
* API Gateway opérationnelle ;
* communication microservices ;
* architecture événementielle complète.

---

# Auteur 
Balkis Marzouk
