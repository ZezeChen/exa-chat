# Implementation Plan

- [x] 1. Create utility functions





  - [x] 1.1 Create relevance utility functions


    - Create `lib/utils/relevance.ts` with `getRelevanceLevel` function
    - Implement score threshold logic (>=0.8 high, >=0.5 medium, <0.5 low)
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 1.2 Create highlight utility functions

    - Create `lib/utils/highlights.ts` with `sortHighlightsByScore` and `truncateHighlight` functions
    - Implement sorting by score descending
    - Implement truncation at 200 characters with ellipsis
    - _Requirements: 2.2, 2.3_


  - [x] 1.3 Create date utility functions

    - Create `lib/utils/date.ts` with `formatRelativeTime` function
    - Implement relative time for dates within 30 days
    - Fall back to formatted date for older dates
    - _Requirements: 4.2_

- [x] 2. Update types and API





  - [x] 2.1 Update SearchResult type


    - Add `summary?: string` field to SearchResult interface in `lib/types.ts`
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Update search API route


    - Modify `app/api/search/route.ts` to request summary from Exa API
    - Map summary field from Exa response to SearchResult
    - _Requirements: 3.1_

- [x] 3. Create new UI components





  - [x] 3.1 Create RelevanceIndicator component


    - Create `components/RelevanceIndicator.tsx`
    - Display colored badge based on relevance level
    - Use HeroUI Chip component with appropriate colors
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.2 Create HighlightSection component


    - Create `components/HighlightSection.tsx`
    - Display sorted highlights with truncation
    - Support expanded/collapsed states
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Create MetadataSection component


    - Create `components/MetadataSection.tsx`
    - Display author, relative date, and relevance indicator
    - _Requirements: 4.1, 4.2_

- [x] 4. Refactor SearchResultCard component





  - [x] 4.1 Add expand/collapse state management


    - Add isExpanded state to SearchResultCard
    - Implement toggle button for expand/collapse
    - _Requirements: 6.1, 6.2, 6.3_


  - [x] 4.2 Integrate new components into SearchResultCard

    - Replace inline metadata with MetadataSection
    - Replace inline highlights with HighlightSection
    - Add RelevanceIndicator to card header
    - _Requirements: 5.1_



  - [x] 4.3 Implement summary priority display

    - Show summary when available, fall back to text
    - Show full text in expanded view
    - _Requirements: 3.2, 3.3_

- [x] 5. Responsive and visual polish




  - [x] 5.1 Update mobile layout


    - Ensure card adapts to screen width below 640px
    - Maintain consistent spacing without images
    - _Requirements: 5.2, 5.3_



  - [x] 5.2 Add hover effects
    - Add subtle hover state to search result cards
    - _Requirements: 4.4_

