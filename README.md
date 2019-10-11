## Startup

```
git clone https://bitbucket.org/zhu1lx/express_react.git
```

Install and update missing dependencies
```
pip install -r requirements.txt
yarn
cd client
yarn
```

Start server
```
yarn start:dev
```

Start frontend
```
# on new terminal
cd client
yarn start
```

## Deploy

1. `eval $(docker-machine env cfdna-web)`
2. Stop running containers (`docker stop <containerid>`, can list containers with `docker ps -a`)
3. `make build && make start-prod`

Will be deployed to `http:<host ip>`, host ip can be found with `docker-machine ip cfdna-web` (shouldn't change unless actual ec2 instance is taken down)