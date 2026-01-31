# v0.3 - Medical Documents

**Version:** v0.3.0

## Overview

Document management: upload, categorize, search, and preview medical documents.

## User Stories

### US-3.1: Upload Documents
As a user, I want to upload medical documents (PDF, photo) so that they're all in one secure place.

### US-3.2: Categorize Documents
As a user, I want to categorize documents (lab results, prescriptions, etc.) so that I can find them easily.

### US-3.3: Link to Family Member
As a user, I want to link documents to a family member so that each person's records are separate.

### US-3.4: Search Documents
As a user, I want to search documents by name, category, or date so that I can find them quickly.

### US-3.5: Preview Documents
As a user, I want to preview documents in-app so that I don't need to download them.

## Document Categories

| Icon | Category | Description |
|------|----------|-------------|
| 🔬 | Lab Results | Blood tests, urine tests, etc. |
| 💊 | Prescription | Medication prescriptions |
| 💉 | Vaccination | Vaccine certificates, cards |
| 🩺 | Checkup | Annual checkup results |
| 📷 | X-Ray/Imaging | X-rays, CT scans, MRI, ultrasound |
| 📋 | Insurance | Insurance cards, claim documents |
| 📨 | Referral | Doctor referral letters |
| 🏥 | Hospital | Admission, discharge summaries |
| 🧪 | Pathology | Biopsy, culture results |
| 📄 | Other | Miscellaneous documents |

## Features

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Document upload (PDF, images) | P0 |
| F2 | Document categorization | P0 |
| F3 | Link to family member | P0 |
| F4 | Document list with filters | P0 |
| F5 | Full-text search | P0 |
| F6 | Document preview (PDF.js, image zoom) | P0 |
| F7 | Download original | P1 |
| F8 | Bulk upload | P2 |
| F9 | OCR text extraction | P2 |

## Acceptance Criteria

### Upload
- [ ] Can upload PDF files up to 10MB
- [ ] Can upload images (JPG, PNG) up to 10MB
- [ ] Shows upload progress
- [ ] Validates file type and size
- [ ] Can add metadata (title, date, doctor, hospital)

### Organization
- [ ] Can assign category from dropdown
- [ ] Can link to family member
- [ ] Can add tags
- [ ] Documents organized by date

### Search & View
- [ ] Can search by title
- [ ] Can filter by member and category
- [ ] Can preview PDF in-app
- [ ] Can zoom/pan images
- [ ] Can download original file
