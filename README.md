# Kafè Table Reservations

A single-page application for online table reservations at Kafè restaurant. Built with Angular 20.0.5 and TypeScript.

## 🎯 About

**Business Rules:**

- Reservations: July 24-31, 6:00 PM - 10:00 PM (30-minute slots)
- Party size: Up to 12 guests
- One table per booking

**Dining Regions:**
| Region | Max Size | Children | Smoking |
|--------|----------|----------|---------|
| Main Hall | 12 | ✅ | ❌ |
| Bar | 4 | ❌ | ❌ |
| Riverside | 8 | ✅ | ❌ |
| Riverside (Smoking) | 6 | ❌ | ✅ |

## Project Structure

### Core Services

- **`availability.ts`** - Manages table availability logic and conflict detection
- **`reservation.ts`** - Handles reservation creation and validation
- **`validation.ts`** - Form validation rules and error handling

### Models

- **`reservation.model.ts`** - Reservation data structure
- **`availability.model.ts`** - Availability checking interfaces
- **`region.model.ts`** - Restaurant region definitions
- **`form-validation.model.ts`** - Validation rule interfaces

### Shared Components

- **`date-picker`** - Custom date selection component
- **`time-slot-selector`** - Time slot selection with availability display
- **`region-selector`** - Region selection with filtering logic
- **`form-field`** - Reusable form input with validation
- **`loading-spinner`** - Loading states throughout the app

### Reservation Components

- **`reservation-form`** - Main booking form with multi-step logic
- **`reservation-summary`** - Booking details review
- **`reservation-confirmation`** - Final confirmation with booking details

## How It Works

1. **Selection Phase**: User picks date, time, party size
2. **Smart Filtering**: System automatically filters available regions based on party requirements (children/smoking)
3. **Availability Check**: Real-time validation against restaurant capacity
4. **Conflict Resolution**: If unavailable, suggests alternative times/regions
5. **Information Collection**: Gathers contact details and special requirements
6. **Confirmation**: Creates reservation with unique booking reference

## Setup

```bash
# Clone and install
git clone [repository-url]
cd kafe-table-reservations
npm install

# Development server
ng start  # http://localhost:4200
---

_Angular 20.0.5 • TypeScript • Restaurant Reservation System for a Technical Assignment_
