# Prelib

## Get started

- From the project root, start the stack:

```bash
docker compose up --build
```

## Notes

- Default local setup uses `DISABLE_CORS=true` in [`docker-compose.yml`](/Users/robert.hang/Documents/webdev/personal/prelib/docker-compose.yml), so `http://localhost` works without editing `/etc/hosts`.
- If you want strict origin checks with `prelib.localhost`, run:

```bash
# Add the loopback to your /etc/hosts file
sudo sh -c 'echo "127.0.0.1 prelib.localhost" >> /etc/hosts'

# Start the stack
DISABLE_CORS=false docker compose up --build

# Remove the loopback
sudo sed -i '/prelib.localhost/d' /etc/hosts
```

- Stop the stack with `Ctrl+C`
- Remove containers when done with `docker compose down`

## Tests

- Backend tests:

```bash
cd backend
npm test
```

- Frontend tests:

```bash
cd frontend
npm test
```

- E2E tests:

> Note: The e2e tests assume usage of nvm & node 22 installed. This hasn't been dockerized due to time constraints.
```bash
cd e2e
npm install
npm test
```

## Tradeoffs

Tradeoffs are documented in [docs/TRADEOFFS.md](/Users/robert.hang/Documents/webdev/personal/prelib/docs/TRADEOFFS.md).
