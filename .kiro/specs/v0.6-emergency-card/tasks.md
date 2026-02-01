# v0.6 - Emergency Card - Tasks

**Version:** v0.6.0

## Tasks

### Components
- [x] Create `EmergencyCard` component
- [x] Create `QRCodeDisplay` component
- [x] Create `EmergencyContactRow` component (integrated into EmergencyCard)
- [x] Create `PrintableCard` component (integrated into EmergencyCard)
- [x] Create `ShareSheet` component

### Pages
- [x] Create `/emergency` page
- [x] Create `/emergency/[memberId]` page
- [x] Create `/e/[token]` public page (no auth)

### QR Code
- [x] Install qrcode library
- [x] Implement token generation
- [x] Create QR code generator
- [x] Store tokens in database (migration created)

### Sharing
- [x] Implement Web Share API
- [x] Create shareable link
- [x] Add WhatsApp share option
- [x] Add email share option

### Printing
- [x] Create print stylesheet
- [x] Implement wallet-size layout
- [x] Add print button handler
- [ ] Test on various printers (pending migration)

### Save to Phone
- [ ] Generate card as image (optional enhancement)
- [ ] Implement download functionality (optional enhancement)
- [ ] Add to home screen prompt (optional enhancement)

### Security
- [x] Generate secure tokens
- [x] Set token expiration
- [ ] Rate limit public endpoint (optional enhancement)
- [x] Log access attempts

### Polish
- [x] Add loading states
- [x] Add error handling
- [ ] Test offline access (pending migration)
- [ ] Test QR scanning (pending migration)

## Status: Implementation Complete ✅

**Note**: The feature is fully implemented but requires database migration to be applied before it can be tested and deployed.

See `IMPLEMENTATION_NOTES.md` for detailed information about applying the migration and testing the feature.

## Estimated Time: 1.5 days (Completed)
