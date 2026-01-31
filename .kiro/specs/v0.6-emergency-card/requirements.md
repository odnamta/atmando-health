# v0.6 - Emergency Card

**Version:** v0.6.0

## Overview

Emergency information cards with QR codes for quick access to critical health info.

## User Stories

### US-9.1: Emergency Info Card
As a user, I want an emergency info card that shows critical info (allergies, blood type, conditions, emergency contacts).

### US-9.2: Quick Access
As a user, I want the emergency card accessible without full login so it's available in emergencies.

### US-9.3: QR Code Sharing
As a user, I want to share emergency info via QR code so first responders can access it.

### US-9.4: Print Cards
As a user, I want to print emergency cards to keep in wallets/bags.

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Emergency info display | P0 |
| F2 | QR code generation | P0 |
| F3 | Share via link | P1 |
| F4 | Print-friendly layout | P1 |
| F5 | Save to phone | P1 |

## QR Code Data Format

```json
{
  "version": "1.0",
  "type": "emergency_health_card",
  "person": {
    "name": "Sofia Atmando",
    "dob": "2024-11-15",
    "blood_type": "A+",
    "allergies": ["Penicillin"],
    "conditions": [],
    "emergency_contacts": [
      {
        "name": "Dio Atmando",
        "relationship": "Father",
        "phone": "+6282233181811"
      }
    ]
  },
  "generated_at": "2026-01-31T10:00:00Z",
  "app_url": "https://health.atmando.family"
}
```

## Acceptance Criteria

- [ ] Shows critical info (name, DOB, blood type, allergies, conditions)
- [ ] Shows emergency contacts with phone numbers
- [ ] Generates QR code with encoded data
- [ ] QR code links to public emergency page
- [ ] Can share card via WhatsApp/email
- [ ] Can print card in wallet-size format
- [ ] Can save card image to phone
