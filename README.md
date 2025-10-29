# Bookmark Manager

**[Bookmark Manager](https://bookmark-manager-gamma-nine.vercel.app/) – a modern web application that lets you save, organize, and revisit your favorite websites effortlessly..**

![MainPagePreview](/public/preview/preview-main.png)

## 📋 <a name="table">Table of Contents</a>

1. ⭐️ [Overview](#overview)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🚀 [Future implementation ideas](#future-implementation-ideas)
5. 🕸️ [Snippets](#snippets)
6. 📝 [What I Learned](#what-i-learned)
7. 🙌 [Quick Start](#quick-start)
8. 👁 [Credits](#credits)

## <a name="overview">⭐️ Overview</a>

Bookmark Manager is a full-stack web app built to help users collect, categorize, and quickly access websites they love.
It provides a clean interface for managing bookmarks, with tagging, searching, filtering, and archiving capabilities — all wrapped in a minimal design that adapts across screen sizes.

Initially inspired by a [Bookmark manager app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/bookmark-manager-app), the project evolved into a complete production-grade application with authentication, database persistence, and live state management.

## <a name="tech-stack">⚙️ Tech Stack</a>

<img alt="Static Badge" src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/React-blue?style=for-the-badge&logo=react&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/TailwindCSS-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/RadixUI-black?style=for-the-badge&logo=radixui&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/MongoDB-4fa94d?style=for-the-badge&logo=mongodb&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/Zod-3b82f6?style=for-the-badge&logo=zod&logoColor=white"> <img alt="Static Badge" src="https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white">
<img alt="Static Badge" src="https://img.shields.io/badge/Vitest-black?style=for-the-badge&logo=vitest&logoColor=white">

### 🛠️ Tech Stack Breakdown

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <div style="flex: 1; min-width: 200px;">
    <h3>Frontend</h3>
    <ul>
      <li>Next.js 16 (App Router, Server & Client Components)</li>
      <li>React 19 + React-DOM 19</li>
      <li>TypeScript</li>
      <li>Tailwind CSS v4</li>
      <li>Radix UI</li>
      <li>Lucide-React Icons</li>
      <li>React Hook Form</li>
      <li>Zod (for schema validation)</li>
      <li>Next-Themes</li>
      <li>Sonner</li>
    </ul>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <h3>Backend</h3>
    <ul>
      <li>Next.js API Routes</li>
      <li>MongoDB with Mongoose</li>
      <li>Redis</li>
      <li>date-fns</li>
      <li>Zod (for request validation)</li>
    </ul>
  </div>
   <div style="flex: 1; min-width: 200px;">
    <h3>Testing</h3>
    <ul>
      <li>Vitest</li>
      <li>mongodb-memory-server</li>
      <li>vite-tsconfig-paths</li>
    </ul>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <h3>Deployment & Tools</h3>
    <ul>
      <li>Vercel for deployment</li>
      <li>ESLint and Prettier for code quality</li>
      <li>GitHub for version control</li>
    </ul>
  </div>
</div>

# <a name="features">🔋 Features</a>

📖 **Bookmark Management**: Add new bookmarks with a title, description, tags, and URL, favicon fetched automatically

📂 **Categorize with Tags**: Filter bookmarks by one or multiple tags from the sidebar.

🔍 **Search**:Quickly find bookmarks by title or description.

📌 **Pin / Unpin**: Keep important bookmarks always at the top.

🗂 **Visit Tracking**: View visit count, last visited date, and created date.

🎨 **Archive Mode**: Move bookmarks out of the main view without deleting them.

⚙️ **Edit Functionality**: Update bookmark details anytime.

📋 **Copy to Clipboard**: Copy URLs instantly.

🌗 **Theme Toggle**: Switch between light and dark mode.

📱 **Responsive Design**: Optimized layouts for desktop, tablet, and mobile.

📈 **Sorting Options**: Sort by “Recently Added,” “Recently Visited,” or “Most Visited.”

# <a name="future-implementation-ideas">🚀 Future implementation ideas</a>

<h3>Why not think of expanding it further one day </h3>

- **Jest Testing**: Will there are some test fot the authntication pages, there is a set up for client and server tests, but no tests for the components and pages yet.
- **Bulk Actions**: Archive or delete multiple bookmarks at once
- **Import/Export Bookmarks**: Sync data with browser or file (CSV/JSON)
- **Custom Folder System**: Group bookmarks beyond tag-based organization
- **Analytics**: Display daily/weekly bookmark usage insights
- **Offline Mode**: Local caching with IndexedDB
- **AI Tagging**: Auto-generate tags from bookmark content (experimental idea)

## <a name="snippets">🕸️ Snippets</a>

Here are some code snippets from the project:

<details>
<summary><code>getFaviconUrl</code> - A function to get the favicon URL for a given website</summary>

```typescript
export function getFaviconUrl(websiteUrl: string) {
  const domain = new URL(websiteUrl).hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
}
```

</details>

<br/>

<details>
<summary><code>getUserBookmarks</code> - A function to get all bookmarks for the current user based on the search parameters</summary>

```typescript
"use server";
export async function getUserBookmarks({
  searchParams,
}: {
  searchParams: Partial<bookmarkSearchParams>;
}): Promise<{ ok: true; bookmarks: IBookmark[] } | { ok: false; error: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { ok: false, error: "User not authenticated." };
  }
  try {
    await connectDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: String(userId.user) };
    if (searchParams.archived !== undefined) {
      query.isArchived = searchParams.archived;
    }
    if (searchParams.withTags && searchParams.withTags.length > 0) {
      query.tags = { $all: searchParams.withTags };
    }
    if (searchParams.query) {
      query.$or = [
        { title: { $regex: searchParams.query, $options: "i" } },
        { description: { $regex: searchParams.query, $options: "i" } },
      ];
    }
    let sortOption: { [key: string]: -1 | 1 } = { pinned: -1, createdAt: -1 }; // default sort
    if (searchParams.sortby === "rec-visited") {
      sortOption = { pinned: -1, lastVisitedAt: -1 };
    } else if (searchParams.sortby === "most-visited") {
      sortOption = { pinned: -1, visitCount: -1 };
    }
    const page = searchParams.page && searchParams.page > 0 ? searchParams.page : 1;
    const limit = searchParams.limit && searchParams.limit > 0 ? searchParams.limit : 20;
    const bookmarks = await Bookmark.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return {
      ok: true,
      bookmarks: JSON.parse(JSON.stringify(bookmarks)),
    };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to fetch bookmarks." };
  }
}
```

</details>

## <a name="what-i-learned">📝 What I Learned</a>

This project wasn’t just about recreating a design; it was a comprehensive learning experience that pushed me to expand my skills across several key areas of web development.

Building this project gave me a much deeper understanding of how authentication, data flow, and testing come together in a full-stack Next.js application.

I explored the different ways authentication can be implemented, including session storage in MongoDB, Redis, and local storage. A tutorial that broke down this concept [brilliantly](https://www.youtube.com/watch?v=yoiBv0K6_1U&t=3126s)
helped me understand how session tokens can be stored, validated, and refreshed across requests, and how these strategies differ in performance and security.

I also gained a better understanding of how Next.js handles cookies through the cookie header — how session data travels securely between client and server, and how to control cookie visibility, expiration, and HTTP-only flags to keep sessions safe.

On the backend, I learned the importance of global variables for maintaining persistent MongoDB connections during development. Using a global variable to cache the connection prevents reconnections during hot reloads and drastically improves performance — a simple yet powerful optimization that clarified how server environments work in practice.

This project also introduced me to Vitest, where I learned how to set it up with Next.js for component and server testing. I discovered the power of mocking, which allowed me to simulate requests, MongoDB responses, Redis calls, and cookie behaviors without relying on live services — making tests faster and more predictable. Integrating mongodb-memory-server was another huge step, letting me spin up an in-memory MongoDB instance for isolated, repeatable backend tests.

Finally, I practiced using Git branching strategies more deliberately — creating branches for features, fixes, and experiments — to mirror a professional workflow and maintain clean commit histories.

Together, these lessons made me more confident in designing apps that are not just functional, but also maintainable, testable, and scalable.

## <a name="quick-start">🙌 Quick Start</a>

To get started with the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/SidorovaMaria/bookmark-manager.git
   cd bookmark-manager
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env.local` file in the root directory and add the following variables:
   To set up Google OAuth credentials, you need to create a project in the [Google Developer Console](https://console.developers.google.com/), enable the "Google+ API", and create OAuth 2.0 credentials. Set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google` for local development.

   ```env
   MONGODB_URI="your_mongodb_connection_string"
   REDIS_URL="your_redis_connection_string"
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to see the app in action.

## <a name="credits">👁 Credits</a>

- [Frontend Mentor](https://www.frontendmentor.io/) for the design files and inspiration.
- [Next.js](https://nextjs.org/) for the powerful React framework.
- [React](https://reactjs.org/) for building the user interface.
- [TypeScript](https://www.typescriptlang.org/) for static typing.
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for the accessible and customizable UI components.
- [MongoDB](https://www.mongodb.com/) for the database solution.
- [Redis](https://redis.io/) for session management.
