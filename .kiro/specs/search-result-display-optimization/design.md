# Design Document: Search Result Display Optimization

## Overview

本设计文档描述了 Exa Search 应用搜索结果展示优化的技术方案。主要目标是充分利用 Exa API 返回的丰富数据，提升搜索结果卡片的信息密度和用户体验。

## Architecture

```mermaid
graph TB
    subgraph Frontend
        Page[app/page.tsx]
        SRC[SearchResultCard]
        RI[RelevanceIndicator]
        HL[HighlightSection]
        Meta[MetadataSection]
    end
    
    subgraph API
        Route[/api/search]
        Exa[Exa API]
    end
    
    subgraph Types
        Types[lib/types.ts]
    end
    
    Page --> SRC
    SRC --> RI
    SRC --> HL
    SRC --> Meta
    Page --> Route
    Route --> Exa
    Types --> SRC
    Types --> Route
```

### 数据流

1. 用户输入搜索查询
2. 前端调用 `/api/search` 端点
3. API 路由调用 Exa API，请求包含 summary 的搜索结果
4. 返回的结果包含 score、highlights、highlightScores、summary 等字段
5. SearchResultCard 组件根据数据渲染优化后的展示

## Components and Interfaces

### 1. SearchResultCard (重构)

主要搜索结果卡片组件，负责整体布局和状态管理。

```typescript
interface SearchResultCardProps {
  result: SearchResult;
  index: number;
}

// 内部状态
interface CardState {
  isExpanded: boolean;
}
```

### 2. RelevanceIndicator (新增)

显示搜索结果相关性评分的组件。

```typescript
interface RelevanceIndicatorProps {
  score?: number;
}

type RelevanceLevel = 'high' | 'medium' | 'low';

function getRelevanceLevel(score: number): RelevanceLevel {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}
```

### 3. HighlightSection (新增)

展示搜索高亮的组件，支持按评分排序和截断。

```typescript
interface HighlightSectionProps {
  highlights?: string[];
  highlightScores?: number[];
  isExpanded: boolean;
  maxLength?: number; // 默认 200
}

function sortHighlightsByScore(
  highlights: string[], 
  scores: number[]
): Array<{ text: string; score: number }>;

function truncateHighlight(text: string, maxLength: number): string;
```

### 4. MetadataSection (新增)

展示元数据（作者、日期等）的组件。

```typescript
interface MetadataSectionProps {
  author?: string;
  publishedDate?: string;
  score?: number;
}

function formatRelativeTime(dateString: string): string;
```

## Data Models

### SearchResult (更新)

```typescript
export interface SearchResult {
  id: string;
  url: string;
  title: string;
  text?: string;
  summary?: string;           // 新增：AI 生成的摘要
  highlights?: string[];
  highlightScores?: number[];
  publishedDate?: string;
  author?: string;
  score?: number;
  image?: string;
}
```

### Exa API 请求配置 (更新)

```typescript
// 在 searchAndContents 调用中添加 summary 选项
const searchResponse = await exa.searchAndContents(query, {
  type,
  numResults,
  useAutoprompt,
  text: {
    maxCharacters: 500,
    includeHtmlTags: false,
  },
  highlights: {
    numSentences: 3,
    highlightsPerUrl: 3,
  },
  summary: {
    query: query,  // 使用搜索查询生成相关摘要
  },
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Score threshold mapping

*For any* search result with a numeric score, the relevance indicator should display:
- "High Relevance" when score >= 0.8
- "Medium Relevance" when 0.5 <= score < 0.8
- "Low Relevance" when score < 0.5

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Highlights sorted by score

*For any* search result with multiple highlights and corresponding highlightScores, the displayed highlights should be ordered by score in descending order.

**Validates: Requirements 2.2**

### Property 3: Highlight truncation

*For any* highlight text exceeding 200 characters, the displayed text should be truncated to 200 characters followed by an ellipsis, and the original text should be recoverable when expanded.

**Validates: Requirements 2.3**

### Property 4: Summary priority over text

*For any* search result containing both summary and text fields, the summary should be displayed in the primary content area, with text available in expanded view.

**Validates: Requirements 3.3**

### Property 5: Relative time formatting

*For any* publishedDate within the last 30 days, the display should show relative time (e.g., "2 days ago"). For dates older than 30 days, the display should show the formatted date.

**Validates: Requirements 4.2**

### Property 6: Expand/collapse round trip

*For any* search result card, clicking expand then collapse should return the card to its original compact state with the same truncated content visible.

**Validates: Requirements 6.2, 6.3**

## Error Handling

| 场景 | 处理方式 |
|------|----------|
| score 为 undefined | 不显示相关性指示器 |
| highlights 为空数组 | 不显示高亮区域 |
| summary 为 undefined | 回退显示 text 字段 |
| publishedDate 格式无效 | 显示原始字符串或隐藏 |
| image URL 加载失败 | 显示占位符或隐藏图片区域 |
| highlightScores 长度与 highlights 不匹配 | 按原始顺序显示 highlights |

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试：

1. `getRelevanceLevel` 函数测试
   - 测试边界值：0.5, 0.8
   - 测试极端值：0, 1

2. `sortHighlightsByScore` 函数测试
   - 测试正常排序
   - 测试空数组
   - 测试长度不匹配情况

3. `truncateHighlight` 函数测试
   - 测试短文本（不截断）
   - 测试长文本（截断）
   - 测试边界长度

4. `formatRelativeTime` 函数测试
   - 测试今天的日期
   - 测试昨天的日期
   - 测试超过 30 天的日期

### 属性测试

使用 fast-check 进行属性测试：

1. **Property 1**: 生成随机 score 值，验证返回的 relevance level 符合阈值规则
2. **Property 2**: 生成随机 highlights 和 scores 数组，验证排序后的顺序正确
3. **Property 3**: 生成随机长度字符串，验证截断逻辑正确
4. **Property 4**: 生成包含 summary 和 text 的结果，验证 summary 优先显示
5. **Property 5**: 生成随机日期，验证相对时间格式化正确
6. **Property 6**: 模拟展开/收起操作，验证状态正确切换

### 测试文件结构

```
lib/
  utils/
    relevance.ts          # getRelevanceLevel
    relevance.test.ts     # 单元测试 + 属性测试
    highlights.ts         # sortHighlightsByScore, truncateHighlight
    highlights.test.ts    # 单元测试 + 属性测试
    date.ts               # formatRelativeTime
    date.test.ts          # 单元测试 + 属性测试
components/
  SearchResultCard.tsx
  SearchResultCard.test.tsx  # 组件测试
```

