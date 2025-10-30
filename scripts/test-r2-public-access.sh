#!/bin/bash
# Test R2 Public Access via Custom Domain
# Run this periodically to check when DNS has propagated

echo "=========================================="
echo "Testing R2 Public Access"
echo "=========================================="
echo ""

BASE_URL="https://media.einoder.net"

echo "1. Testing Synthetic Biophilia Manifest..."
curl -s -I "$BASE_URL/projects/synthetic-biophilia/manifest.json" | head -5
echo ""

echo "2. Testing Synthetic Biophilia Image..."
curl -s -I "$BASE_URL/projects/synthetic-biophilia/web/closed 169 top.jpg" | head -5
echo ""

echo "3. Testing Brain Dump Image..."
curl -s -I "$BASE_URL/projects/brain-dump/DSCF4419.JPG" | head -5
echo ""

echo "=========================================="
echo "Expected: HTTP/2 200 OK with proper headers"
echo "If you see 'Could not resolve host', DNS is still propagating (wait 5-10 min)"
echo "=========================================="

