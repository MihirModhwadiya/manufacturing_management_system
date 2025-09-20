# Frontend Documentation - ManufactureERP

## 📋 Components & Functions Reference

### 🎯 Core Pages

#### **Login.tsx**
- **handleSubmit()** - Purpose: Validates and submits login credentials | Output: JWT token and user data
- **togglePasswordVisibility()** - Purpose: Shows/hides password input | Output: Boolean state change
- **validateEmail()** - Purpose: Checks email format validity | Output: Boolean validation result

#### **Signup.tsx**  
- **handleSubmit()** - Purpose: Creates new user account with role selection | Output: User registration success/error
- **validatePassword()** - Purpose: Ensures password meets security requirements | Output: Boolean validation
- **togglePasswordVisibility()** - Purpose: Shows/hides password fields | Output: UI state update

#### **Dashboard.tsx**
- **loadDashboardData()** - Purpose: Fetches user-specific dashboard metrics | Output: Stats and KPI data
- **getRoleBasedStats()** - Purpose: Filters statistics based on user role | Output: Role-appropriate metrics
- **refreshData()** - Purpose: Updates dashboard data in real-time | Output: Fresh dashboard state

#### **Admin.tsx** 
- **loadData()** - Purpose: Fetches users and system statistics | Output: Admin dashboard data
- **handleCreateUser()** - Purpose: Creates new user via admin panel | Output: New user creation result
- **handleUpdateUser()** - Purpose: Modifies existing user details | Output: User update confirmation
- **handleDeleteUser()** - Purpose: Removes user from system | Output: User deletion result
- **handleToggleUserStatus()** - Purpose: Activates/deactivates user accounts | Output: Status change confirmation
- **getRoleBadgeColor()** - Purpose: Returns color class for role badges | Output: CSS class string

#### **Profile.tsx**
- **loadUserProfile()** - Purpose: Fetches current user profile data | Output: User profile information
- **handleUpdateProfile()** - Purpose: Updates user profile details | Output: Profile update result
- **handleChangePassword()** - Purpose: Changes user password with validation | Output: Password change confirmation
- **validatePasswordChange()** - Purpose: Ensures new password meets requirements | Output: Boolean validation

### 🏗️ Layout Components

#### **DashboardLayout.tsx**
- **renderLayout()** - Purpose: Provides main dashboard structure | Output: Layout wrapper with sidebar

#### **Sidebar.tsx** 
- **filterNavItems()** - Purpose: Shows navigation based on user role | Output: Filtered navigation items
- **getActiveRoute()** - Purpose: Highlights current page in navigation | Output: Active route styling
- **handleLogout()** - Purpose: Clears session and redirects to login | Output: User logout

#### **AdminRoute.tsx**
- **checkAdminAccess()** - Purpose: Restricts access to admin-only pages | Output: Route protection result

### 🔧 Utility Functions

#### **api.ts**
- **authAPI.login()** - Purpose: Authenticates user credentials | Output: JWT token and user data
- **authAPI.signup()** - Purpose: Registers new user account | Output: Registration success/error
- **authAPI.getProfile()** - Purpose: Retrieves current user profile | Output: User profile data
- **authAPI.updateProfile()** - Purpose: Updates user profile information | Output: Update confirmation
- **authAPI.changePassword()** - Purpose: Changes user password | Output: Password change result
- **authAPI.forgotPassword()** - Purpose: Sends password reset email | Output: Email sent confirmation
- **authAPI.resetPassword()** - Purpose: Resets password with token | Output: Reset success/error
- **userAPI.getAllUsers()** - Purpose: Fetches all users for admin panel | Output: Users list
- **userAPI.createUser()** - Purpose: Creates user via admin interface | Output: User creation result
- **userAPI.updateUser()** - Purpose: Updates user via admin interface | Output: User update result
- **userAPI.deleteUser()** - Purpose: Deletes user via admin interface | Output: Deletion confirmation
- **userAPI.getSystemStats()** - Purpose: Fetches system analytics data | Output: System statistics

#### **AuthContext.tsx**
- **login()** - Purpose: Handles user authentication flow | Output: Authentication state update
- **logout()** - Purpose: Clears user session and tokens | Output: Session cleanup
- **checkAuthStatus()** - Purpose: Verifies current authentication state | Output: Boolean auth status
- **refreshToken()** - Purpose: Renews expired JWT tokens | Output: New token or logout

### 🎨 UI Components (shadcn/ui)

#### **Button Components**
- **Button** - Purpose: Clickable action element | Output: Styled button with variants
- **LoadingButton** - Purpose: Button with loading spinner | Output: Loading state button

#### **Form Components**  
- **Input** - Purpose: Text input with validation styling | Output: Styled input field
- **Label** - Purpose: Form field labels | Output: Accessible form labels
- **Select** - Purpose: Dropdown selection component | Output: Multi-option selector
- **Textarea** - Purpose: Multi-line text input | Output: Expandable text area

#### **Layout Components**
- **Card** - Purpose: Content container with styling | Output: Structured content layout
- **Dialog** - Purpose: Modal overlay for forms/confirmations | Output: Overlay dialog
- **Tabs** - Purpose: Tabbed content organization | Output: Multi-panel interface
- **Table** - Purpose: Data display in rows/columns | Output: Structured data table

#### **Feedback Components**
- **Toast** - Purpose: Success/error notification display | Output: Temporary notification
- **Badge** - Purpose: Status/role indicators | Output: Colored status badge
- **Avatar** - Purpose: User profile image/initials | Output: Circular user avatar

### 🔐 Authentication Flow

#### **Login Process**
1. **validateCredentials()** - Purpose: Client-side form validation | Output: Validation errors/success
2. **submitLogin()** - Purpose: Sends credentials to server | Output: Authentication response  
3. **storeTokens()** - Purpose: Saves JWT to localStorage | Output: Token storage
4. **redirectUser()** - Purpose: Routes to appropriate dashboard | Output: Navigation change

#### **Route Protection**
1. **checkAuthentication()** - Purpose: Verifies valid JWT token | Output: Auth status
2. **validateRole()** - Purpose: Ensures user has required permissions | Output: Access granted/denied
3. **redirectUnauthorized()** - Purpose: Redirects non-authorized users | Output: Route redirect

### 📱 Responsive Design

#### **Mobile Adaptations**
- **useMobileDetection()** - Purpose: Detects mobile viewport size | Output: Boolean mobile state
- **adjustLayoutForMobile()** - Purpose: Modifies UI for small screens | Output: Mobile-optimized layout
- **collapseNavigation()** - Purpose: Hides sidebar on mobile | Output: Compact navigation

### 🚀 Performance Optimizations

#### **Data Management** 
- **useQueryCache()** - Purpose: Caches API responses for faster loading | Output: Cached data retrieval
- **useDebouncedSearch()** - Purpose: Delays search requests to reduce API calls | Output: Optimized search
- **usePagination()** - Purpose: Limits data loading for large datasets | Output: Paginated results

#### **Component Optimization**
- **useMemo()** - Purpose: Memoizes expensive calculations | Output: Cached computation results
- **useCallback()** - Purpose: Memoizes function references | Output: Stable function references
- **React.lazy()** - Purpose: Lazy loads components for code splitting | Output: Dynamic component loading

### 🎯 Role-Based Features

#### **Admin Features**
- **UserManagement** - Purpose: CRUD operations on user accounts | Output: User management interface
- **SystemStats** - Purpose: Displays system-wide analytics | Output: Admin dashboard metrics
- **RoleAssignment** - Purpose: Assigns/modifies user roles | Output: Role management interface

#### **Manager Features** 
- **ManufacturingOrders** - Purpose: Creates and manages production orders | Output: Order management UI
- **WorkOrderAssignment** - Purpose: Assigns tasks to operators | Output: Task assignment interface
- **ProductionReports** - Purpose: Views manufacturing analytics | Output: Production insights

#### **Operator Features**
- **WorkOrderView** - Purpose: Displays assigned work orders | Output: Task list interface
- **StatusUpdates** - Purpose: Updates work order progress | Output: Status change interface
- **TimeTracking** - Purpose: Records work duration | Output: Time logging interface

#### **Inventory Features**
- **StockLedger** - Purpose: Manages inventory levels | Output: Stock management interface
- **BOMManagement** - Purpose: Maintains bill of materials | Output: BOM editing interface
- **StockMovements** - Purpose: Records inventory transactions | Output: Movement logging interface

---

## 📦 Dependencies & Libraries

- **React 18+** - Purpose: Component-based UI framework | Output: Interactive web application
- **TypeScript** - Purpose: Type-safe JavaScript development | Output: Type-checked code
- **Vite** - Purpose: Fast development build tool | Output: Optimized development server
- **React Router** - Purpose: Client-side routing | Output: Single-page navigation  
- **TanStack Query** - Purpose: Server state management | Output: Cached API responses
- **shadcn/ui** - Purpose: Pre-built UI components | Output: Consistent design system
- **Tailwind CSS** - Purpose: Utility-first CSS framework | Output: Responsive styling
- **Lucide Icons** - Purpose: Consistent icon library | Output: Scalable SVG icons
- **date-fns** - Purpose: Date manipulation utilities | Output: Formatted dates/times

---

## 🔄 State Management

#### **Global State (Context)**
- **AuthContext** - Purpose: Manages user authentication state | Output: Auth status across app
- **ThemeContext** - Purpose: Handles light/dark mode toggle | Output: Consistent theming

#### **Local State (useState)**
- **Form States** - Purpose: Manages input field values | Output: Controlled form inputs
- **Loading States** - Purpose: Shows loading indicators | Output: Loading UI feedback
- **Error States** - Purpose: Displays validation/API errors | Output: Error messages

#### **Server State (TanStack Query)**
- **User Data** - Purpose: Caches user profile information | Output: Cached user data
- **Dashboard Metrics** - Purpose: Caches dashboard statistics | Output: Cached metrics
- **Admin Data** - Purpose: Caches admin panel information | Output: Cached admin data

---

*This documentation provides a comprehensive overview of all frontend functions, their purposes, and outputs for the ManufactureERP system.*