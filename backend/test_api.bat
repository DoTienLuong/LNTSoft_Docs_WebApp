@echo off
REM Test script for backend API (Windows cmd)
REM Make sure server is running: npm run dev

set HOST=http://localhost:4000

echo GET /api/modules
curl -s %HOST%/api/modules | jq . || curl -s %HOST%/api/modules

echo.
echo GET /api/categories?module_id=1
curl -s "%HOST%/api/categories?module_id=1" | jq . || curl -s "%HOST%/api/categories?module_id=1"

echo.
echo GET /api/contents?categoryId=1
curl -s "%HOST%/api/contents?categoryId=1" | jq . || curl -s "%HOST%/api/contents?categoryId=1"

echo.
echo Register a demo user (may conflict if user exists)
curl -s -X POST %HOST%/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"testuser@example.com\",\"password\":\"Secret123!\"}" | jq . || curl -s -X POST %HOST%/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"testuser@example.com\",\"password\":\"Secret123!\"}"

echo.
echo Login with demo user
curl -s -X POST %HOST%/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"Secret123!\"}" | jq . || curl -s -X POST %HOST%/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"Secret123!\"}"

echo.
echo Done.
pause
