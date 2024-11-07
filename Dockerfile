# Step 1: Build the React frontend
FROM node:22-alpine AS build-frontend
WORKDIR /app/frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build

# Step 2: Build the Go backend
FROM golang:1.23-alpine AS build-backend
WORKDIR /app/backend
COPY ./backend/go.mod ./backend/go.sum ./
RUN go mod download
COPY ./backend ./
# Copy the 'dist' folder from the frontend build
COPY --from=build-frontend /app/frontend/dist ./frontend/dist
RUN go build -o server .

# Step 3: Run the combined service
FROM alpine:latest
WORKDIR /root/
COPY --from=build-backend /app/backend/server .
COPY --from=build-backend /app/backend/frontend/dist ./frontend/dist
EXPOSE 8080
CMD ["./server"]

