run:
	docker compose up --build

build:
	cd backend && npm run build
	cd sdk-js && npm run build
	cd sdk-py && python -m build

test:
	cd backend && npm test
	cd sdk-js && npm test
	cd sdk-py && pytest

lint:
	npx eslint backend/src
	black sdk-py/openmemory