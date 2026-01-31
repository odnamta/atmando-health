# v0.3 - Medical Documents - Design

**Version:** v0.3.0

## Page Structure

```
/documents              → Document list (all members)
/documents/upload       → Upload new document
/documents/[id]         → View document details
```

## Component Hierarchy

```
DocumentsPage
├── Header
│   ├── SearchInput
│   └── UploadButton
├── Filters
│   ├── MemberFilter
│   └── CategoryFilter
├── DocumentGrid/List
│   └── DocumentCard (grid)
│       ├── Thumbnail
│       ├── Title
│       ├── Category badge
│       ├── Member badge
│       └── Date
└── DocumentViewer (modal)
    ├── PDFViewer (react-pdf)
    └── ImageViewer (zoom/pan)

UploadPage
├── DropZone
├── FilePreview
├── MetadataForm
│   ├── TitleInput
│   ├── MemberSelect
│   ├── CategorySelect
│   ├── DatePicker
│   ├── DoctorInput
│   └── HospitalInput
└── UploadButton
```

## Key Components

### DocumentCard
```typescript
interface DocumentCardProps {
  document: {
    id: string
    title: string
    fileType: string
    fileUrl: string
    documentDate: string
    category: {
      name: string
      icon: string
    }
    familyMember: {
      name: string
      avatarUrl: string
    }
  }
  onClick: () => void
}
```

### DocumentUploader
```typescript
interface DocumentUploaderProps {
  familyId: string
  onUploadComplete: (document: Document) => void
}

// Features:
// - Drag and drop zone
// - File type validation
// - Size validation (10MB max)
// - Upload progress indicator
// - Client-side image compression
```

### DocumentViewer
```typescript
interface DocumentViewerProps {
  document: Document
  onClose: () => void
}

// Features:
// - PDF rendering with react-pdf
// - Image zoom/pan with react-zoom-pan-pinch
// - Download button
// - Share button
```

## Data Flow

### Uploading Document
```
User drops file → Validate type/size
→ Compress if image → Show preview
→ User fills metadata → Upload to Storage
→ Create DB record → Show in list
→ Queue OCR processing (background)
```

### Searching Documents
```
User types query → Debounce 300ms
→ Search title + OCR text
→ Filter by member/category
→ Update results
```

## Storage Structure

```
health-documents/
├── {family_id}/
│   ├── {member_id}/
│   │   ├── {timestamp}-{filename}.pdf
│   │   └── {timestamp}-{filename}.jpg
```

## File Handling

```typescript
// Client-side image compression
import imageCompression from 'browser-image-compression'

const options = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
}

const compressedFile = await imageCompression(file, options)
```
