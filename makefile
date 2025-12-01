build:
	docker compose build

start:
	docker compose up

stop:
	docker compose down
test:
	cd admin-app && npx jest