# Audit System - Session Monitoring

Complete audit system for monitoring all user and administrator sessions.

## 📊 Overview

The audit system automatically records all session events:
- ✅ **Successful logins** - Users who authenticate successfully
- ❌ **Failed logins** - Failed authentication attempts
- 🚪 **Logouts** - Users who close their session
- 🚫 **Invalidated tokens** - Tokens added to blacklist

## 🔍 Data Model

### SessionAudit Schema
```typescript
{
  userId: string;           // ID del usuario o 'unknown' para fallos
  userType: 'user' | 'admin';
  action: 'login' | 'logout' | 'login_failed' | 'token_invalidated';
  ipAddress: string;        // IP del cliente
  success: boolean;         // Si la acción fue exitosa
  failureReason?: string;   // Razón del fallo (si aplica)
  createdAt: Date;          // Timestamp del evento
  updatedAt: Date;
}
```

### Features
- **TTL Index**: Records are automatically deleted after 1 year
- **Optimized indexes**: For fast queries by user, type, action, etc.
- **Pagination**: All queries support pagination

## 🛡️ Security Features

### Automatic Logging
- **Successful login**: Automatically recorded on each authentication
- **Failed login**: Recorded when credentials fail
- **Logout**: Recorded when user closes session
- **IP Tracking**: IP address is captured for each event

### Suspicious Activity Detection
- **Multiple failed attempts**: IPs with many failures can be identified
- **Usage patterns**: Analysis of login times and frequency
- **Alerts**: Dashboard shows suspicious activity

## 📡 API Endpoints

### GET `/audit/sessions`
Gets all sessions with optional filters.

**Query Parameters:**
```typescript
{
  page?: number;           // Page (default: 1)
  limit?: number;          // Items per page (default: 20)
  userId?: string;         // Filter by specific user
  userType?: 'user' | 'admin';
  action?: 'login' | 'logout' | 'login_failed' | 'token_invalidated';
  success?: boolean;       // Only successes or failures
  ipAddress?: string;      // Filter by IP
  startDate?: string;      // Start date (ISO)
  endDate?: string;        // End date (ISO)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    sessions: Array<SessionAudit>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

**Example Request:**
```bash
GET /api/audit/sessions?page=1&limit=10&action=login_failed&startDate=2024-01-01
```

### GET `/audit/sessions/:userId`
Gets the complete session history for a specific user.

**Path Parameters:**
- `userId`: User ID

**Query Parameters:**
```typescript
{
  page?: number;           // Page (default: 1)
  limit?: number;          // Items per page (default: 20)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    userId: string;
    sessions: Array<SessionAudit>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

### GET `/audit/sessions/failed`
Gets only failed login attempts.

**Query Parameters:**
```typescript
{
  page?: number;           // Page (default: 1)
  limit?: number;          // Items per page (default: 20)
  startDate?: string;      // Start date (ISO)
  endDate?: string;        // End date (ISO)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    sessions: Array<SessionAudit>;  // Only login_failed
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

### GET `/audit/sessions/recent`
Gets the most recent sessions.

**Query Parameters:**
```typescript
{
  hours?: number;          // Last X hours (default: 24)
  limit?: number;          // Maximum items (default: 50)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    sessions: Array<SessionAudit>;
    hours: number;
  };
}
```

### GET `/audit/stats`
Gets session statistics.

**Query Parameters:**
```typescript
{
  startDate?: string;      // Start date (ISO)
  endDate?: string;        // End date (ISO)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    totalSessions: number;
    successfulLogins: number;
    failedLogins: number;
    logouts: number;
    uniqueUsers: number;
    uniqueIPs: number;
  };
}
```

### GET `/audit/suspicious-ips`
Gets IPs with most failed attempts.

**Query Parameters:**
```typescript
{
  limit?: number;          // Maximum IPs to return (default: 10)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    suspiciousIPs: Array<{
      _id: string;         // IP address
      failedAttempts: number;
      lastAttempt: Date;
      users: string[];     // IDs de usuarios afectados
    }>;
  };
}
```

### GET `/audit/dashboard`
Gets complete data for the dashboard.

**Query Parameters:**
```typescript
{
  hours?: number;          // Analysis period (default: 24)
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    stats: {
      totalSessions: number;
      successfulLogins: number;
      failedLogins: number;
      logouts: number;
      uniqueUsers: number;
      uniqueIPs: number;
    };
    recentActivity: {
      sessions: Array<SessionAudit>;
      hours: number;
    };
    alerts: {
      failedLoginsLastHour: number;
      suspiciousIPs: number;
    };
    suspiciousIPs: Array<{
      _id: string;
      failedAttempts: number;
      lastAttempt: Date;
      users: string[];
    }>;
  };
}
```

## 🎨 Dashboard Features

### Main Dashboard (`/audit/dashboard`)
- **📊 Real-time statistics**: Total sessions, successful/failed logins
- **📈 Charts**: Activity by hour/day
- **🔴 Alerts**: Recent failed attempts, suspicious IPs
- **📋 Recent activity table**: Latest sessions with details

### Session List (`/audit/sessions`)
- **🔍 Advanced filters**: By user, type, action, IP, dates
- **📄 Pagination**: Page navigation
- **📊 Export**: Ability to export data
- **🔍 Search**: Text search functionality

### User History (`/audit/sessions/:userId`)
- **👤 User profile**: Complete session history
- **📊 Patterns**: User behavior analysis
- **🚨 Alerts**: Suspicious user activity

### Security Monitoring (`/audit/sessions/failed`)
- **🚨 Failed attempts**: List of all failures
- **🔍 Analysis**: Failed attempt patterns
- **🛡️ Prevention**: Attack identification

## 🔧 Integration

### Automatic Logging
The system automatically records events in:
- **Successful login**: `/auth/login` and `/admins/login`
- **Failed login**: When credentials fail
- **Logout**: `/auth/logout` and `/admins/logout`
- **Token invalidated**: When added to blacklist

### Permissions
All endpoints require:
- **Authentication**: Valid JWT token
- **Permissions**: `audit:read` to access data

### Performance
- **Optimized indexes**: Fast queries
- **Pagination**: Efficient handling of large volumes
- **TTL**: Automatic cleanup of old data

## 📈 Use Cases

### Security Monitoring
- **Attack detection**: Multiple failed attempts from the same IP
- **Forensic analysis**: Investigate security incidents
- **Compliance**: Compliance with audit regulations

### User Behavior Analysis
- **Usage patterns**: Activity schedules, login frequency
- **Anomalies**: Unusual user behavior
- **Optimization**: Improve user experience

### System Health
- **Metrics**: System usage statistics
- **Performance**: Monitor authentication load
- **Capacity Planning**: Plan resources

## 🚀 Getting Started

### 1. Permissions Setup
Make sure roles have audit permissions:
```typescript
// In admin role
permissions: {
  audit: {
    read: true
  }
}
```

### 2. Dashboard Integration
```javascript
// Get dashboard data
const response = await fetch('/api/audit/dashboard?hours=24', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const dashboardData = await response.json();
```

### 3. Real-time Monitoring
```javascript
// Monitor failed attempts
const failedLogins = await fetch('/api/audit/sessions/failed?limit=10');
```

## 🔒 Security Considerations

- **Data Retention**: Data is automatically deleted after 1 year
- **Access Control**: Only users with permissions can access
- **IP Privacy**: Consider GDPR and IP privacy
- **Rate Limiting**: Implement query limits to prevent abuse 