build:
	docker build . -t cfnda:latest

start-prod:
	docker run -p 80:5000 -d cfnda:latest

start-dev:
	docker run -p 5000:5000 -d cfdna:latest