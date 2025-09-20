# Backend Documentation - ManufactureERP

## 🔧 Server Functions & API Reference

### 🔐 Authentication Routes (/api/auth)

#### **auth.js - Authentication Management**

##### **POST /signup**
- **validateSignupInput()** - Purpose: Validates user registration data | Output: Validation errors/success
- **checkEmailExists()** - Purpose: Prevents duplicate email registration | Output: Boolean email availability
- **hashPassword()** - Purpose: Encrypts password using bcrypt | Output: Hashed password string
- **createUser()** - Purpose: Stores new user in database | Output: User creation result
- **sendVerificationEmail()** - Purpose: Sends email confirmation to new user | Output: Email sending status

##### **POST /login**
- **validateLoginCredentials()** - Purpose: Checks email and password format | Output: Validation result
- **findUserByEmail()** - Purpose: Retrieves user from database | Output: User document/null
- **comparePassword()** - Purpose: Verifies password against hash | Output: Boolean match result
- **generateJWT()** - Purpose: Creates authentication token | Output: JWT token string
- **updateLastLogin()** - Purpose: Records user login timestamp | Output: Database update result

##### **GET /verify/:token**
- **validateVerificationToken()** - Purpose: Checks email verification token validity | Output: Token validation result
- **activateUser()** - Purpose: Sets user account as verified | Output: Account activation status
- **redirectToLogin()** - Purpose: Redirects to login page after verification | Output: Browser redirect

##### **POST /forgot**
- **generateResetToken()** - Purpose: Creates password reset token | Output: Reset token string
- **sendResetEmail()** - Purpose: Emails password reset link | Output: Email sending confirmation
- **storeResetToken()** - Purpose: Saves reset token to database | Output: Token storage result

##### **POST /reset/:token**
- **validateResetToken()** - Purpose: Verifies password reset token | Output: Token validity check
- **updatePassword()** - Purpose: Updates user password in database | Output: Password update result
- **clearResetToken()** - Purpose: Removes used reset token | Output: Token cleanup status

##### **GET /profile** (Protected)
- **extractUserFromToken()** - Purpose: Gets user info from JWT | Output: User profile data
- **fetchUserProfile()** - Purpose: Retrieves complete user information | Output: User profile object

##### **PUT /profile** (Protected)
- **validateProfileUpdate()** - Purpose: Validates profile modification data | Output: Validation result
- **updateUserProfile()** - Purpose: Modifies user profile in database | Output: Update confirmation

##### **PUT /change-password** (Protected)
- **validatePasswordChange()** - Purpose: Checks current and new password | Output: Validation result
- **verifyCurrentPassword()** - Purpose: Confirms existing password | Output: Boolean verification
- **updateUserPassword()** - Purpose: Sets new password in database | Output: Password change result

### 👥 User Management Routes (Admin Only)

##### **GET /users** (Admin)
- **fetchAllUsers()** - Purpose: Retrieves complete user list | Output: Users array
- **excludePasswordHashes()** - Purpose: Removes sensitive data from response | Output: Safe user data
- **sortUsersByCreationDate()** - Purpose: Orders users by registration date | Output: Sorted users list

##### **POST /users** (Admin)
- **validateUserCreation()** - Purpose: Validates admin user creation data | Output: Validation result
- **checkAdminPermissions()** - Purpose: Verifies admin role for user creation | Output: Permission check
- **createUserByAdmin()** - Purpose: Creates user with admin privileges | Output: User creation result
- **markUserAsVerified()** - Purpose: Auto-verifies admin-created users | Output: Verification status

##### **PUT /users/:id** (Admin)
- **validateUserUpdate()** - Purpose: Validates user modification request | Output: Validation result
- **preventSelfDeactivation()** - Purpose: Stops admin from deactivating own account | Output: Safety check
- **updateUserByAdmin()** - Purpose: Modifies user via admin panel | Output: User update result

##### **DELETE /users/:id** (Admin)
- **validateUserDeletion()** - Purpose: Checks if user can be deleted | Output: Deletion validation
- **preventSelfDeletion()** - Purpose: Stops admin from deleting own account | Output: Safety check
- **deleteUserByAdmin()** - Purpose: Removes user from system | Output: Deletion confirmation

##### **GET /admin/stats** (Admin)
- **calculateUserStats()** - Purpose: Computes user count by role | Output: User statistics object
- **aggregateUsersByRole()** - Purpose: Groups users by role assignment | Output: Role distribution data
- **getSystemMetrics()** - Purpose: Retrieves server performance data | Output: System statistics
- **getMockManufacturingStats()** - Purpose: Returns placeholder manufacturing data | Output: Manufacturing metrics

### 🗄️ Database Models

#### **User.js - User Schema**
- **name** - Purpose: Stores user full name | Type: String, required
- **email** - Purpose: Unique user identifier | Type: String, required, unique
- **password** - Purpose: Encrypted password storage | Type: String, required
- **role** - Purpose: User access level (admin/manager/operator/inventory) | Type: String, enum
- **isActive** - Purpose: Account activation status | Type: Boolean, default: true
- **createdAt** - Purpose: Account creation timestamp | Type: Date, auto-generated
- **lastLogin** - Purpose: Last login timestamp | Type: Date, optional

#### **Department.js - Department Schema**
- **name** - Purpose: Department name identifier | Type: String, required
- **code** - Purpose: Department abbreviation code | Type: String, unique
- **description** - Purpose: Department purpose description | Type: String
- **manager** - Purpose: Department head user reference | Type: ObjectId ref User
- **isActive** - Purpose: Department operational status | Type: Boolean, default: true

#### **Machine.js - Machine Schema**
- **name** - Purpose: Machine identifier name | Type: String, required
- **code** - Purpose: Machine unique code | Type: String, unique
- **department** - Purpose: Department assignment reference | Type: ObjectId ref Department
- **status** - Purpose: Machine operational state | Type: String, enum
- **capacity** - Purpose: Machine production capacity | Type: Number
- **specifications** - Purpose: Technical specifications object | Type: Object

#### **Material.js - Material Schema**
- **name** - Purpose: Material name identifier | Type: String, required
- **code** - Purpose: Material SKU/code | Type: String, unique
- **unit** - Purpose: Measurement unit (kg, pcs, etc.) | Type: String, required
- **category** - Purpose: Material classification | Type: String
- **costPerUnit** - Purpose: Unit cost for costing | Type: Number
- **reorderLevel** - Purpose: Minimum stock threshold | Type: Number

#### **Product.js - Product Schema**
- **name** - Purpose: Product name identifier | Type: String, required  
- **code** - Purpose: Product SKU/code | Type: String, unique
- **description** - Purpose: Product details | Type: String
- **category** - Purpose: Product classification | Type: String
- **sellingPrice** - Purpose: Product sale price | Type: Number
- **isActive** - Purpose: Product availability status | Type: Boolean, default: true

#### **BillOfMaterial.js - BOM Schema**
- **product** - Purpose: Product reference | Type: ObjectId ref Product
- **version** - Purpose: BOM version number | Type: String
- **materials** - Purpose: Required materials array | Type: Array of objects
- **totalCost** - Purpose: Calculated BOM cost | Type: Number
- **isActive** - Purpose: BOM validity status | Type: Boolean, default: true

#### **ManufacturingOrder.js - MO Schema**
- **orderNumber** - Purpose: Unique order identifier | Type: String, required
- **product** - Purpose: Product to manufacture | Type: ObjectId ref Product
- **quantity** - Purpose: Quantity to produce | Type: Number, required
- **status** - Purpose: Order progress state | Type: String, enum
- **plannedStartDate** - Purpose: Scheduled start date | Type: Date
- **plannedEndDate** - Purpose: Scheduled completion date | Type: Date
- **createdBy** - Purpose: Order creator reference | Type: ObjectId ref User

#### **WorkOrder.js - WO Schema**
- **workOrderNumber** - Purpose: Unique work order identifier | Type: String, required
- **manufacturingOrder** - Purpose: Parent MO reference | Type: ObjectId ref ManufacturingOrder
- **machine** - Purpose: Assigned machine reference | Type: ObjectId ref Machine
- **operator** - Purpose: Assigned operator reference | Type: ObjectId ref User
- **operation** - Purpose: Operation description | Type: String, required
- **status** - Purpose: Work order status | Type: String, enum
- **estimatedTime** - Purpose: Expected duration in hours | Type: Number
- **actualTime** - Purpose: Actual duration in hours | Type: Number

#### **StockLedger.js - Stock Schema**
- **material** - Purpose: Material reference | Type: ObjectId ref Material
- **transactionType** - Purpose: Transaction type (in/out/adjustment) | Type: String, enum
- **quantity** - Purpose: Transaction quantity | Type: Number, required
- **unitCost** - Purpose: Cost per unit | Type: Number
- **referenceType** - Purpose: Source document type | Type: String
- **referenceId** - Purpose: Source document ID | Type: ObjectId
- **createdBy** - Purpose: Transaction creator | Type: ObjectId ref User
- **createdAt** - Purpose: Transaction timestamp | Type: Date

### 🔒 Middleware Functions

#### **auth.js - Authentication Middleware**

##### **authenticateToken()**
- **Purpose**: Verifies JWT token in request headers | **Output**: Authenticated user object in req.user
- **extractToken()** - Purpose: Gets token from Authorization header | Output: JWT token string
- **verifyJWT()** - Purpose: Validates token signature and expiry | Output: Decoded token payload
- **attachUserToRequest()** - Purpose: Adds user data to request object | Output: Enhanced request object

##### **authorizeRoles(...roles)**
- **Purpose**: Restricts access based on user roles | **Output**: Access granted/denied response
- **checkUserRole()** - Purpose: Compares user role with allowed roles | Output: Boolean permission result
- **sendAccessDenied()** - Purpose: Returns 403 error for unauthorized access | Output: Access denied response

##### **requireAdmin()**
- **Purpose**: Ensures only admin users can access endpoint | **Output**: Admin access validation
- **verifyAdminRole()** - Purpose: Checks if user has admin privileges | Output: Boolean admin status

##### **requireManagerOrAdmin()**
- **Purpose**: Allows access to managers and admins only | **Output**: Management access validation
- **checkManagementRoles()** - Purpose: Verifies manager or admin role | Output: Boolean management status

##### **requireManufacturingAccess()**
- **Purpose**: Grants access to manufacturing operations | **Output**: Manufacturing permission check
- **validateManufacturingRoles()** - Purpose: Checks admin/manager/operator roles | Output: Boolean manufacturing access

##### **requireInventoryAccess()**
- **Purpose**: Allows inventory-related operations | **Output**: Inventory permission validation
- **validateInventoryRoles()** - Purpose: Checks admin/manager/inventory roles | Output: Boolean inventory access

### 🌐 Server Configuration

#### **index.js - Server Setup**
- **configureExpress()** - Purpose: Sets up Express.js application | Output: Configured Express app
- **setupCORS()** - Purpose: Configures cross-origin requests | Output: CORS middleware
- **connectMongoDB()** - Purpose: Establishes database connection | Output: Database connection status
- **setupMiddleware()** - Purpose: Configures request parsing middleware | Output: Middleware stack
- **defineRoutes()** - Purpose: Sets up API endpoint routing | Output: Route configuration
- **startServer()** - Purpose: Launches server on specified port | Output: Running server instance
- **handleGracefulShutdown()** - Purpose: Manages server shutdown process | Output: Clean shutdown

#### **Database Connection**
- **mongoose.connect()** - Purpose: Connects to MongoDB database | Output: Database connection
- **handleConnectionErrors()** - Purpose: Manages database connection issues | Output: Error handling
- **setupConnectionEvents()** - Purpose: Listens for database events | Output: Connection monitoring

### 📧 Email Services

#### **Email Utilities**
- **createTransporter()** - Purpose: Sets up nodemailer SMTP transporter | Output: Email transporter object
- **sendEmail()** - Purpose: Sends email with specified content | Output: Email delivery status
- **generateVerificationEmail()** - Purpose: Creates account verification email | Output: HTML email content
- **generateResetEmail()** - Purpose: Creates password reset email | Output: HTML email content
- **generateWelcomeEmail()** - Purpose: Creates welcome email for new users | Output: HTML email content

### 🔧 Helper Functions

#### **Validation Utilities**
- **validateEmail()** - Purpose: Checks email format validity | Output: Boolean validation result
- **validatePassword()** - Purpose: Ensures password meets security requirements | Output: Boolean validation
- **validateRole()** - Purpose: Verifies role is within allowed values | Output: Boolean role validation
- **sanitizeInput()** - Purpose: Cleans user input data | Output: Sanitized input string

#### **Security Utilities**
- **hashPassword()** - Purpose: Encrypts passwords using bcrypt | Output: Hashed password string
- **comparePasswords()** - Purpose: Verifies password against hash | Output: Boolean match result
- **generateRandomToken()** - Purpose: Creates secure random tokens | Output: Random token string
- **generateJWT()** - Purpose: Creates signed JWT tokens | Output: JWT token string

#### **Database Utilities**
- **findUserById()** - Purpose: Retrieves user by ID | Output: User document/null
- **findUserByEmail()** - Purpose: Retrieves user by email | Output: User document/null
- **updateUser()** - Purpose: Modifies user document | Output: Update result
- **deleteUser()** - Purpose: Removes user document | Output: Deletion result

### 🔄 Error Handling

#### **Error Middleware**
- **handleValidationErrors()** - Purpose: Processes mongoose validation errors | Output: Formatted error response
- **handleDuplicateKeyErrors()** - Purpose: Manages unique constraint violations | Output: Duplicate error response
- **handleCastErrors()** - Purpose: Processes invalid ObjectId errors | Output: Cast error response
- **handleGenericErrors()** - Purpose: Manages unexpected server errors | Output: Generic error response

#### **Custom Error Classes**
- **ValidationError** - Purpose: Represents input validation failures | Output: Structured validation error
- **AuthenticationError** - Purpose: Represents auth failures | Output: Authentication error
- **AuthorizationError** - Purpose: Represents permission failures | Output: Authorization error
- **NotFoundError** - Purpose: Represents resource not found errors | Output: 404 error response

### 📊 Logging & Monitoring

#### **Logging Utilities**
- **logRequest()** - Purpose: Records incoming HTTP requests | Output: Request log entry
- **logError()** - Purpose: Records error occurrences | Output: Error log entry
- **logDatabaseOperation()** - Purpose: Records database operations | Output: Database log entry
- **logAuthentication()** - Purpose: Records auth events | Output: Authentication log entry

### 🚀 Performance Optimizations

#### **Caching**
- **setupMemoryCache()** - Purpose: Configures in-memory caching | Output: Cache configuration
- **cacheUserData()** - Purpose: Stores frequently accessed user data | Output: Cached data storage
- **invalidateCache()** - Purpose: Clears stale cache entries | Output: Cache cleanup

#### **Database Optimization**
- **createIndexes()** - Purpose: Sets up database indexes for performance | Output: Index creation result
- **optimizeQueries()** - Purpose: Uses efficient query patterns | Output: Optimized query performance
- **implementPagination()** - Purpose: Limits query results for large datasets | Output: Paginated results

### 🔐 Security Features

#### **Rate Limiting**
- **setupRateLimit()** - Purpose: Configures request rate limiting | Output: Rate limiting middleware
- **applyLoginRateLimit()** - Purpose: Limits failed login attempts | Output: Login rate limiting

#### **Input Sanitization**
- **sanitizeUserInput()** - Purpose: Cleans potentially dangerous input | Output: Safe input data
- **preventSQLInjection()** - Purpose: Blocks SQL injection attempts | Output: Injection protection
- **validateFileUploads()** - Purpose: Secures file upload operations | Output: File validation result

---

## 📦 Dependencies & Libraries

- **Express.js** - Purpose: Web application framework | Output: HTTP server functionality
- **MongoDB/Mongoose** - Purpose: Database and ODM | Output: Data persistence layer
- **bcrypt** - Purpose: Password hashing | Output: Secure password storage
- **jsonwebtoken** - Purpose: JWT token generation/verification | Output: Authentication tokens
- **nodemailer** - Purpose: Email sending functionality | Output: Email delivery system
- **cors** - Purpose: Cross-origin request handling | Output: CORS policy enforcement
- **dotenv** - Purpose: Environment variable management | Output: Configuration loading
- **helmet** - Purpose: Security headers middleware | Output: HTTP security hardening

---

## 🌍 Environment Variables

- **NODE_ENV** - Purpose: Environment specification (dev/prod) | Usage: Server configuration
- **PORT** - Purpose: Server port number | Usage: Server startup
- **MONGODB_URI** - Purpose: Database connection string | Usage: Database connection
- **JWT_SECRET** - Purpose: JWT signing key | Usage: Token generation/verification
- **EMAIL_USER** - Purpose: SMTP email username | Usage: Email authentication
- **EMAIL_PASS** - Purpose: SMTP email password | Usage: Email authentication
- **EMAIL_FROM** - Purpose: Sender email address | Usage: Email from field
- **CLIENT_URL** - Purpose: Frontend application URL | Usage: CORS and redirects

---

*This documentation provides a comprehensive reference of all backend functions, their purposes, and outputs for the ManufactureERP system.*