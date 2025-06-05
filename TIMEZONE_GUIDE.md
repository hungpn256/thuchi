# Timezone System Guide

Hệ thống timezone đã được implement cho Thu Chi app để xử lý đúng các múi giờ và dates.

## 🎯 Tổng quan

### Backend (NestJS)

- **Timezone Decorator**: Extract timezone từ request headers
- **Timezone Utilities**: Functions để convert dates với timezone
- **Constants**: Các timezone và headers thông dụng

### Frontend (Next.js)

- **Timezone Utilities**: Functions để xử lý dates với user timezone
- **Auto Headers**: Tự động gửi timezone trong API requests
- **Date Conversion**: Convert dates to UTC ISO strings

## 🔧 Backend Implementation

### 1. Timezone Decorator

```typescript
import { Timezone } from '@/shared/decorators';

@Get('/transactions')
async getTransactions(
  @Timezone() timezone: string, // 'Asia/Ho_Chi_Minh' or 'UTC'
  @Query() query: GetTransactionsDto
) {
  // Use timezone for date processing
  console.log('User timezone:', timezone);
}
```

### 2. Timezone Utilities

```typescript
import {
  startOfDayInTimezone,
  endOfDayInTimezone,
  formatInTimezone,
} from '@/shared/utils/timezone.util';

// Get start of day in user's timezone, converted to UTC
const startUTC = startOfDayInTimezone(new Date(), 'Asia/Ho_Chi_Minh');

// Get end of day in user's timezone, converted to UTC
const endUTC = endOfDayInTimezone(new Date(), 'Asia/Ho_Chi_Minh');

// Format date in specific timezone
const formatted = formatInTimezone(new Date(), 'dd/MM/yyyy HH:mm', 'Asia/Ho_Chi_Minh');
```

### 3. Available Functions

| Function                             | Description                        |
| ------------------------------------ | ---------------------------------- |
| `toUTC(date, timezone)`              | Convert local date to UTC          |
| `fromUTC(utcDate, timezone)`         | Convert UTC to local timezone      |
| `startOfDayInTimezone(date, tz)`     | Get start of day in timezone → UTC |
| `endOfDayInTimezone(date, tz)`       | Get end of day in timezone → UTC   |
| `formatInTimezone(date, format, tz)` | Format date in timezone            |
| `isValidTimezone(timezone)`          | Validate timezone string           |

## 🎨 Frontend Implementation

### 1. Automatic Timezone Headers

Axios client tự động gửi timezone header:

```typescript
// Tự động thêm vào mọi request
headers: {
  'x-timezone': 'Asia/Ho_Chi_Minh'
}
```

### 2. Date Conversion Utilities

```typescript
import { startOfDayUTC, endOfDayUTC } from '@/lib/timezone';

// Convert dates to UTC ISO strings
const startDate = startOfDayUTC(new Date()); // "2024-01-01T00:00:00.000Z"
const endDate = endOfDayUTC(new Date()); // "2024-01-01T23:59:59.999Z"
```

### 3. Updated Hooks

```typescript
// use-transactions.ts automatically uses timezone conversion
export const useTransactionList = (params?: TransactionListParams) => {
  const queryParams = {
    startDate: params?.startDate ? startOfDayUTC(params.startDate) : undefined,
    endDate: params?.endDate ? endOfDayUTC(params.endDate) : undefined,
    // ...
  };
};
```

## 📚 Available Frontend Functions

| Function                             | Description                               |
| ------------------------------------ | ----------------------------------------- |
| `startOfDayPureUTC(date)`            | **Pure UTC start of day (00:00:00.000Z)** |
| `endOfDayPureUTC(date)`              | **Pure UTC end of day (23:59:59.999Z)**   |
| `startOfDayUTC(date, tz, pureUTC)`   | Start of day with timezone or pure UTC    |
| `endOfDayUTC(date, tz, pureUTC)`     | End of day with timezone or pure UTC      |
| `convertToUTC(date)`                 | Convert local date to UTC                 |
| `convertFromUTC(utcDate)`            | Convert UTC to user timezone              |
| `formatInUserTimezone(date, format)` | Format date in user timezone              |
| `getTimezoneHeader()`                | Get timezone for API headers              |

## 🔍 Examples

### Pure UTC Dates (Recommended for Transaction APIs)

```typescript
import { startOfDayPureUTC, endOfDayPureUTC } from '@/lib/timezone';

// Example: User in Vietnam timezone (UTC+7) has a date
const userDate = new Date('2025-05-31T17:00:00.000Z'); // This is 00:00 June 1st in VN

// Get pure UTC dates based on user's local date (June 1st)
const startDate = startOfDayPureUTC(userDate); // "2025-06-01T00:00:00.000Z"
const endDate = endOfDayPureUTC(userDate); // "2025-06-01T23:59:59.999Z"

// API call with pure UTC dates
const { data } = await api.get('/transactions', {
  params: { startDate, endDate },
});

// Result: Backend receives the correct UTC dates for June 1st
```

**How it works:**

1. Input date: `2025-05-31T17:00:00.000Z` (UTC)
2. Convert to user timezone: `June 1st, 2025 00:00:00` (Vietnam time)
3. Extract date: `June 1st, 2025`
4. Create UTC start/end: `2025-06-01T00:00:00.000Z` / `2025-06-01T23:59:59.999Z`

### Timezone-Aware Dates (For Reports/Display)

```typescript
import { startOfDayUTC, endOfDayUTC } from '@/lib/timezone';

// User selects date in their timezone
const userSelectedDate = new Date('2025-01-15');

// Convert to UTC based on user's timezone
const startDate = startOfDayUTC(userSelectedDate); // Timezone-aware conversion
const endDate = endOfDayUTC(userSelectedDate); // Timezone-aware conversion

// For pure UTC (equivalent to functions above)
const pureStartDate = startOfDayUTC(userSelectedDate, undefined, true);
const pureEndDate = endOfDayUTC(userSelectedDate, undefined, true);
```

### Updated Transaction Hook Usage

```typescript
// use-transactions.ts now uses pure UTC
export const useTransactionList = (params?: TransactionListParams) => {
  const queryParams = {
    // Pure UTC dates - no timezone conversion
    startDate: params?.startDate ? startOfDayPureUTC(params.startDate) : undefined,
    endDate: params?.endDate ? endOfDayPureUTC(params.endDate) : undefined,
    // ...
  };
};
```

## 🌏 Timezone Constants

### Common Timezones

```typescript
export const COMMON_TIMEZONES = {
  UTC: 'UTC',
  VIETNAM: 'Asia/Ho_Chi_Minh',
  SINGAPORE: 'Asia/Singapore',
  THAILAND: 'Asia/Bangkok',
  JAPAN: 'Asia/Tokyo',
  CHINA: 'Asia/Shanghai',
  KOREA: 'Asia/Seoul',
};
```

### Headers

```typescript
export const TIMEZONE_HEADERS = {
  X_TIMEZONE: 'x-timezone', // Primary
  TIMEZONE: 'timezone', // Fallback 1
  TIME_ZONE: 'time-zone', // Fallback 2
};
```

## 🎯 Timezone-Aware Monthly Calculations

### Monthly Summary Chart Fix

**Problem:** Monthly charts were calculating months in pure UTC, not respecting user timezone.

**Example Issue:**

```
Vietnam Timezone (UTC+7):
- June 2025 in VN: 01/06/2025 00:00 VN → 31/05/2025 17:00 UTC
- But charts calculated: 01/06/2025 00:00 UTC → 30/06/2025 23:59 UTC ❌
```

**Solution:** Use timezone-aware month calculations

```typescript
// Backend: api/src/modules/transaction/transaction.service.ts
async getSummaryByMonth(
  profileId: number,
  months: number,
  timezone: string = DEFAULT_TIMEZONE
): Promise<MonthlySummary[]> {
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);

    // Timezone-aware month boundaries
    const start = startOfMonthInTimezone(monthDate, timezone); // 2025-05-31T17:00:00.000Z
    const end = endOfMonthInTimezone(monthDate, timezone);     // 2025-06-30T16:59:59.999Z

    // Query with correct timezone boundaries
    const transactions = await this.prismaService.transaction.findMany({
      where: { profileId, date: { gte: start, lte: end } }
    });
  }
}
```

**Result:** June 2025 for Vietnam users now correctly includes:

- ✅ Start: `2025-05-31T17:00:00.000Z` (00:00 June 1st VN time)
- ✅ End: `2025-06-30T16:59:59.999Z` (23:59 June 30th VN time)

## ✅ Best Practices

### Backend

1. **Always use UTC in database** - Store all dates as UTC
2. **Use timezone decorator** - Extract user timezone from headers
3. **Convert for queries** - Use timezone utils for date range queries
4. **Format for display** - Use `formatInTimezone()` when returning formatted dates

### Frontend

1. **Let utilities handle conversion** - Use `startOfDayUTC()`/`endOfDayUTC()`
2. **Display in user timezone** - Use `formatInUserTimezone()` for display
3. **Trust the system** - Timezone headers are automatic
4. **Test edge cases** - Test around DST transitions

## 🚨 Migration Notes

### Changes Made

1. ✅ **use-transactions.ts** - Updated to use timezone utilities
2. ✅ **axios-client.ts** - Auto timezone headers
3. ✅ **Backend decorators** - Timezone extraction from headers
4. ✅ **date-fns-tz** - Added for both frontend and backend

### Breaking Changes

- Date parameters in API calls now expect UTC ISO strings
- Frontend automatically converts local dates to UTC
- Backend can access user timezone via `@Timezone()` decorator

### Testing

Test với các timezone khác nhau:

```bash
# Test with different timezones in browser console
localStorage.setItem('timezone', 'Asia/Tokyo');
// Or change system timezone and test
```

## 🎯 Next Steps

1. **Update Event Forms** - Apply timezone conversion to event creation
2. **Reports Enhancement** - Use timezone for better date filtering
3. **Add Timezone Picker** - Let users manually select timezone
4. **DST Handling** - Test daylight saving time transitions

## 🎯 Database Date Format & Monthly Calculations

### Understanding Date Storage

**Database Reality:**

- `date` field stores: `YYYY-MM-DD` (no time component)
- Examples: `2025-06-01`, `2025-06-15`, `2025-06-30`

**Query Requirements:**

- Need pure UTC date boundaries for comparison
- ✅ `startDate`: `2025-06-01T00:00:00.000Z` (start of day UTC)
- ✅ `endDate`: `2025-06-30T23:59:59.999Z` (end of day UTC)

### Monthly Summary Implementation

**Correct Approach:**

```typescript
// Backend: Use pure UTC month boundaries
async getSummaryByMonth(profileId: number, months: number): Promise<MonthlySummary[]> {
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);

    // Pure UTC month boundaries (not timezone-aware)
    const start = startOfMonth(monthDate); // 2025-06-01T00:00:00.000Z
    const end = endOfMonth(monthDate);     // 2025-06-30T23:59:59.999Z

    // Query database with UTC boundaries
    const transactions = await this.prismaService.transaction.findMany({
      where: { profileId, date: { gte: start, lte: end } }
    });
  }
}
```

**SQL Grouping:**

```sql
SELECT
  to_char(date, 'YYYY-MM') as month,  -- Pure UTC grouping
  type,
  SUM(amount::numeric) as amount
FROM transaction
WHERE "profileId" = ${profileId}
  AND date BETWEEN ${startDate} AND ${endDate}
GROUP BY month, type
ORDER BY month
```

### Why Pure UTC for Monthly Charts?

1. **Database Constraint**: Date field has no time → compare with full day UTC boundaries
2. **Consistency**: Same month grouping regardless of user timezone
3. **Simplicity**: No timezone conversion needed for date-only fields

### Frontend Transaction Dates

**Different Strategy for Transactions:**

- Frontend sends pure UTC day boundaries: `startOfDayPureUTC()`, `endOfDayPureUTC()`
- Respects user's intended date selection
- Works with database date-only format

**Example:**

```typescript
// User in VN selects "June 1st"
const userDate = new Date('2025-05-31T17:00:00.000Z'); // 00:00 June 1st VN

// Send pure UTC June 1st boundaries
startOfDayPureUTC(userDate); // "2025-06-01T00:00:00.000Z"
endOfDayPureUTC(userDate); // "2025-06-01T23:59:59.999Z"

// Matches database date: '2025-06-01' ✅
```

---

**📝 Hệ thống timezone đã sẵn sàng sử dụng!** Frontend tự động gửi timezone, backend có thể đọc và xử lý đúng múi giờ.
