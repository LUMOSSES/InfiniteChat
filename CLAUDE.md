# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
# Required: JDK 17 at C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
# Set in start-services.ps1 or your shell: $env:JAVA_HOME = "…"
# Lombok is incompatible with JDK 25 — only JDK 17 works.

# Build all modules (skip tests):
mvn clean package -DskipTests

# Start infrastructure (Docker Desktop must be running):
docker compose -f docker-compose-infra.yml up -d

# Start all 7 services via PowerShell:
.\start-services.ps1

# Kill all running services by port:
.\kill-services.ps1

# Init database after first MySQL container start:
# The init.sql script runs automatically via docker-entrypoint-initdb.d mount.
# If you need to re-initialize manually, pipe it into the MySQL container.
```

Each service can also be started individually:

```bash
cd <ServiceModule> && mvn spring-boot:run
```

## Architecture Overview

**7-module Maven project** (Spring Boot 2.6.13, Spring Cloud Alibaba 2021.0.5.0):

| Module | Port | Purpose |
|---|---|---|
| GateWay | 10010 | Spring Cloud Gateway — all external traffic enters here |
| AuthenticationService | 8082 | User registration, login, avatar, email codes, MinIO upload URLs |
| RealTimeCommunicationService | 8083 | HTTP endpoints for message push; Netty WebSocket on 9100 |
| MessageingService | 8081 | Chat messaging, red packets, Kafka produce/consume |
| ContanctService | 8084 | Contacts, friends, friend applications, groups |
| OfflineDataStoreService | 8085 | Offline message persistence / retrieval (Kafka consumer) |
| MomentService | 8086 | Social feed — create/list/like/comment/delete moments |

**Service discovery**: Nacos 2.3.0 at `127.0.0.1:18375`. Every service registers with Nacos and the Gateway resolves routes via `lb://<serviceName>`. Nacos 2.x uses gRPC on port offset +1000 — the Nacos Docker container maps both `18375:8848` and `9848:9848`. The `docker-compose-infra.yml` MUST map the gRPC port.

**Inter-service calls**: Only one FeignClient exists — `MessageingService` calls `ContactService` via `@FeignClient("ContactService")`. Other services are independent.

**Async messaging**: Kafka at `127.0.0.1:19092`. `MessageingService` produces, `OfflineDataStoreService` consumes. Group id: `thousnads_word_message_all`.

## Key Infrastructure (Docker)

| Component | Host Port | Container | Credentials |
|---|---|---|---|
| MySQL 8.0 | 13306 | infinitechat-mysql | root / `gK3T9n%q2M@j7Z4` |
| Redis 7 | 59000 | infinitechat-redis | password `e65K4t8w2` |
| Nacos 2.3.0 | 18375 (+ gRPC 9848) | infinitechat-nacos | no auth |
| MinIO | 9000 (console 9001) | infinitechat-minio | minioadmin / minioadmin |
| Kafka | 19092 | infinitechat-kafka | — |
| ZooKeeper | 2181 | infinitechat-zookeeper | — |

Start all with: `docker compose -f docker-compose-infra.yml up -d`

## Gateway Routing

All routes use Nacos load-balanced URIs (`lb://<service>`). The Gateway adds `X-Request-Source: InfiniteChat-GateWay` to AuthenticationService requests:

| Path Prefix | Service |
|---|---|
| `/api/v1/user/**` | AuthenticationService |
| `/api/v1/contact/**` | ContactService |
| `/api/v1/chat/**` | MessagingService |
| `/api/v1/message/**` | RealTimeCommunicationService |
| `/api/v1/offline/**` | OfflineDataStoreService |
| `/api/v1/moment/**` | MomentService |
| `/api/v1/netty` | NettyService (WebSocket `lb:ws://`) |

## Request-Origin Guard (SourceHandler)

`AuthenticationService` has a `SourceHandler` interceptor that rejects requests (HTTP 400, code 40301) unless `X-Request-Source: InfiniteChat-GateWay` is present. This applies to ALL paths (`/**`). The Gateway adds this header automatically. Direct calls to AuthenticationService on port 8082 will be rejected — always go through Gateway (10010).

A separate `JwtHandler` interceptor only fires on `/api/v1/user/avatar`.

## JWT

- Algorithm: HS512
- Secret key: `goat` (defined in `ConfigEnum.TOKEN_SECRET_KEY` in both AuthenticationService and RealTimeCommunicationService)
- Password salt: also `goat`
- Expiration: 2 days (`TimeOutEnum.JWT_TIME_OUT`)
- Token subject is the user ID (Long)
- Gateway parses JWT with jjwt 0.9.1

## Database

13 tables in `infiniteChat` database: `user`, `friend`, `apply_friend`, `session`, `user_session`, `message`, `red_packet`, `red_packet_receive`, `user_balance`, `balance_log`, `moment`, `moment_like`, `moment_comment`. Full DDL in `init.sql` at repo root.

MyBatis-Plus 3.5.x is used across all data-access services. SQL logging is enabled (`StdOutImpl`).

## Known Pitfalls

- **Windows ephemeral ports**: Range 49152–65535 is reserved. Never map Docker services there. MySQL was originally on 49152 → changed to 13306.
- **Nacos gRPC**: Nacos 2.x clients need the gRPC port reachable. Both config (`failure-tolerance-enabled: true`, `fail-fast: false`) AND Docker port mapping (`9848:9848`) are required.
- **NettyServer Nacos registration**: The `@PostConstruct` method registers the Netty instance manually. If Nacos isn't ready, it retries 10 times with 5s delays in a background thread — don't move this to blocking without similar resilience.
- **Maven**: No Maven wrapper (`mvnw`). Use system `mvn`. All modules use Java 1.8 source/target but run on JDK 17.
- **PowerShell stdout/stderr**: `Start-Process` cannot redirect both streams to the same file. The start script uses separate `-err.log` files.

## Postman Collection

`InfiniteChat.postman_collection.json` at repo root covers all 6 service groups with pre-request scripts (auto-login, token save) and test assertions. Collection variables: `baseUrl` (default `http://localhost:10010`), `email`, `password`, `token`, `loginUserId`, etc.
