# v0.3 - Medical Documents - Tasks

**Version:** v0.3.0

## Tasks

### Database
- [ ] Create `health_document_categories` table
- [ ] Create `health_documents` table
- [ ] Add RLS policies
- [ ] Add full-text search index
- [ ] Seed default categories
- [ ] Generate TypeScript types

### Storage
- [ ] Create `health-documents` bucket
- [ ] Configure bucket policies (10MB, PDF/JPG/PNG)
- [ ] Add storage RLS policies

### Components
- [ ] Create `DocumentCard` component
- [ ] Create `DocumentGrid` component
- [ ] Create `DocumentUploader` with drag-drop
- [ ] Create `FilePreview` component
- [ ] Create `CategorySelect` component
- [ ] Create `DocumentViewer` modal
- [ ] Create `PDFViewer` with react-pdf
- [ ] Create `ImageViewer` with zoom/pan

### Pages
- [ ] Create `/documents` list page
- [ ] Create `/documents/upload` page
- [ ] Create `/documents/[id]` detail page
- [ ] Add documents tab to member profile

### Data Fetching
- [ ] Create `getDocuments` server action
- [ ] Create `uploadDocument` server action
- [ ] Create `deleteDocument` server action
- [ ] Create `searchDocuments` server action

### File Handling
- [ ] Install browser-image-compression
- [ ] Implement client-side compression
- [ ] Implement upload progress tracking
- [ ] Handle upload errors gracefully

### Search
- [ ] Implement full-text search
- [ ] Add debounced search input
- [ ] Add filter by member
- [ ] Add filter by category

### Polish
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error handling
- [ ] Test large file uploads

## Estimated Time: 2 days
