# Auth Microservice

## Dev

1. Clone the repository
2. Install the dependencies
3. Create a file `.env` based on `env.template`
4. Raise the NATS server

```
$ docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```

5. Run the command `npm run start:dev`

## PROD

Run the following command

```
docker build -f dockerfile.prod -t auth-ms .
```

## If you want the latest version of the service

```
docker pull fernandoflores07081/auth-ms-prod
```
