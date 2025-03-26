# Root Cause Analysis

## 🐞 Defect: Tags are broken when a new post is created

### 🎯 Problem 1: Tags appear as individual characters on post view

#### ✅ Expected Behavior:
When creating a new article, users enter a comma-separated list of tags. These tags should be:
- Split by comma
- Trimmed for whitespace
- Stored and displayed as an array of tag strings (e.g., `["coding", "react", "testing"]`)
- Rendered cleanly in the UI as individual tag elements (e.g., badges or chips)

#### ❌ Actual Behavior:
After creating a new article with tags like `"coding, testing"`, the tags are shown as:
c o d i n g , t e s t i n g

That is, each **character** is rendered as a separate tag instead of full tag words.

#### 🧠 Root Cause:
The frontend `publishArticle()` method was passing `tagList` as a single comma-separated string (e.g., `"coding, testing"`) instead of an array of strings.

This string was stored directly in the backend as a string, and when the data was loaded and displayed, the UI iterated over it as if it were an array — causing it to loop over each character.

This created confusion downstream in the NgRx effects and UI selectors that expected an array, leading to character-based rendering.

#### 🛠️ Fix Implemented:
We fixed the issue at the **source**, in the Angular `publishArticle()` method:
```ts
tagList: this.tagInput
  .split(',')
  .map((tag: string) => tag.trim())
  .filter((tag: string) => tag.length > 0)
```
This ensures the tagList is always passed to the backend as an array of strings, as expected by the backend (ArticleService.create()).

No backend changes were needed — it was already handling the tagList correctly when it's a proper array.

We also cleaned up redundant .split(',') logic in frontend effects/selectors, since the array format is now consistent throughout the app.

🎯 Problem 2: New tags do not appear under "Popular Tags" after article creation
✅ Expected Behavior:
Once a new article is created with new tags (e.g., ["coding", "testing"]), refreshing the home page should show these tags in the "Popular Tags" section.

❌ Actual Behavior:
After creating a new article, the tags do not appear in the "Popular Tags" section, even after refresh.

🧠 Root Cause:
Tags were not properly persisted to the tag repository in the backend when new articles were created. Specifically:

The backend logic responsible for syncing new tags with the Tag entity/table did not insert new, previously unseen tags into the tag table.

The "Popular Tags" query was pulling only from that persistent store.

This disconnect caused newly added tags to exist only on the article entity, not globally across the system.

🛠️ Fix Implemented:
In the backend TagService, we ensured:

When an article is created with new tags, the service checks if each tag exists.

If a tag does not exist, it creates and saves it to the tag repository.

This way, new tags are guaranteed to persist and appear globally.