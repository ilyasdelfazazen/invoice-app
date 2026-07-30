# Full-Stack Deployment Guide
## Hostinger VPS + Docker + Nginx Proxy Manager
### Stack: Angular + Express + MongoDB

---

## STEP 1 — Point Your Domain to the VPS

1. Go to **Hostinger → Domains → DNS Zone**
2. Add or update these A records:
   - Host: `@`   → Value: your VPS IP (e.g. `xxx.xxx.xxx.xxx`)
   - Host: `www` → Value: same VPS IP
3. Wait 5–30 minutes for DNS propagation
4. Verify with: `ping yourdomain.com` — should resolve to your VPS IP

---

## STEP 2 — Fix All Hardcoded localhost URLs in Code

Search your entire project for `localhost` and `127.0.0.1` before deploying.

### frontend/libs/environments/environment.prod.ts
```ts
// BEFORE
apiUrl: 'https://localhost/api'

// AFTER
apiUrl: 'https://yourdomain.com/api'
```

### backend/src/app.js (CORS)
```js
// BEFORE
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://localhost', 'capacitor://localhost']

// AFTER
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yourdomain.com', 'https://www.yourdomain.com', 'capacitor://localhost']
```

---

## STEP 3 — Create backend/.env.production

Create a separate production env file (never use the dev .env in production):

```
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://dbadmin:dbpassword@mongo:27017/YOURDATABASE?authSource=admin
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=yourpassword
```

> Note: The hostname in MONGO_URI is `mongo` — the Docker service name, not localhost.

---

## STEP 4 — Create backend/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/app.js"]
```

---

## STEP 5 — Create frontend/nginx.conf

Nginx serves the Angular static files AND proxies /api calls to the backend internally:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## STEP 6 — Create frontend/Dockerfile

Multi-stage build: Node builds Angular, then Nginx serves the output:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx ng build web --configuration=production

FROM nginx:alpine

COPY --from=builder /app/dist/web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

> Note: Angular 17+ with the `application` builder outputs to `dist/web/browser/` (not `dist/web/`).

---

## STEP 7 — Create docker-compose.yml at Project Root

```yaml
version: '3.8'

services:

  frontend:
    container_name: myapp-frontend-1
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "8081:80"          # pick a free port, NPM will route to this
    depends_on:
      - backend
    networks:
      - myapp-network
    restart: unless-stopped

  backend:
    container_name: myapp-backend-1
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGO_URI=mongodb://dbadmin:dbpassword@mongo:27017/YOURDATABASE?authSource=admin
      - JWT_SECRET=your_strong_jwt_secret
      - JWT_EXPIRES_IN=7d
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=yourpassword
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - myapp-network
    restart: unless-stopped

  mongo:
    container_name: myapp-mongo-1
    image: mongo:7
    environment:
      - MONGO_INITDB_ROOT_USERNAME=dbadmin
      - MONGO_INITDB_ROOT_PASSWORD=dbpassword
    volumes:
      - ./data/mongodb:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s
    networks:
      - myapp-network
    restart: unless-stopped

networks:
  myapp-network:
    driver: bridge
```

### Key security points:
- MongoDB has no `ports:` → invisible outside Docker ✅
- Backend has no `ports:` → only reachable inside Docker network ✅
- Frontend exposes only one port for NPM to proxy through ✅

---

## STEP 8 — Fix Angular Build Budget Errors (if any)

If the build fails with "exceeded maximum budget" errors for component stylesheets, run:

```bash
python3 -c "
import json
with open('frontend/angular.json') as f:
    d = json.load(f)
budgets = d['projects']['web']['architect']['build']['configurations']['production']['budgets']
for b in budgets:
    if b['type'] == 'anyComponentStyle':
        b['maximumWarning'] = '10kb'
        b['maximumError'] = '20kb'
with open('frontend/angular.json', 'w') as f:
    json.dump(d, f, indent=2)
print('Done')
"
```

---

## STEP 9 — Upload Code to VPS and Build

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to project
cd ~/yourApp

# Build and start all containers
docker compose up --build -d

# Watch logs
docker compose logs -f

# Verify all containers are running
docker compose ps
```

Expected output — all 3 containers should show `Up`:
```
myapp-frontend-1   Up   0.0.0.0:8081->80/tcp
myapp-backend-1    Up   3000/tcp
myapp-mongo-1      Up (healthy)   27017/tcp
```

---

## STEP 10 — Connect NPM to Your App Network (Docker DNS / Service Discovery)

Nginx Proxy Manager runs in its own Docker network. To let NPM reach your frontend container **by name** (instead of IP), connect NPM to your app network:

```bash
docker network connect myapp-network nginx-proxy-manager-app-1
```

Test that NPM can reach your frontend:
```bash
docker exec nginx-proxy-manager-app-1 curl -s -o /dev/null -w "%{http_code}" http://myapp-frontend-1:80
# Should return: 200
```

> This is called **Docker DNS-based service discovery** — containers on the same user-defined network can reach each other by container name. Docker's built-in DNS resolves the name to the container's internal IP automatically.

---

## STEP 11 — Configure Nginx Proxy Manager

1. Open NPM admin panel: `http://your-vps-ip:81`
2. Go to **Proxy Hosts → Add Proxy Host**

### Details tab:
| Field | Value |
|---|---|
| Domain Names | `yourdomain.com` and `www.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname / IP | `myapp-frontend-1` (container name) |
| Forward Port | `80` |
| Block Common Exploits | ON |
| Websockets Support | ON |

### SSL tab:
| Field | Value |
|---|---|
| SSL Certificate | Request a new SSL Certificate (Let's Encrypt) |
| Force SSL | ON |
| HTTP/2 Support | ON |
| Email | your email |

3. Click **Save** — NPM will request the SSL certificate automatically

---

## STEP 12 — Seed the Database (if applicable)

If your project has a seed script to create the initial admin user or default data:

```bash
docker exec myapp-backend-1 node src/seed.js
```

---

## STEP 13 — Verify Everything Works

```bash
# Check all containers are healthy
docker compose ps

# Check backend logs
docker compose logs backend

# Check frontend logs
docker compose logs frontend

# Check mongo logs
docker compose logs mongo
```

Then open `https://yourdomain.com` in your browser — you should see your app running with HTTPS.

---

## Useful Commands for Later

```bash
# Stop everything
docker compose down

# Restart everything (no rebuild)
docker compose up -d

# Rebuild and restart after code changes
docker compose up --build -d

# View live logs
docker compose logs -f

# View logs for one service
docker compose logs -f backend

# Open a shell inside a container
docker exec -it myapp-backend-1 sh

# Check MongoDB inside container
docker exec -it myapp-mongo-1 mongosh -u dbadmin -p dbpassword
```

---

## Architecture Summary

```
Internet
    │
    ▼
Nginx Proxy Manager (port 80/443)
    │  routes yourdomain.com
    ▼
[myapp-network Docker network]
    │
    ├── myapp-frontend-1 (nginx:alpine)
    │       serves Angular static files
    │       proxies /api/* → backend:3000
    │
    ├── myapp-backend-1 (node:20-alpine)
    │       Express API on port 3000
    │       only reachable inside Docker network
    │
    └── myapp-mongo-1 (mongo:7)
            MongoDB on port 27017
            only reachable inside Docker network
            data persisted in ./data/mongodb
```

---

*Generated from a real deployment session — scemanager.online on Hostinger VPS*
