ENV CONFIG DOCUMENT (DETAILED)
Frontend must define environment variables:
BASE_URL = http://localhost:8080
AI_URL = http://localhost:8000
Usage:
- BASE_URL → all backend APIs
- AI_URL → AI prediction API
Production:
- Replace with deployed URLs.
IMPORTANT:
- Do NOT hardcode URLs in code.
- Use .env file.
- Ensure CORS allows frontend domain.
- Restart frontend after env changes.

API CONTRACT DOCUMENTATION (DETAILED)
1. All APIs follow standard response format:
{ success, message, data, timestamp }
2. Success = true → valid response, Success = false → error.
3. Important APIs:
- POST /auth/login
- POST /ai/predict
- POST /issues
- GET /issues
- GET /issue-types
4. All protected APIs require JWT token.
5. Content-Type:
- JSON for normal APIs
- multipart/form-data for image upload
6. Always handle both success and error responses.
7. Never assume API success — always check success flag.
8. For pagination/filter APIs, always pass correct query params.

AI WORKFLOW DOCUMENT (DETAILED)
STEP 1: User opens Report Issue form.
Fields: title, description, latitude, longitude, image.
STEP 2: User fills all fields and uploads image.
STEP 3: Frontend calls POST /ai/predict with image.
STEP 4: Backend returns issue + confidence + issueTypeId.
CASE 1: confidence >= 0.7
- Auto select issueTypeId.
- Show dropdown with selected value.
- Allow user to override.
CASE 2: confidence < 0.7
- Show warning popup: 'AI not confident'.
- Show dropdown list.
- User MUST select issue type.
STEP 5: User confirms issue type.
STEP 6: Frontend calls POST /issues.
STEP 7: Backend saves issue.
IMPORTANT RULES:
- NEVER call create issue before AI prediction.
- ALWAYS send issueTypeId.
- ALWAYS handle AI failure gracefully.
- Maintain loading states during API calls.

JWT CONTRACT DOCUMENT (DETAILED)
1. Authentication is JWT-based. No sessions are used.
2. Login API: POST /auth/login
3. Response contains token and user details.
4. Frontend must store token securely (prefer localStorage).
5. For every protected API call, include header:
Authorization: Bearer
6. If token is missing or invalid, backend returns 401.
7. Frontend must handle 401 by redirecting user to login.
8. Token expiration: 24 hours (86400000 ms).
9. Do NOT store token in plain variables (risk of loss on refresh).
10. Always attach token using interceptor (Axios/Fetch middleware).

■ WARD MODULE — FULL API INTEGRATION DOCUMENTATION
■ GLOBAL BEHAVIOR
Access
All endpoints are PUBLIC
■ No authentication required
■ This is intentional (used during issue creation, maps, dropdowns)
Base URL
/wards
Response Structure (ALL APIs)
{
"success": true,
"message": "...",
"data": ...
}
================================
1■■ GET ALL WARDS
================================
■ Endpoint
GET /wards
■ Purpose
Fetch all wards
Used for:
dropdowns
admin UI
filtering
■ Request
■ No params
■ No body
■ Response
{
"success": true,
"message": "Wards fetched",
"data": [
{
"id": 1,
"wardNumber": 10,
"wardName": "Jayanagar"
},
{
"id": 2,
"wardNumber": 11,
"wardName": "BTM Layout"
}
]
}
■ FRONTEND RULES
MUST DO:
Cache this result (it rarely changes)
Use for:
dropdowns
filters
MUST NOT:
■ Call repeatedly on every render
■■ Design Issue
No pagination → fine for now, but bad at scale
================================
2■■ GET WARD BY ID
================================
■ Endpoint
GET /wards/{id}
■ Purpose
Fetch specific ward
■ Path Param
Param■Type
id■Integer
■ Response
{
"success": true,
"data": {
"id": 1,
"wardNumber": 10,
"wardName": "Jayanagar"
}
}
■ Error Cases
Scenario■Message
Invalid ID■"Ward not found"
■ FRONTEND RULES
Use when:
you only have wardId
Avoid unnecessary calls if already cached
================================
3■■ WARD LOOKUP (CRITICAL API)
================================
■ Endpoint
GET /wards/lookup?lat={lat}&lng={lng}
■ Purpose (VERY IMPORTANT)
■ Convert:
Latitude + Longitude → Ward
This is used in:
Issue creation
Location tagging
Auto-assignment logic
■ Query Params
Param■Type■Required
lat■double■■
lng■double■■
Example
/wards/lookup?lat=12.9716&lng=77.5946
■ Backend Logic (IMPORTANT)
Validates:
latitude between [-90, 90]
longitude between [-180, 180]
Creates:
Point(lng, lat)
SRID = 4326
Uses:
PostGIS ST_Contains (via repository)
■ Success Response
{
"success": true,
"message": "Ward lookup successful",
"data": {
"id": 5,
"wardNumber": 32,
"wardName": "Indiranagar"
}
}
■ Error Cases
Scenario■Message
Invalid latitude■"Invalid latitude"
Invalid longitude■"Invalid longitude"
No ward match■"No ward found for coordinates"
■ FRONTEND RULES (CRITICAL — READ CAREFULLY)
■ 1. LAT/LNG ORDER CONFUSION (COMMON BUG)
Backend expects:
lat = latitude
lng = longitude
BUT internally:
Point(lng, lat)
■ This is correct (Geo standard), but frontend must:
send correctly
NOT swap values
■ 2. WHEN TO CALL THIS API
Call ONLY when:
User selects location
GPS obtained
Map pin dropped
DO NOT:
■ call continuously while dragging map
■ spam API
■ 3. CACHING STRATEGY
If user selects same location repeatedly:
cache result
avoid repeated calls
■ 4. FAILURE HANDLING
If:
"No ward found"
Frontend must:
show error
block issue submission
■ Otherwise issue will have no ward → breaks assignment logic
■ 5. PRECISION ISSUE
Small coordinate variation may return different ward
Use:
rounded coordinates OR
stable location selection
■ SYSTEM-LEVEL IMPORTANCE
This API is used in:
■ Issue Module (MANDATORY)
Determines:
wardId
assignment
SLA routing
If frontend:
skips this
sends manual wardId
■ Your system becomes inconsistent
■ GLOBAL FRONTEND INTEGRATION RULES
1. Ward Data Usage
Use Case■API
Dropdown■GET /wards
Display name■GET /wards/{id}
Auto-detect■GET /wards/lookup
2. DO NOT TRUST FRONTEND INPUT
Always rely on backend lookup
NEVER:
manually assign wardId
3. Error Handling
Code■Action
400■invalid input
404■ward not found
200■success
4. Performance Rules
Cache /wards
Debounce /lookup

■ ADMIN MODULE — FULL API INTEGRATION DOCUMENTATION
■ GLOBAL ADMIN RULES
Access Control
ALL endpoints:
/admin/users/**
■ Require:
ROLE_ADMIN
If frontend tries without admin token → 403
Headers (ALL APIs)
Authorization: Bearer <JWT>
Content-Type: application/json
■ Critical Design Reality
Admin can:
Create OFFICIAL / WARD_SUPERIOR
Modify ANY user
Delete ANY user
■ No soft restrictions → frontend must enforce UX constraints
================================
1■■ CREATE USER (ADMIN)
================================
■ Endpoint
POST /admin/users
■ Purpose
Create:
OFFICIAL
WARD_SUPERIOR
■ Request Body
Field■Required■Notes
username■■■unique
fullName■■■
email■■■unique
mobile■■■unique
password■■■plain text
role■■■OFFICIAL / WARD_SUPERIOR
wardId■■■always required
departmentId■■■■required ONLY for OFFICIAL
Example (OFFICIAL)
{
"username": "officer1",
"fullName": "Officer One",
"email": "officer1@gmail.com",
"mobile": "9876543210",
"password": "password123",
"role": "OFFICIAL",
"wardId": 5,
"departmentId": 2
}
Example (WARD_SUPERIOR)
{
"username": "superior1",
"fullName": "Superior One",
"email": "superior@gmail.com",
"mobile": "9999999999",
"password": "password123",
"role": "WARD_SUPERIOR",
"wardId": 5
}
■ Backend Logic (CRITICAL)
■ Cannot create CITIZEN
Validates:
username/email/mobile uniqueness
Role rules:
OFFICIAL → requires departmentId
WARD_SUPERIOR → departmentId ignored
■ Response
{
"success": true,
"message": "User created successfully",
"data": { ...user }
}
■ Error Cases
Scenario■Message
Role = CITIZEN■"Admin cannot create citizen"
Missing ward■"Ward is required"
Missing dept for official■"Department required for official"
Duplicate username/email/mobile■error
■ FRONTEND RULES
MUST DO:
Dynamic form:
Show department only if role = OFFICIAL
Validate before sending
MUST NOT:
■ Allow invalid role values
■ Send department for WARD_SUPERIOR blindly
■■ Hidden Problem
Role is String → enum conversion
■ If frontend sends wrong case → crash
================================
2■■ GET ALL USERS
================================
■ Endpoint
GET /admin/users
■ Purpose
Fetch ALL users (no pagination)
■ Response
{
"success": true,
"data": [
{ user1 },
{ user2 }
]
}
■ FRONTEND RULES
MUST DO:
Implement client-side pagination (backend has none)
MUST NOT:
■ Assume filtered results
■ Use for large datasets blindly
■■ Problem
No filtering
No pagination
→ scalability issue
================================
3■■ GET USER BY ID
================================
■ Endpoint
GET /admin/users/{id}
■ Response
{
"success": true,
"data": { user }
}
■ Error
Scenario■Message
Not found■"User not found"
■ FRONTEND RULES
Use for:
edit page
detail view
================================
4■■ UPDATE USER (ADMIN)
================================
■ Endpoint
PUT /admin/users/{id}
■ Request Body
Field■Required
fullName■optional
email■optional
mobile■optional
wardId■optional
departmentId■optional
isActive■optional
Example
{
"fullName": "Updated Name",
"email": "new@mail.com",
"isActive": true
}
■ Backend Logic
Updates only provided fields
■ NO uniqueness check (BIG ISSUE)
■ FRONTEND RULES
MUST DO:
Validate uniqueness manually (or expect failure later)
MUST NOT:
■ Assume safe update
■ Send invalid email/mobile
■■ CRITICAL BUG
No duplicate check for email/mobile
■ Can corrupt DB integrity
================================
5■■ RESET PASSWORD (ADMIN)
================================
■ Endpoint
POST /admin/users/{id}/reset-password
■ Request
{
"newPassword": "newpassword123"
}
■ Backend Logic
■ Cannot reset CITIZEN password
Updates password
Sends notification
■ Response
{
"success": true,
"message": "Password reset successful"
}
■ FRONTEND RULES
MUST DO:
Allow only for:
OFFICIAL
WARD_SUPERIOR
MUST NOT:
■ Show reset button for citizens
■■ SECURITY ISSUE
Old JWT still valid after reset
■ Same flaw as user module
================================
6■■ DELETE USER
================================
■ Endpoint
DELETE /admin/users/{id}
■ Backend Logic
Hard delete
Sends notification
■ Response
{
"success": true,
"message": "User deleted successfully"
}
■ FRONTEND RULES
MUST DO:
Confirmation dialog
Remove from UI immediately
■■ CRITICAL RISK
No soft delete
No dependency checks
■ You can delete:
active officials
assigned users
→ system inconsistency possible
■ GLOBAL FRONTEND INTEGRATION RULES
1. Role Enforcement
Only ADMIN can access
Hide admin UI for others
2. Form Handling
Scenario■UI Logic
Role = OFFICIAL■show department
Role = SUPERIOR■hide department
3. Data Sync
After:
create
update
delete
■ Refresh list
4. Error Handling
Code■Action
400■show validation
403■block access
404■show "not found"

■ AI MODULE — FULL API INTEGRATION DOCUMENTATION
■ GLOBAL BEHAVIOR
Endpoint Base
/ai
Auth Requirement
■ YES — requires JWT
From SecurityConfig:
/ai/predict → authenticated()
Content Type
multipart/form-data
Response Structure
{
"success": true,
"message": "...",
"data": { ... }
}
================================
1■■ AI PREDICT ISSUE
================================
■ Endpoint
POST /ai/predict
■ Purpose
■ Takes image → returns:
predicted issue name
confidence score
mapped issueTypeId
auto-selection flag
■ Headers
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
■ Request
Form Data
Field■Type■Required
file■MultipartFile■■ YES
Example (Frontend)
const formData = new FormData();
formData.append("file", imageFile);
fetch("/ai/predict", {
method: "POST",
headers: {
Authorization: `Bearer ${token}`
},
});
body: formData
■ Backend Flow (REAL LOGIC)
Step-by-step:
Validate file:
if file == null OR empty → error
Call external AI:
POST {ai.service.url}/predict
AI returns:
{
"issue": "pothole",
"confidence": 0.85
}
Map:
issue → issueTypeId
Compute:
autoSelected = confidence >= 0.7 AND issueTypeId != null
■ Success Response
{
"success": true,
"message": "AI prediction successful",
"data": {
"issue": "pothole",
"confidence": 0.85,
"issueTypeId": 1,
"autoSelected": true
}
}
■ FIELD BREAKDOWN (VERY IMPORTANT)
Field■Meaning
issue■raw AI label
confidence■probability score
issueTypeId■mapped DB ID
autoSelected■whether frontend should auto-select
■ FRONTEND INTEGRATION RULES (CRITICAL)
■ 1. DO NOT TRUST AI BLINDLY
Rule:
AI = suggestion, NOT truth
■ 2. AUTO-SELECTION LOGIC
Use:
if (autoSelected === true) {
auto-fill issueType
} else {
force user to select manually
}
■ 3. CONFIDENCE THRESHOLD (IMPORTANT)
Backend rule:
confidence >= 0.7 → autoSelected
Frontend must:
visually indicate confidence
allow override
■ 4. ALWAYS SHOW DROPDOWN
Even if auto-selected:
user must be able to change
■ 5. STORE issueTypeId
After prediction:
{
"issueTypeId": 1
}
■ This is what you send in issue creation
■ 6. FILE HANDLING
MUST DO:
validate file type (image only)
limit size (frontend)
MUST NOT:
■ send empty file
■ send base64 unless required
■ ERROR CASES
■ 1. No File
{
"success": false,
"message": "Image file is required"
}
{
■ 2. AI Service Down
"success": false,
"message": "AI service unavailable"
}
{
■ 3. Empty AI Response
"success": false,
"message": "AI service returned empty response"
}
■ FRONTEND ERROR HANDLING
Scenario■Action
AI fails■fallback to manual selection
confidence low■ask user
mapping fails■show dropdown
■ CRITICAL EDGE CASES
■■ 1. issueTypeId = null
{
"issue": "unknown",
"issueTypeId": null,
"autoSelected": false
}
■ Frontend MUST:
NOT auto-select
force manual selection
■■ 2. confidence = null
Backend:
confidence = 0.0
■ autoSelected = false
■■ 3. AI returns unknown label
Mapping may fail → issueTypeId null
■ PERFORMANCE & UX RULES
1. DO NOT AUTO CALL
■ Wrong:
call AI immediately on image select
■ Correct:
user confirms upload → then call
2. SHOW LOADING STATE
AI call is external → may be slow
3. RETRY OPTION
Allow retry if:
AI fails
network error
4. TIMEOUT UX
If AI is slow:
fallback to manual

■ ANALYTICS MODULE (ADMIN / OFFICIAL / SUPERIOR) — FULL API DOCUMENTATION
■ GLOBAL RULES
■ AUTH REQUIRED (ALL APIs)
Authorization: Bearer <JWT>
■ ROLE-BASED ENDPOINT SEGREGATION
Role■Base Path
ADMIN■/admin/issues
OFFICIAL■/official/issues
WARD_SUPERIOR■/superior/issues
■ You CANNOT mix these
■ Backend enforces role strictly
■ RESPONSE FORMAT
{
"success": true,
"message": "...",
"data": ...
}
================================
■ ADMIN APIs
================================
1■■ FILTER ISSUES (ADMIN)
■ Endpoint
GET /admin/issues
■ Query Params
Param■Required■Description
wardId■■■filter by ward
departmentId■■■filter by department
reportedBy■■■filter by user
status■■■IssueStatus enum
■ Pagination
Param■Default
page■0
size■10
sort■createdAt DESC
■ Example
GET /admin/issues?wardId=2&status=ASSIGNED&page=0&size=10
■ BACKEND LOGIC
uses:
filterIssues(...)
ADMIN:
■ no restriction → full access
■ Response
{
"data": {
"content": [ IssueResponse ],
"totalElements": 100,
"totalPages": 10
}
}
■ FRONTEND RULES
MUST DO:
1. Implement pagination properly
use:
page, size
2. Use ENUM for status
ASSIGNED
IN_PROGRESS
RESOLVED
ESCALATED
MUST NOT:
■ fetch all data at once
■ hardcode filters
■■ RATE LIMIT
@RateLimiter(name = "issueFilterLimiter")
■ Too many calls → blocked
================================
2■■ ADMIN DASHBOARD
================================
■ Endpoint
GET /admin/issues/dashboard
■ Purpose
System-level stats
■ Response
{
"data": {
"totalCitizens": 100,
"totalOfficials": 20,
"totalWardSuperiors": 5,
"totalIssues": 500
}
}
■ FRONTEND RULES
MUST DO:
load once on dashboard
cache (backend already cached)
MUST NOT:
■ call repeatedly
================================
■ OFFICIAL APIs
================================
3■■ FILTER OFFICIAL ISSUES
■ Endpoint
GET /official/issues
■ Query Params
Param■Required
reportedBy■■
status■■
■ BACKEND ENFORCEMENT
■ IGNORE frontend ward/department
Backend forces:
official.wardId
official.departmentId
■ FRONTEND RULES
MUST DO:
DO NOT send wardId
DO NOT send departmentId
MUST NOT:
■ try to override filters
■ assume global data
■ Response
Same as admin (paginated)
================================
4■■ OFFICIAL DASHBOARD
================================
■ Endpoint
GET /official/issues/dashboard
■ Response
{
"data": {
"totalAssigned": 10,
"totalInProgress": 5,
"totalResolved": 20,
"totalEscalated": 2
}
}
■ FRONTEND RULES
MUST DO:
use for official homepage
MUST NOT:
■ mix with admin data
================================
■ WARD SUPERIOR APIs
================================
5■■ FILTER WARD ISSUES
■ Endpoint
GET /superior/issues
■ Query Params
Param■Required
departmentId■■
reportedBy■■
status■■
■ BACKEND ENFORCEMENT
ward locked to:
superior.wardId
■ FRONTEND RULES
MUST DO:
allow department filter
MUST NOT:
■ send wardId
================================
6■■ SUPERIOR DASHBOARD
================================
■ Endpoint
GET /superior/issues/dashboard
■ Response
{
"data": {
"totalEscalated": 8
}
}
■ FRONTEND RULES
USE FOR:
escalation monitoring
■ ISSUE RESPONSE STRUCTURE (IMPORTANT)
You will get:
{
"id": 101,
"title": "...",
"status": "IN_PROGRESS",
"priority": "HIGH",
"assignedOfficialName": "...",
"wardName": "...",
"departmentName": "...",
"softSlaDeadline": "...",
"hardSlaDeadline": "...",
"requiresSupervisorIntervention": true,
"version": 5
}
■ FRONTEND CRITICAL RULES
■ 1. ROLE-BASED UI (MANDATORY)
Role■API
Admin■/admin/issues
Official■/official/issues
Superior■/superior/issues
■ 2. NEVER MIX DATA
■ Official should NOT see admin data
■ Superior should NOT see other wards
■ 3. PAGINATION IS REQUIRED
Backend enforces:
MAX_PAGE_SIZE = 50
■ 4. FILTER COMBINATIONS
Supported:
status only
department only
both
none
■ 5. SLA FIELDS (VERY IMPORTANT)
Use:
softSlaDeadline
hardSlaDeadline
softSlaBreached
hardSlaBreached
■ for UI indicators
■ 6. VERSION FIELD
■ Required for lifecycle actions later
■ EDGE CASES
■ Invalid role
→ access denied
■ Missing official config
"Official configuration invalid"
■ Empty results
→ valid response with empty list
■ Rate limit hit
→ request blocked
■ PERFORMANCE + BEHAVIOR
Backend features:
■ caching (dashboard)
■ audit logging (filter usage)
■ pagination enforced
■ role restriction
Frontend MUST:
DO:
debounce filters
cache responses
paginate
DO NOT:
■ call API repeatedly
■ fetch large pages
■ ignore role restrictions
■ DESIGN FLAWS (HONEST)
■ No bulk export API
■ No advanced sorting options exposed
■ No aggregation per chart (only counts)
■ Filter audit not visible (backend only)
■ FINAL FRONTEND CHECKLIST
MUST IMPLEMENT
■ role-based routing
■ pagination
■ filters UI
■ SLA indicators
■ dashboard usage
MUST NOT
■ mix role APIs
■ bypass filters
■ spam endpoints

■ AUTH MODULE — FULL INTEGRATION DOCUMENTATION
(derived from your actual code, not assumptions)
■ GLOBAL AUTH BEHAVIOR (READ THIS FIRST)
JWT FLOW (Your system reality)
Login → returns JWT
JWT contains ONLY username
No roles in token → roles come from DB via UserDetailsService
Every request:
JwtFilter extracts token
Loads user from DB
Validates token
Injects into Spring Security context
■ Critical Design Reality
No refresh token
No token blacklist
Logout is fake (client-side only)
If frontend assumes real logout → broken logic.
■ HEADERS (FOR ALL PROTECTED APIs)
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
■ ERROR RESPONSE FORMAT (GLOBAL)
{
"success": false,
"message": "Unauthorized",
"data": null,
"status": 401,
"timestamp": "2026-04-06T12:00:00"
}
================================
1■■ LOGIN API
================================
■ Endpoint Overview
Purpose: Authenticate user and issue JWT
Access: Public
Auth Required: ■ No
■ HTTP Details
POST /auth/login
Headers
Content-Type: application/json
■ Request Body
Fields
Field■Type■Required■Validation
identifier■String■■ Yes■Not blank (username OR email)
password■String■■ Yes■Min 8 chars
Example
{
"identifier": "shyam123",
"password": "password123"
}
■ Backend Logic (REAL behavior)
Finds user using:
username OR email
Checks:
User exists
Password matches
Account is active
Generates JWT:
subject = username
■ Success Response
{
"success": true,
"message": "Login successful",
"data": {
"token": "eyJhbGciOiJIUzI1NiIs...",
"user": {
"id": 1,
"username": "shyam123",
"fullName": "Shyam Kumar",
"email": "shyam@gmail.com",
"role": "CITIZEN",
"wardId": 12,
"departmentId": null,
"mobile": "9876543210"
}
},
"status": 200,
"timestamp": "..."
}
■ Error Cases
Scenario■Response
Wrong credentials■400 → "Invalid credentials"
User not found■400
Account deactivated■400 / 500 (bad design)
■ FRONTEND INTEGRATION RULES
MUST DO:
Store:
token
user object
Save in:
localStorage OR secure storage
MUST NOT DO:
■ Do NOT decode JWT for role (not present)
■ Do NOT assume login failure = 401 (it returns 400)
■■ Hidden Issues (You need to fix later)
Deactivated account throws inconsistent exception
No rate limiting → brute force possible
================================
2■■ GET CURRENT USER (/me)
================================
■ Endpoint Overview
Purpose: Get logged-in user details
Access: Authenticated users
Auth Required: ■ Yes
■ HTTP Details
GET /auth/me
Headers
Authorization: Bearer <token>
■ Request Body
■ None
■ Backend Logic
Extracts user from SecurityContext
Validates:
Auth exists
UserPrincipal exists
User is active
■ Success Response
{
"success": true,
"message": "Success",
"data": {
"id": 1,
"username": "shyam123",
"fullName": "Shyam Kumar",
"email": "shyam@gmail.com",
"role": "CITIZEN",
"wardId": 12,
"departmentId": null,
"mobile": "9876543210"
},
"status": 200
}
■ Error Cases
Scenario■Response
No token■401
Invalid token■401
Deactivated user■500 (bad design again)
■ FRONTEND RULES
MUST DO:
Call this on:
app load (if token exists)
Use this to:
restore session
get latest role/data
MUST NOT DO:
■ Don’t trust stored user blindly
■ Always re-sync via /me
■■ Hidden Issue
Throws IllegalStateException → not cleanly mapped → can cause 500
================================
3■■ LOGOUT API
================================
■ Endpoint Overview
Purpose: Placeholder logout
Auth Required: ■ No (but logically yes)
■ HTTP Details
POST /auth/logout
■ Request Body
■ None
■ Response
{
"success": true,
"message": "Logout successful",
"data": null,
"status": 200
}
■ CRITICAL REALITY
This API:
■ DOES NOT invalidate JWT
■ DOES NOT blacklist token
■ DOES NOTHING server-side
■ FRONTEND RULES (VERY IMPORTANT)
REAL logout implementation:
Delete token
Clear user data
Redirect to login
DO NOT:
■ rely on backend logout
■ expect session invalidation
================================
■ SECURITY CONFIG (IMPACT ON FRONTEND)
================================
Public APIs
/auth/login
/users/register
/uploads/**
Protected APIs
Everything else
Role-based restrictions
Endpoint■Role
/admin/**■ADMIN
/issues/*/start■OFFICIAL
/issues/*/resolve■OFFICIAL
/issues/*/reassign■WARD_SUPERIOR
■ HARD BLOCKS
PATCH /issues/** → DENIED
PUT /issues/** → DENIED
/internal/** → DENIED
Frontend MUST NOT call these.
================================
■ JWT FILTER BEHAVIOR
================================
What actually happens:
Extract token from header
Extract username
Load user from DB
Validate token
Set authentication
■■ Edge Cases
Scenario■Result
Invalid token■silently ignored
Missing token■request proceeds → fails later
Expired token■treated as invalid
■ FRONTEND GLOBAL RULES (NON-NEGOTIABLE)
1. Token Handling
Store token securely
Attach in EVERY request
2. Error Handling
Handle these explicitly:
401 → redirect to login
403 → show "Access Denied"
400 → show backend message
3. Session Management
On refresh → call /auth/me
If fails → logout user
4. Role-Based UI
Use user.role from response
NOT from token
5. Retry Logic
If token expired → logout immediately
No refresh mechanism exists
■ MAJOR BACKEND FLAWS (I’m calling this out)
You asked for honesty, so here it is:
■ 1. No refresh token system
→ Users will get kicked out abruptly
■ 2. Logout is fake
→ Security illusion
■ 3. Exception handling is inconsistent
→ Some errors return 400, some 500
■ 4. JWT only contains username
→ Extra DB hit every request
■ 5. No account lock / brute-force protection
■ FINAL INTEGRATION CHECKLIST (FOR YOUR FRIEND)
Before frontend starts:
■ Use /auth/login → store token
■ Use /auth/me → restore session
■ Attach token to ALL APIs
■ Handle 401 / 403 properly
■ Clear token on logout
■ Do NOT depend on logout API
■ Do NOT assume token contains role

■ DEPARTMENT MODULE — FULL API INTEGRATION DOCUMENTATION
■ GLOBAL BEHAVIOR
Access
All APIs are PUBLIC
■ No authentication required
■ Used for:
Admin user creation
Issue classification (later)
Dropdowns
Base URL
/departments
Response Structure
{
"success": true,
"message": "...",
"data": ...
}
================================
1■■ GET ALL DEPARTMENTS
================================
■ Endpoint
GET /departments
■ Purpose
Fetch all departments
Used for:
dropdown selection (admin create user)
filtering
mapping issue → department (future)
■ Request
■ No params
■ No body
■ Response
{
"success": true,
"message": "Departments fetched successfully",
"data": [
{
"id": 1,
"name": "Roads",
"description": "Handles road issues"
},
{
"id": 2,
"name": "Water",
"description": "Water supply issues"
}
]
}
■ FRONTEND RULES
MUST DO:
Cache this data (static reference data)
Load once (app init or admin panel load)
MUST NOT:
■ Call repeatedly
■ Hardcode department list
■■ DESIGN LIMITATION
No pagination → fine (small dataset expected)
================================
2■■ GET DEPARTMENT BY ID
================================
■ Endpoint
GET /departments/{id}
■ Purpose
Fetch specific department details
■ Path Param
Param■Type
id■Integer
■ Response
{
"success": true,
"data": {
"id": 1,
"name": "Roads",
"description": "Handles road issues"
}
}
■ Error Cases
Scenario■Message
Invalid ID■"Department not found"
■ FRONTEND RULES
Use when:
You only have departmentId
Need display name/description
■■ Optimization Tip
If you already fetched /departments,
■ DO NOT call this API again
→ find locally
■ HOW THIS MODULE CONNECTS TO OTHER MODULES
This is where people mess up.
■ ADMIN MODULE
When creating OFFICIAL:
{
"role": "OFFICIAL",
"departmentId": 2
}
■ That 2 MUST come from /departments
■ ISSUE MODULE (IMPORTANT)
Later:
Issue → mapped to department
Assignment → based on department
■ If frontend sends wrong departmentId:
→ wrong official gets assigned
■ FRONTEND INTEGRATION RULES (CRITICAL)
1. Dropdown Handling
Correct flow:
Call /departments
Populate dropdown:
value = id
label = name
2. Data Integrity
MUST DO:
Always use backend IDs
Never use hardcoded IDs
3. Caching Strategy
Cache in:
memory OR
global state (Redux/Context)
4. Error Handling
Code■Action
200■normal
404■show “invalid department”
400■bad request
5. UX Behavior
Disable submit if departments not loaded
Show loader for dropdown
■ COMMON FRONTEND MISTAKES (DON’T DO THIS)
■ Hardcoding departments
→ breaks when DB changes
■ Sending department name instead of ID
→ backend expects integer ID
■ Assuming departmentId optional
→ required for OFFICIAL
■ Not syncing with admin module
→ mismatch causes invalid user creation

■ ISSUE LIFECYCLE MODULE — COMPLETE API DOCUMENTATION
■ GLOBAL RULES
Base URL
/issues
Auth
Authorization: Bearer <JWT>
■ CRITICAL: VERSION (OPTIMISTIC LOCKING)
Every lifecycle API requires:
version
■ If mismatch:
"Version conflict. Refresh required."
■ Frontend MUST:
always send latest version from IssueResponse
refresh before retry
■ STATE MACHINE (NON-NEGOTIABLE)
SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED
↓
ESCALATED → REASSIGNED → ASSIGNED
■ HARD RULE
Frontend MUST NOT attempt invalid transitions.
Backend WILL reject.
================================
1■■ START WORK
================================
■ Endpoint
POST /issues/{id}/start
■ Access
ROLE_OFFICIAL ONLY
■ Purpose
ASSIGNED → IN_PROGRESS
■ Request Body
{
"version": 3
}
■ Backend Logic
must be assigned official
must match version
validates transition
sets:
status = IN_PROGRESS
startedAt = now
■ Response
{
"success": true,
"message": "Work started",
"data": { updatedIssue }
}
■ FRONTEND RULES
MUST DO:
show button ONLY if:
status = ASSIGNED
AND loggedUser = assignedOfficial
MUST NOT:
■ allow other officials
■ allow repeated clicks
================================
2■■ RESOLVE ISSUE
================================
■ Endpoint
POST /issues/{id}/resolve
■ Content-Type
multipart/form-data
■ Access
ROLE_OFFICIAL ONLY
■ Purpose
IN_PROGRESS → RESOLVED
■ Request
Field■Type■Required
version■Long■■
image■file■■
■ Example
formData.append("version", 5);
formData.append("image", file);
■ Backend Logic
only assigned official
validates version
validates:
image exists
image type = image/*
stores resolution image
sets:
status = RESOLVED
resolvedAt
resolvedImageUrl
■ FRONTEND RULES
MUST DO:
require image upload
validate image type before sending
MUST NOT:
■ allow resolve without starting work
■ allow non-assigned user
================================
3■■ REASSIGN ESCALATED ISSUE
================================
■ Endpoint
POST /issues/{id}/reassign
■ Access
ROLE_WARD_SUPERIOR ONLY
■ Purpose
ESCALATED → REASSIGNED
■ Backend Logic
issue must be ESCALATED
superior must belong to same ward
finds new official (smart assignment)
resets:
SLA fields
startedAt
breaches
■ Response
{
"message": "Issue reassigned"
}
■ FRONTEND RULES
MUST DO:
show button ONLY when:
status = ESCALATED
MUST NOT:
■ allow manual reassignment for non-escalated issues
================================
4■■ SUPERVISOR REASSIGN (SOFT SLA)
================================
■ Endpoint
POST /issues/{id}/supervisor-reassign
■ Purpose
ASSIGNED → ASSIGNED (soft SLA breach)
■ Backend Logic
requires:
requiresSupervisorIntervention = true
assigns new official
resets SLA tracking
■ FRONTEND RULES
MUST DO:
show only if:
requiresSupervisorIntervention = true
MUST NOT:
■ expose blindly
================================
5■■ SUPERVISOR CLEAR INTERVENTION
================================
■ Endpoint
POST /issues/{id}/supervisor-clear
■ Purpose
Clear SLA intervention without reassignment
■ Request
{
"version": 5,
"remarks": "Handled internally"
}
■ Backend Logic
resets:
requiresSupervisorIntervention = false
assignedAt = now
■ FRONTEND RULES
MUST DO:
provide remarks input
MUST NOT:
■ allow without intervention flag
■ CRITICAL FRONTEND LOGIC (READ THIS CAREFULLY)
■ 1. VERSION MANAGEMENT (BIGGEST SOURCE OF BUGS)
Every response contains:
"version": 5
■ You MUST:
store latest version
send it in next request
If conflict:
Version conflict → REFRESH ISSUE
■ 2. ROLE-BASED UI CONTROL
Action■Role
start work■OFFICIAL
resolve■OFFICIAL
reassign■SUPERIOR
supervisor actions■SUPERIOR
■ 3. BUTTON VISIBILITY MATRIX
Status■Actions
ASSIGNED■Start Work
IN_PROGRESS■Resolve
ESCALATED■Reassign
ASSIGNED + intervention■Supervisor Reassign / Clear
■ 4. STRICT WORKFLOW ENFORCEMENT
Frontend MUST enforce:
no skipping states
no invalid calls
■ 5. IMAGE HANDLING
resolution requires image
use FormData
■ ERROR CASES
■ Version conflict
"Version conflict. Refresh required."
■ Unauthorized official
"Official not assigned"
■ Invalid transition
"Invalid lifecycle transition"
■ Missing image
"Resolution image is required"
■ Wrong role
AccessDeniedException
■ SYSTEM BEHAVIOR (IMPORTANT)
SLA Impact
reassign → resets SLA
supervisor clear → restarts timer
History Tracking
Every action:
stored in history
shown in IssueResponse
Notifications
Each transition triggers:
reporter notification
official notification
supervisor notification
■ MAJOR DESIGN RISKS (NO FILTER)
■ Frontend not handling version
→ race conditions
■ Wrong UI visibility
→ users hit forbidden APIs
■ No retry logic
→ poor UX on conflicts
■ Heavy response object
→ slow rendering

■ ISSUE MODULE — COMPLETE API INTEGRATION DOCUMENTATION
■ GLOBAL RULES
Auth
■ ALL endpoints require JWT
Authorization: Bearer <token>
Roles
Role■Access
CITIZEN■create, view own, duplicate
ADMIN■(not here directly)
OFFICIAL■(via other modules)
SUPERIOR■(via other modules)
Response Format
{
"success": true,
"message": "...",
"data": ...
}
================================
1■■ CREATE ISSUE
================================
■ Endpoint
POST /issues
■ Content-Type
multipart/form-data
■ Purpose
Create a new issue OR link to existing duplicate
■ Request
Form Data
Field■Type■Required
title■string■■
description■string■■
latitude■double■■
longitude■double■■
issueTypeId■integer■■
image■file■■
■ Example (Frontend)
const formData = new FormData();
formData.append("title", "Pothole on road");
formData.append("description", "Large pothole near signal");
formData.append("latitude", 12.9716);
formData.append("longitude", 77.5946);
formData.append("issueTypeId", 1);
formData.append("image", file);
■ BACKEND FLOW (CRITICAL — UNDERSTAND THIS)
Step 1: Validate user
Must be CITIZEN
else → ■ error
Step 2: Validate IssueType
must exist
must be ACTIVE
Step 3: Location → Geometry
Point(lng, lat)
Step 4: Ward Detection
ST_Contains
■ If no ward → FAIL
Step 5: DUPLICATE DETECTION
If duplicate found:
■ NO new issue created
existing issue:
reportCount++
reporter linked
returns existing issue
■ THIS IS VERY IMPORTANT
Step 6: Assignment
auto-assign official based on:
ward
department
Step 7: Image Upload
mandatory
stored via FileStorageService
Step 8: Notifications + History
ISSUE_CREATED
ISSUE_ASSIGNED
history entries created
Step 9: Async Enrichment
reverse geocoding (after commit)
■ Success Response
Huge object → key fields:
{
"success": true,
"data": {
"id": 101,
"title": "...",
"status": "ASSIGNED",
"priority": "HIGH",
"wardName": "...",
"departmentName": "...",
"assignedOfficialName": "...",
"softSlaDeadline": "...",
"history": [...]
}
}
■ FRONTEND RULES (CRITICAL — DO NOT IGNORE)
■ 1. DUPLICATE CASE HANDLING
Backend may:
return existing issue
■ Frontend MUST:
detect:
if (reportCount > 1)
show:
■ “Issue already exists, you’ve been linked”
■ 2. DO NOT SEND MANUAL WARD/DEPARTMENT
■ NEVER send:
wardId
departmentId
Backend derives them
■ 3. IMAGE IS MANDATORY
If missing → request fails
■ 4. LOCATION MUST BE VALID
Use:
Ward lookup API BEFORE submission
■ 5. ISSUE TYPE MUST BE VALID
use IssueType module
do NOT hardcode
■ 6. HANDLE AUTO ASSIGNMENT
If:
status = ASSIGNED
■ show:
assigned official info
■ 7. ASYNC ADDRESS
Address fields may:
be null initially
populate later
================================
2■■ GET ISSUE BY ID
================================
■ Endpoint
GET /issues/{id}
■ Purpose
Fetch full issue details
■ ACCESS CONTROL
CITIZEN → only own issue
else → ■ unauthorized
■ Response
Full object including:
lifecycle
SLA
history
assignment
■ FRONTEND RULES
MUST DO:
Use for:
detail page
MUST HANDLE:
SLA fields:
softSlaDeadline
hardSlaDeadline
softSlaBreached
Timeline:
history[]
MUST NOT:
■ assume visibility for all users
================================
3■■ GET MY ISSUES (PAGINATED)
================================
■ Endpoint
GET /issues/my
■ Query Params
Param■Default
page■0
size■10
sortBy■createdAt
direction■DESC
■ Response
{
"data": {
"content": [...],
"totalPages": 5,
"totalElements": 50
}
}
■ SPECIAL: RATE LIMITER
@RateLimiter(name = "issueFilterLimiter")
■ Too many requests → blocked
■ FRONTEND RULES
MUST DO:
implement pagination UI
MUST NOT:
■ spam API (infinite scroll without debounce)
HANDLE:
rate limit errors
================================
4■■ CITIZEN DASHBOARD
================================
■ Endpoint
GET /issues/dashboard
■ Response
{
"data": {
"totalReported": 10,
"totalResolved": 4,
"totalAssignedOrInProgress": 5,
"totalEscalated": 1
}
}
■ FRONTEND RULES
USE FOR:
dashboard stats
MUST:
refresh periodically
================================
5■■ LINK DUPLICATE
================================
■ Endpoint
POST /issues/{id}/duplicate
■ Purpose
Manually link user to existing issue
■ Backend Logic
only CITIZEN
increments reportCount
prevents duplicate linking
■ Response
{
"message": "Duplicate linked successfully"
}
■ FRONTEND RULES
USE CASE:
“This issue already exists” button
MUST:
disable button if already linked
■ STATUS FLOW (VERY IMPORTANT)
Your system uses:
SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED
↓
FRONTEND MUST:
reflect status visually
NOT allow invalid transitions
■ SLA LOGIC (CRITICAL)
Fields:
Field■Meaning
softSlaDeadline■warning
hardSlaDeadline■breach
softSlaBreached■warning triggered
hardSlaBreached■critical
FRONTEND MUST:
show countdown
highlight breaches
■ MAJOR EDGE CASES
■ Duplicate issue
ESCALATED → REASSIGNED → ASSIGNED
→ returns existing
■ Location outside ward
→ FAIL
■ Invalid issue type
→ FAIL
■ Unauthorized access
→ FAIL
■ Missing image
→ FAIL

■ SLA ANALYTICS MODULE — COMPLETE API DOCUMENTATION
■ GLOBAL RULES
Base URL
/analytics
■ AUTHORIZATION (STRICT)
ROLE_ADMIN
ROLE_WARD_SUPERIOR
■ No other roles allowed
■ ROLE-BASED DATA ACCESS (CRITICAL)
Role■Access Scope
ADMIN■All wards
WARD_SUPERIOR■ONLY their ward
■ HARD RULE
If ward superior tries:
?wardId=otherWard
■ Backend throws:
"Ward superior cannot access other wards"
Response Format
{
"success": true,
"message": "...",
"data": { analytics }
}
================================
1■■ GET OVERALL ANALYTICS
================================
■ Endpoint
GET /analytics/sla
■ Purpose
Get global SLA analytics
■ Request
■ No params
■ Response
{
"data": {
"totalIssues": 100,
"assignedIssues": 20,
"inProgressIssues": 30,
"resolvedIssues": 40,
"escalatedIssues": 10,
"softSlaBreaches": 15,
"hardSlaBreaches": 5,
"supervisorInterventionRequired": 3,
"averageAcknowledgementMinutes": 45.5,
"averageResolutionMinutes": 120.3,
"escalationRatePercentage": 10.0,
"reassignmentRatePercentage": 5.0,
"slaCompliancePercentage": 85.0
}
}
■ BACKEND LOGIC
pulls raw counts
calculates:
escalation rate
reassignment rate
SLA compliance
■ FRONTEND RULES
MUST DO:
use for dashboard summary
MUST NOT:
■ assume percentages sum to 100
■ assume non-zero values
================================
2■■ FILTERED ANALYTICS
================================
■ Endpoint
POST /analytics/sla/filter
■ Purpose
Custom analytics with:
ward
department
date range
■ Request Body
{
"wardId": 1,
"departmentId": 2,
"fromDate": "2026-04-01T00:00:00",
"toDate": "2026-04-30T23:59:59"
}
■ FIELD RULES
Field■Required
wardId■optional
departmentId■optional
fromDate■optional
toDate■optional
■ BACKEND BEHAVIOR
uses DB projection
null-safe handling
computes metrics same as overall
■ FRONTEND RULES
MUST DO:
1. Date Validation
fromDate ≤ toDate
2. Use ISO format
YYYY-MM-DDTHH:mm:ss
3. Filter Combination
can combine:
ward + department
only department
only date
MUST NOT:
■ send invalid date format
■ send future dates blindly
================================
3■■ LAST 7 DAYS ANALYTICS
================================
■ Endpoint
GET /analytics/last7
■ Query Params
Param■Required
wardId■optional
departmentId■optional
■ BACKEND BEHAVIOR
internally creates:
last 7 days range
■ ROLE LOGIC
ADMIN
can pass wardId
SUPERIOR
wardId forced to own ward
■ FRONTEND RULES
MUST DO:
use for quick charts (weekly)
MUST NOT:
■ send invalid wardId for superior
================================
4■■ LAST 30 DAYS ANALYTICS
================================
■ Endpoint
GET /analytics/last30
■ Same behavior as last7
■ FRONTEND RULES
USE FOR:
monthly trends
■ FIELD MEANING (VERY IMPORTANT)
Core Counts
Field■Meaning
totalIssues■total created
assignedIssues■ASSIGNED
inProgressIssues■IN_PROGRESS
resolvedIssues■RESOLVED
escalatedIssues■ESCALATED
SLA Metrics
Field■Meaning
softSlaBreaches■warning breaches
hardSlaBreaches■critical breaches
supervisorInterventionRequired■flagged issues
Averages
Field■Meaning
avgAcknowledgement■assign delay
avgResolution■total resolution time
Percentages
Field■Formula
escalationRate■escalated / total
reassignmentRate■reassigned / total
slaCompliance■(resolved - hard breaches) / total
■ FRONTEND VISUALIZATION RULES
1. DO NOT SHOW RAW NUMBERS ONLY
You must:
use charts
show percentages
2. HANDLE ZERO DATA
If:
totalIssues = 0
■ ALL percentages = 0
3. FORMAT NUMBERS
round percentages (2 decimal)
show units:
minutes
%
4. USE COLORS
Metric■Color
SLA compliance■green
breaches■red
escalations■orange
■ EDGE CASES
■ No data
all values = 0
■ Null averages
Backend converts:
null → 0
■ Unauthorized
AccessDeniedException
■ PERFORMANCE NOTES
■■ Heavy DB aggregation
avoid frequent calls
cache results
■ FRONTEND RULES
MUST DO:
debounce filters
cache results
MUST NOT:
■ call API on every keystroke
■ spam requests
■ DESIGN FLAWS (NO FILTER)
■ No pagination (fine)
■ No trend breakdown (only aggregate)
■ No per-day data (limits charts)
■ No caching backend
■ No export support
■ FINAL FRONTEND CHECKLIST
MUST IMPLEMENT
■ role-based filtering
■ date validation
■ charts (not raw JSON dump)
■ caching
■ loading states
MUST NOT DO
■ allow invalid ward access
■ spam filter API
■ show misleading percentages

■ ISSUE TYPE MODULE — FULL API INTEGRATION DOCUMENTATION
■ GLOBAL BEHAVIOR
Public APIs
/issue-types/**
■ No auth required
Admin APIs
/admin/issue-types/**
■ Requires:
ROLE_ADMIN
Response Structure
{
"success": true,
"message": "...",
"data": ...
}
================================
1■■ GET ISSUE TYPES (FILTERABLE)
================================
■ Endpoint
GET /issue-types
■ Query Params (Optional)
Param■Type■Required■Purpose
departmentId■Integer■■■Filter by department
■ Behavior
If departmentId NOT provided → returns ALL ACTIVE issue types
If provided → returns ACTIVE issue types for that department
■ Only active = true returned
■ Example
GET /issue-types
GET /issue-types?departmentId=2
■ Response
{
"success": true,
"message": "Issue types fetched successfully",
"data": [
{
"id": 1,
"name": "POTHOLE",
"displayName": "Pothole",
"normalizedName": "pothole",
"departmentId": 1,
"departmentName": "Roads",
"slaHours": 24,
"priority": "HIGH",
"active": true,
"description": "Road damage"
}
]
}
■ FRONTEND RULES (CRITICAL)
■ 1. USE displayName, NOT name
Field■Use
name■internal
displayName■UI
normalizedName■AI
■ If you show name, UI will look bad (POTHOLE)
■ 2. FILTER BY DEPARTMENT
Correct flow:
Select department
Call:
/issue-types?departmentId=X
■ DO NOT load all and filter manually
■ 3. ACTIVE ONLY
Backend already filters:
■ No need to filter inactive on frontend
■ 4. CACHING
Cache per department
Avoid repeated calls
■■ Edge Cases
Scenario■Result
Invalid departmentId■empty list
No issue types■empty list
================================
2■■ GET ISSUE TYPE BY ID
================================
■ Endpoint
GET /issue-types/{id}
■ Purpose
Fetch single issue type details
■ Response
{
"success": true,
"message": "Issue type fetched",
"data": { ...issueType }
}
■ Error
Scenario■Message
Not found■"IssueType not found"
■ FRONTEND RULES
Use only when necessary
Prefer cached list
================================
3■■ CREATE ISSUE TYPE (ADMIN)
================================
■ Endpoint
POST /admin/issue-types
■ Request Body
Field■Required■Notes
name■■■unique
departmentId■■■must exist
slaHours■■■> 0
priority■■■ENUM
description■■■
■ Example
{
"name": "POTHOLE",
"departmentId": 1,
"slaHours": 24,
"priority": "HIGH",
"description": "Road damage"
}
■ Backend Logic
Checks:
unique name (case-insensitive)
Converts:
priority → enum
Sets:
createdAt
■ Response
{
"success": true,
"message": "Issue type created successfully",
"data": { ...issueType }
}
■ Errors
Scenario■Message
Duplicate name■"Issue type already exists"
Invalid department■"Department not found"
Invalid priority■crash or error
■ FRONTEND RULES
MUST DO:
Use dropdown for:
department
priority
MUST NOT:
■ Allow free-text priority
■ Send lowercase priority (high will fail)
■■ CRITICAL ISSUE
IssuePriority.valueOf(req.getPriority())
■ Case-sensitive
■ Frontend MUST send:
HIGH / MEDIUM / LOW
================================
4■■ UPDATE ISSUE TYPE (ADMIN)
================================
■ Endpoint
PUT /admin/issue-types/{id}
■ Request Body (ALL OPTIONAL)
Field■Notes
departmentId■must exist
slaHours■> 0
priority■enum
description■optional
■ Backend Logic
Partial update
Validates:
department exists
priority valid
■ Response
{
"success": true,
"message": "Issue type updated successfully",
"data": { ...updated }
}
■ FRONTEND RULES
MUST DO:
Send only changed fields
MUST NOT:
■ Send invalid priority
■ Assume full replace (it’s partial update)
================================
5■■ CHANGE STATUS (ACTIVATE/DEACTIVATE)
================================
■ Endpoint
PATCH /admin/issue-types/{id}/status?active=true
■ Purpose
Enable/disable issue type
■ Behavior
Sets:
it.setActive(active)
■ Response
{
"success": true,
"message": "Status updated successfully"
}
■ FRONTEND RULES
MUST DO:
Use toggle switch UI
MUST NOT:
■ Delete issue types → use deactivate instead
■■ CRITICAL SYSTEM BEHAVIOR
Inactive issue types:
■ Not returned in /issue-types
■ Cannot be selected in UI
■ SYSTEM-LEVEL CONNECTIONS
■ ISSUE MODULE (VERY IMPORTANT)
IssueType controls:
SLA (slaHours)
Priority
Department mapping
■ If frontend sends wrong issueTypeId:
→ wrong SLA
→ wrong assignment
→ broken escalation
■ AI MODULE
Fields used:
Field■Purpose
normalizedName■AI matching
displayName■UI
■ FRONTEND INTEGRATION RULES (CRITICAL)
1. Selection Flow (MANDATORY)
Correct flow:
Select Department → Fetch Issue Types → Select Issue Type
2. NEVER SKIP FILTERING
■ Wrong:
Load all issue types once
■ Correct:
Filter by department
3. STORE FULL OBJECT
When selected:
{
id,
departmentId,
slaHours,
priority
}
■ Needed later for issue creation
4. VALIDATION
Prevent submission if:
no issue type selected
no department selected
5. DISPLAY
Use:
displayName

■ GLOBAL BEHAVIOR (USER MODULE)
All /users/** except /register require JWT
Only CITIZEN role allowed for most operations
Backend enforces:
uniqueness (email, username, mobile)
password validation
role restriction (hard enforced)
================================
1■■ REGISTER USER
================================
■ Endpoint Overview
Purpose: Register a new citizen
Access: Public
Auth Required: ■ No
Role Assigned: Always CITIZEN
■ HTTP Details
POST /users/register
■ Request Body
Field■Type■Required■Validation
username■String■■■Not blank
fullName■String■■■Not blank
email■String■■■Valid email
mobile■String■■■Not blank
password■String■■■Min 8 chars
confirmPassword■String■■■Must match password
Example
{
"username": "shyam123",
"fullName": "Shyam Kumar",
"email": "shyam@gmail.com",
"mobile": "9876543210",
"password": "password123",
"confirmPassword": "password123"
}
■ Backend Logic (IMPORTANT)
Checks:
password == confirmPassword
username unique
email unique
mobile unique
Creates:
role = CITIZEN
active = true
Triggers:
notification (async side-effect)
■ Success Response
{
"success": true,
"message": "User registered successfully",
"data": {
"id": 1,
"username": "shyam123",
"fullName": "Shyam Kumar",
"email": "shyam@gmail.com",
"role": "CITIZEN",
"wardId": null,
"departmentId": null,
"mobile": "9876543210"
},
"status": 200
}
■ Error Cases
Scenario■Message
Username exists■"Username already exists"
Email exists■"Email already exists"
Mobile exists■"Mobile already exists"
Password mismatch■"Passwords do not match"
■ FRONTEND RULES
MUST DO:
Validate password match BEFORE API call
Show specific backend errors
MUST NOT:
■ Assume success = auto login (it DOES NOT return token)
■ Allow duplicate submission (double-click issue)
■■ Hidden Issue
No strong mobile validation (any string allowed)
================================
2■■ GET CURRENT USER
================================
■ Endpoint
GET /users/me
■ Auth
■ Required
■ Behavior
Returns logged-in user from security context
■ Response
Same structure as register/login user object
■ FRONTEND RULES
Use this for:
profile page
session validation
■■ Reality
You now have TWO /me endpoints:
/auth/me
/users/me
■ This is bad design. Redundant. Pick one.
================================
3■■ UPDATE PROFILE
================================
■ Endpoint
PATCH /users/me
■ Auth
■ Required
Role: CITIZEN only
■ Request Body (ALL OPTIONAL)
Field■Type■Validation
fullName■String■optional
email■String■valid email
mobile■String■optional
Example
{
"fullName": "Shyam Updated",
"email": "new@gmail.com"
}
■ Backend Logic
Only updates non-null fields
Checks:
email uniqueness
mobile uniqueness
■ Response
{
"success": true,
"message": "Profile updated",
"data": { ...updated user... }
}
■ FRONTEND RULES
MUST DO:
Send ONLY changed fields
Handle duplicate errors properly
MUST NOT:
■ Send full object blindly
■ Overwrite with stale data
■■ Critical Edge Case
If frontend sends:
{
"email": "same_old_email"
}
→ No issue (safe)
But if:
{
"email": "existing_other_user_email"
}
→ HARD FAIL
================================
4■■ CHANGE PASSWORD
================================
■ Endpoint
PATCH /users/me/password
■ Auth
■ Required
Role: CITIZEN
■ Request Body
Field■Required■Validation
oldPassword■■■must match DB
newPassword■■■min 8
confirmNewPassword■■■must match
Example
{
"oldPassword": "old12345",
"newPassword": "new12345",
"confirmNewPassword": "new12345"
}
■ Backend Logic
Verifies:
old password correct
new == confirm
Updates hashed password
Sends notification
■ Response
{
"success": true,
"message": "Password changed successfully"
}
■ FRONTEND RULES
MUST DO:
Validate new passwords match BEFORE API
Force logout after success (important)
MUST NOT:
■ Keep old token active blindly
■■ SECURITY GAP
Token is NOT invalidated after password change
■ Meaning: old token still works
■ This is a real security flaw
================================
5■■ DEACTIVATE ACCOUNT
================================
■ Endpoint
PATCH /users/me/deactivate
■ Behavior
Sets:
active = false
Clears security context
■ Response
{
"success": true,
"message": "Account deactivated"
}
■ FRONTEND RULES
MUST DO:
Immediately logout user
Redirect to login
■■ Critical Behavior
After this:
Login will fail
/auth/me will fail
================================
6■■ DELETE ACCOUNT
================================
■ Endpoint
DELETE /users/me
■ Behavior
Deletes user permanently
Sends notification (separate transaction)
Clears session
■ Response
{
"success": true,
"message": "Account deleted"
}
■ FRONTEND RULES
MUST DO:
Show confirmation dialog (this is irreversible)
Clear all local data
■■ CRITICAL RISK
No soft delete
No recovery
Data gone permanently
■ GLOBAL FRONTEND INTEGRATION RULES
1. Role Handling
Only CITIZEN can call these APIs
Hide UI for other roles
2. Token Handling
Always attach JWT
If 401 → logout immediately
3. Error Handling
Code■Meaning■Action
400■Validation error■Show message
401■Unauthorized■Logout
403■Forbidden■Block UI
4. State Sync
After ANY update:
Refresh user via /users/me
5. Notification Side Effects
These APIs trigger:
registration email
password change email
deletion email
Frontend DOES NOT need to handle this.