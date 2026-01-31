# v0.6 - Emergency Card - Design

**Version:** v0.6.0

## Page Structure

```
/emergency              → Emergency card selector
/emergency/[memberId]   → Member's emergency card
/e/[token]              → Public emergency info (no auth)
```

## Component Hierarchy

```
EmergencyPage
├── MemberSelector
│   └── MemberButton (x4)
└── EmergencyCard
    ├── CardHeader
    │   ├── EmergencyIcon
    │   └── Title
    ├── PersonInfo
    │   ├── Name
    │   ├── DOB
    │   └── BloodType
    ├── AllergiesSection
    │   └── AllergyBadge (list)
    ├── ConditionsSection
    │   └── ConditionBadge (list)
    ├── EmergencyContacts
    │   └── ContactRow (list)
    │       ├── Name
    │       ├── Relationship
    │       └── PhoneLink
    ├── QRCodeSection
    │   └── QRCode
    └── ActionButtons
        ├── ShareButton
        ├── PrintButton
        └── SaveButton
```

## Emergency Card Layout

```
┌─────────────────────────────────┐
│                                 │
│    🚨 EMERGENCY INFO            │
│                                 │
│    Sofia Atmando                │
│    DOB: Nov 15, 2024            │
│                                 │
│    Blood Type: A+               │
│                                 │
│    ALLERGIES:                   │
│    • Penicillin                 │
│                                 │
│    CONDITIONS:                  │
│    • None                       │
│                                 │
│    EMERGENCY CONTACTS:          │
│    📞 Dio: +62 822 331 8181     │
│    📞 Celline: +62 812...       │
│                                 │
│    ┌─────────────────┐          │
│    │    [QR CODE]    │          │
│    │                 │          │
│    └─────────────────┘          │
│    Scan for full info           │
│                                 │
└─────────────────────────────────┘

[📤 Share] [🖨️ Print] [📱 Save]
```

## QR Code Generation

```typescript
import QRCode from 'qrcode'

async function generateEmergencyQR(memberId: string): Promise<string> {
  const token = generateSecureToken(memberId)
  const url = `${APP_URL}/e/${token}`
  
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}
```

## Public Emergency Page

The `/e/[token]` page:
- No authentication required
- Shows only critical info
- Mobile-optimized
- Fast loading
- Works offline (cached)

## Print Layout

```css
@media print {
  .emergency-card {
    width: 85.6mm; /* Credit card size */
    height: 53.98mm;
    padding: 4mm;
    font-size: 8pt;
  }
  
  .qr-code {
    width: 20mm;
    height: 20mm;
  }
}
```
