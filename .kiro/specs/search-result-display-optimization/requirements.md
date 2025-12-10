# Requirements Document

## Introduction

本功能旨在优化 Exa Search 应用的搜索结果信息展示。通过充分利用 Exa API 返回的丰富数据字段，提升搜索结果卡片的信息密度和用户体验，帮助用户更快地找到所需内容。

## Glossary

- **SearchResultCard**: 搜索结果卡片组件，用于展示单条搜索结果
- **Exa API**: AI 驱动的搜索 API 服务，提供网页搜索和内容提取功能
- **Highlight**: Exa API 返回的与搜索查询相关的文本片段高亮
- **Score**: Exa API 返回的搜索结果相关性评分
- **Summary**: Exa API 可生成的内容摘要

## Requirements

### Requirement 1

**User Story:** As a user, I want to see relevance scores for search results, so that I can quickly identify the most relevant content.

#### Acceptance Criteria

1. WHEN a search result contains a score value THEN the SearchResultCard SHALL display a visual relevance indicator
2. WHEN the score is above 0.8 THEN the SearchResultCard SHALL display a "High Relevance" badge
3. WHEN the score is between 0.5 and 0.8 THEN the SearchResultCard SHALL display a "Medium Relevance" indicator
4. WHEN the score is below 0.5 THEN the SearchResultCard SHALL display a "Low Relevance" indicator

### Requirement 2

**User Story:** As a user, I want to see better formatted highlights, so that I can quickly understand why a result matches my query.

#### Acceptance Criteria

1. WHEN a search result contains highlights THEN the SearchResultCard SHALL display the highlights with the matching terms visually emphasized
2. WHEN multiple highlights exist THEN the SearchResultCard SHALL display highlights sorted by highlightScores in descending order
3. WHEN a highlight text exceeds 200 characters THEN the SearchResultCard SHALL truncate the text with an ellipsis

### Requirement 3

**User Story:** As a user, I want to see AI-generated summaries for search results, so that I can understand the content without visiting the page.

#### Acceptance Criteria

1. WHEN requesting search results THEN the Search API SHALL request summary generation from Exa API
2. WHEN a search result contains a summary THEN the SearchResultCard SHALL display the summary in a distinct section
3. WHEN both text and summary exist THEN the SearchResultCard SHALL prioritize displaying the summary over raw text

### Requirement 4

**User Story:** As a user, I want to see more metadata about search results, so that I can make informed decisions about which results to explore.

#### Acceptance Criteria

1. WHEN a search result contains an author THEN the SearchResultCard SHALL display the author name with an icon
2. WHEN a search result contains a publishedDate THEN the SearchResultCard SHALL display a relative time format (e.g., "2 days ago") for recent dates
3. WHEN a search result contains an image THEN the SearchResultCard SHALL display the image with proper aspect ratio and lazy loading
4. WHEN hovering over a search result card THEN the SearchResultCard SHALL provide subtle visual feedback

### Requirement 5

**User Story:** As a user, I want search results to be visually organized, so that I can scan through results efficiently.

#### Acceptance Criteria

1. WHEN displaying search results THEN the SearchResultCard SHALL use a consistent visual hierarchy with title, summary, metadata, and highlights
2. WHEN the screen width is below 640px THEN the SearchResultCard SHALL adapt to a mobile-friendly layout
3. WHEN a search result lacks an image THEN the SearchResultCard SHALL maintain consistent spacing without the image placeholder

### Requirement 6

**User Story:** As a user, I want to expand search results for more details, so that I can see full content when needed.

#### Acceptance Criteria

1. WHEN a search result has truncated content THEN the SearchResultCard SHALL display an expand button
2. WHEN a user clicks the expand button THEN the SearchResultCard SHALL reveal the full text and all highlights
3. WHEN a user clicks the collapse button THEN the SearchResultCard SHALL return to the compact view

