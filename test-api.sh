#!/usr/bin/env bash
# Prerequisites:
#   - Server running: npm run dev  (or npm start)
#   - node installed (used for JSON parsing)
#   - Database running with migrated schema

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

check() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" -eq "$expected" ]; then
    echo -e "${GREEN}✓${RESET} $label (${actual})"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${RESET} $label — expected ${expected}, got ${actual}"
    FAIL=$((FAIL + 1))
  fi
}

json_get() {
  local body="$1"
  local field="$2"
  echo "$body" | node -e "
    let d='';
    process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{
      try { process.stdout.write(String(($field)(JSON.parse(d)))); }
      catch(e) { process.stdout.write(''); }
    });
  "
}

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Health ===${RESET}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
check "GET /health" 200 "$STATUS"

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Users ===${RESET}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.calendly@example.com","name":"Test User"}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/v1/users" 201 "$STATUS"
USER_ID=$(json_get "$BODY" "o=>o.data.id")

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/users")
check "GET /api/v1/users" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/users/$USER_ID")
check "GET /api/v1/users/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/v1/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated User"}')
check "PATCH /api/v1/users/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","name":"Bad"}')
check "POST /api/v1/users (bad email → 400)" 400 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.calendly@example.com","name":"Duplicate"}')
check "POST /api/v1/users (duplicate → 409)" 409 "$STATUS"

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Event Types ===${RESET}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/event-types" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"title":"30 Min Call","durationMinutes":30}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/v1/event-types" 201 "$STATUS"
ET_ID=$(json_get "$BODY" "o=>o.data.id")
ET_SLUG=$(json_get "$BODY" "o=>o.data.slug")

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/event-types" \
  -H "x-host-id: $USER_ID")
check "GET /api/v1/event-types" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/event-types/$ET_ID" \
  -H "x-host-id: $USER_ID")
check "GET /api/v1/event-types/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/v1/event-types/$ET_ID" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"title":"Updated Call"}')
check "PATCH /api/v1/event-types/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/api/v1/public/event-types/$USER_ID/$ET_SLUG")
check "GET /api/v1/public/event-types/:hostId/:slug" 200 "$STATUS"

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Availability Rules ===${RESET}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/availability/rules" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"weekday":1,"startTime":"09:00","endTime":"17:00"}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/v1/availability/rules" 201 "$STATUS"
RULE_ID=$(json_get "$BODY" "o=>o.data.id")

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/availability/rules" \
  -H "x-host-id: $USER_ID")
check "GET /api/v1/availability/rules" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/v1/availability/rules/$RULE_ID" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"isActive":false}')
check "PATCH /api/v1/availability/rules/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/availability/rules" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"weekday":2,"startTime":"17:00","endTime":"09:00"}')
check "POST /api/v1/availability/rules (bad times → 400)" 400 "$STATUS"

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Availability Exceptions ===${RESET}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/availability/exceptions" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"date":"2026-12-25","type":"BLOCK_FULL_DAY","reason":"Christmas holiday"}')
BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/v1/availability/exceptions" 201 "$STATUS"
EXC_ID=$(json_get "$BODY" "o=>o.data.id")

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/availability/exceptions" \
  -H "x-host-id: $USER_ID")
check "GET /api/v1/availability/exceptions" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/v1/availability/exceptions/$EXC_ID" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"reason":"Christmas + Boxing Day"}')
check "PATCH /api/v1/availability/exceptions/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/availability/exceptions" \
  -H "Content-Type: application/json" \
  -H "x-host-id: $USER_ID" \
  -d '{"date":"2026-12-26","type":"BLOCK_PARTIAL","reason":"Missing times"}')
check "POST /api/v1/availability/exceptions (missing times → 400)" 400 "$STATUS"

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Auth Edge Cases ===${RESET}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/event-types")
check "GET /api/v1/event-types (no x-host-id → 401)" 401 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/event-types" \
  -H "x-host-id: abc")
check "GET /api/v1/event-types (invalid x-host-id → 400)" 400 "$STATUS"

# ---------------------------------------------------------------------------
echo -e "\n${CYAN}=== Cleanup (DELETE) ===${RESET}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE_URL/api/v1/availability/exceptions/$EXC_ID" \
  -H "x-host-id: $USER_ID")
check "DELETE /api/v1/availability/exceptions/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE_URL/api/v1/availability/rules/$RULE_ID" \
  -H "x-host-id: $USER_ID")
check "DELETE /api/v1/availability/rules/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE_URL/api/v1/event-types/$ET_ID" \
  -H "x-host-id: $USER_ID")
check "DELETE /api/v1/event-types/:id" 200 "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE_URL/api/v1/users/$USER_ID")
check "DELETE /api/v1/users/:id" 200 "$STATUS"

# ---------------------------------------------------------------------------
echo ""
echo -e "Results: ${GREEN}${PASS} passed${RESET}, ${RED}${FAIL} failed${RESET}"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
