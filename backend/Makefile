.PHONY: build run test clean dev docker-build docker-run help

BINARY_NAME=ai-models-backend
MAIN_PATH=./cmd/main.go

help:
	@echo "Available commands:"
	@echo "  build        - Build the binary"
	@echo "  run          - Run the application"
	@echo "  dev          - Run in development mode with auto-reload"
	@echo "  test         - Run tests"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  deps         - Download dependencies"
	@echo "  fmt          - Format code"
	@echo "  lint         - Run linter"

build:
	go build -o $(BINARY_NAME) $(MAIN_PATH)

run:
	go run $(MAIN_PATH)

dev:
	go run $(MAIN_PATH)

test:
	go test -v ./...

clean:
	go clean
	rm -f $(BINARY_NAME)

docker-build:
	docker build -t $(BINARY_NAME) .

docker-run:
	docker-compose up --build

deps:
	go mod download
	go mod tidy

fmt:
	go fmt ./...

lint:
	golangci-lint run

install-tools:
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

setup: deps install-tools

watch:
	air -c .air.toml