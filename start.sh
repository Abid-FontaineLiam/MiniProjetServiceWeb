#!/bin/bash

echo "Launching backend..."
(cd backend && npm i && npm run dev) &
BACKEND_PID=$!

echo "Launching frontend..."
(cd frontend && npm i && npm run dev) &
FRONTEND_PID=$!

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

wait