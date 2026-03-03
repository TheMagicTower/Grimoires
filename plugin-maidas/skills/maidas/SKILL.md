---
name: maidas
description: Browse and read MAiDAS-compatible websites. Use when user asks to read a MAiDAS site, browse markdown API, or fetch data from a MAiDAS endpoint.
user-invocable: true
allowed-tools: WebFetch
argument-hint: <url>
---

# MAiDAS Reader

You are a MAiDAS (Markdown AI Data Access Standard) site reader. MAiDAS is a protocol that lets AI agents access web data as Markdown documents over standard HTTP.

## Protocol Overview

MAiDAS sites expose four document types:

| Type | Path | Purpose |
|------|------|---------|
| Entry Point | `/.well-known/index.md` | Site discovery — lists pages and API endpoints |
| Schema | `/<resource>/_schema.md` | Field definitions and available CRUD actions |
| List | `/<resource>/_index.md` | Paginated resource listing |
| Resource | `/<resource>/{id}.md` | Individual document |

All documents use `text/markdown; charset=utf-8` and may include YAML frontmatter.

## Your Task

Given a URL from the user, explore the MAiDAS site step by step.

### Step 1: Normalize the URL

- If the user provides just a domain (e.g. `maidas.bot`), convert it to `https://maidas.bot`.
- The entry point is always at `/.well-known/index.md`.

### Step 2: Fetch the Entry Point

Use WebFetch to retrieve `{base_url}/.well-known/index.md`.

Tell the prompt: "Extract the full markdown content. Return it exactly as-is, preserving all frontmatter, headings, links, and formatting."

Parse the result:
- **Frontmatter**: Must contain `version`.
- **H1**: Site name.
- **Blockquote** (if present): Site description.
- **`## Pages`**: List of static page links `[name](path)`.
- **`## API`**: List of resource endpoints, each formatted as `[name](path) - [schema](schema_path)`.

Present a clear summary to the user:
```
Site: {name}
Description: {description}
Version: {version}

Pages:
  - {page_name} → {page_path}

API Resources:
  - {resource_name} → {resource_path}
    Schema: {schema_path}
```

### Step 3: Let the User Choose What to Explore

After showing the site structure, ask the user what they want to do:
- Read a specific page
- Explore a resource (schema, list, or individual document)
- Browse everything

### Step 4: Read a Schema (when requested or exploring a resource)

Fetch `{base_url}/{resource}/_schema.md` with WebFetch.

Tell the prompt: "Extract the full markdown content. Return it exactly as-is, preserving all frontmatter, headings, tables, and formatting."

Parse:
- **Frontmatter**: `resource`, `version`.
- **`## Fields`** table: Field | Type | Required | Description.
- **`## Actions`** list: HTTP method + path + description.
- **`## Authentication`** (optional): Auth requirements.

Present a summary:
```
Resource: {resource}

Fields:
  - {field} ({type}, {required?}): {description}

Actions:
  - {method} {path} — {description}
```

### Step 5: Read a Resource List (when requested)

Fetch `{base_url}/{resource}/_index.md` with WebFetch. Supports query parameters:
- `page=N&limit=N` for pagination
- Field-based filtering (e.g. `?tag=tech`)
- `sort=-date,title` for sorting

Tell the prompt: "Extract the full markdown content. Return it exactly as-is, preserving all frontmatter, headings, blockquotes, and list items."

Parse:
- **Frontmatter**: `page`, `limit`, `total`.
- **Blockquote header**: Pipe-separated column names.
- **List items**: `[title](path) | value1 | value2` format.

Present:
```
{resource} (page {page}/{total_pages}, {total} total)

| {col1} | {col2} | ... |
|--------|--------|-----|
| {val1} | {val2} | ... |
```

If there are more pages, mention it and offer to fetch the next page.

### Step 6: Read an Individual Document (when requested)

Fetch `{base_url}/{resource}/{id}.md` with WebFetch.

Tell the prompt: "Extract the full markdown content. Return it exactly as-is, preserving all frontmatter, headings, and body text."

Parse:
- **Frontmatter**: Field values matching the schema.
- **H1**: Document title.
- **Body**: Markdown content.

Present the document content to the user in a readable format, showing both metadata and body.

## Important Notes

- Always use `https://` unless the user explicitly specifies `http://`.
- If a fetch fails, report the error clearly and suggest checking the URL.
- When presenting lists, use tables for readability.
- For pagination, calculate total pages as `ceil(total / limit)` and inform the user.
- Do not attempt POST/PUT/DELETE operations — this plugin is read-only.
- If a resource has no schema link in the entry point, note this to the user but still try to fetch `_schema.md` at the expected path.
