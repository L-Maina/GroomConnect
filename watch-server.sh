#!/bin/bash
while true; do
    bun run dev
    echo "Server crashed at $(date), restarting in 3 seconds..."
    sleep 3
done
