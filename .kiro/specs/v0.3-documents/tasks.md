# v0.3 - Medical Documents - Tasks

**Version:** v0.3.0

## Tasks

### Database
- [x] Create `health_document_categories` table
- [x] Create `health_documents` table (enhanced existing `medical_documents`)
- [x] Add RLS policies
- [x] Add full-text search index
- [x] Seed default categories (via function)
- [x] Generate TypeScript types

### Storage
- [x] Create `health-documents` bucket
- [x] Configure bucket policies (10MB, PDF/JPG/PNG)
- [x] Add storage RLS policies

### Components
- [x] Create `DocumentCard` component
- [x] Create `DocumentGrid` component
- [x] Create `DocumentUploader` with drag-drop
- [ ] Create `FilePreview` component
- [x] Create `CategorySelect` component
- [x] Create `DocumentViewer` modal
- [ ] Create `PDFViewer` with react-pdf
- [ ] Create `ImageViewer` with zoom/pan

### Pages
- [x] Create `/documents` list page
- [x] Create `/documents/upload` (integrated in sheet)
- [ ] Create `/documents/[id]` detail page
- [ ] Add documents tab to member profile

### Data Fetching
- [x] Create `getDocuments` server action
- [x] Create `uploadDocument` server action
- [x] Create `deleteDocument` server action
- [x] Create `searchDocuments` server action (integrated in getDocuments)

### File Handling
- [x] Install react-dropzone
- [ ] Install browser-image-compression
- [ ] Implement client-side compression
- [ ] Implement upload progress tracking
- [x] Handle upload errors gracefully

### Search
- [x] Implement full-text search
- [x] Add debounced search input
- [x] Add filter by member
- [x] Add filter by category

### Polish
- [x] Add loading states
- [x] Add empty states
- [x] Add error handling
- [ ] Test large file uploads

## Estimated Time: 2 days

## Completed: 1 Feb 2026
