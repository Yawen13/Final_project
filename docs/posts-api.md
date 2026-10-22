# Posts API 契约

前端已经按这份契约写好调用。后端可以直接合并参考实现，也可以自己实现 —— 只要路径、字段名和状态码一致，前端一行都不用改。

- Base URL: `https://unfinished.onrender.com/api`
- 参考实现分支: `backend-posts-api`（基于 `fix-login-validation`，再往下是 `Backend-Monica`）
- 前端调用层: `frontend/src/api/posts.js`、`frontend/src/api/users.js`

## 现在的情况

线上的后端只提供了注册、登录、用户查询、关注/取关和头像上传。帖子、评论、书签、粉丝计数都没有对应接口。

**接口写在哪里？** 不是直接写到 `unfinished.onrender.com` 这个网址上。那个网址只是 Render 在跑这个仓库的某个后端分支。改动要进仓库、合并到部署分支，Render 重新部署后网址上才会出现新接口。

**需要后端同学从头写吗？** 不必。仓库里已经有一版实现：分支 `backend-posts-api`，用内存版 Firestore 跑过 36 项接口测试。可以直接 review / 合并；如果她想自己写，按下面的契约实现即可。

前端目前会先请求 `GET /posts`。如果线上返回 404（说明还没部署），它会自动退回浏览器本地存储，并在控制台提示一次。所以现在不合并也不会坏，只是帖子只存在当前浏览器里。

## 怎么上线

1. 在 Render 后台确认这个服务部署的是哪个分支。很可能是 `Backend-Monica`，运行的是仓库根目录的 `server.js`。
   仓库里还有一个旧副本 `Final_project-Backend-Monica/`，线上跑的不是它；改的时候只改根目录那份。
2. 把 `backend-posts-api` 推到 GitHub，向 `Backend-Monica` 开 PR。
   这个分支已经包含之前的登录校验修复，可以一次合完。
3. 合并后 Render 自动重新部署。
4. 前端什么都不用改。刷新页面，`GET /posts` 返回 200 后就会切到真实数据；之前存在浏览器里的帖子不会自动迁移。

## 通用约定

- 所有路径都挂在 `/api` 下，例如 `https://unfinished.onrender.com/api/posts`。
- 请求和响应都是 JSON；字段名用 camelCase（数据库里怎么存随意，响应必须转成这个格式）。
- 时间统一返回 ISO 8601 字符串，例如 `2026-10-22T08:10:00.000Z`。不要返回 Firestore Timestamp 对象。
- 目前没有 token。需要知道"谁在操作"的接口，由客户端在 body 或 query 里传 `userId`（用户文档 id）。这可以被伪造，是课程项目的简化。
- 错误响应统一用 `{ "message": "给用户看的一句话" }`；前端会直接显示这句话。4xx 必须带 `message`。
- CORS 需要允许任意来源（现有的 `cors()` 默认就是这样）。
- 列表接口接受 `limit`，默认 50，最大 100。

## 帖子

### `POST /posts` — 发帖

text 可以为空，但 text、image、video 不能同时为空。作者信息由后端根据 userId 查用户后写入帖子。

```json
// 请求
{ "userId": "u_123", "text": "Still figuring out the ending…", "image": "", "video": "" }

// 响应 201
{
  "id": "p_9",
  "authorId": "u_123",
  "authorName": "Alice",
  "authorHandle": "@alice",
  "text": "Still figuring out the ending…",
  "image": "",
  "video": "",
  "createdAt": "2026-10-22T08:10:00.000Z",
  "updatedAt": "",
  "likedByMe": false,
  "likeCount": 0,
  "repostedByMe": false,
  "repostCount": 0,
  "bookmarked": false,
  "viewCount": 0,
  "comments": []
}
```

错误：`400` 缺 userId 或内容为空；`404` 用户不存在。

### `GET /posts?userId=&limit=` — 信息流

按创建时间倒序。传 `userId` 时，每篇帖子的 `likedByMe`、`repostedByMe`、`bookmarked` 要反映该用户的状态；不传就都是 false。

```json
// 响应 200
[ { "id": "p_9", "…": "完整帖子对象" } ]
```

空库时必须返回 `200 []`，不能返回 404 —— 前端把 404 当作"这个接口还不存在"。

### `GET /users/:username/posts?userId=&limit=` — 某人的帖子

返回该用户发布的帖子，倒序。用户不存在时 `404 { "message": "User not found" }`。

### `PATCH /posts/:id` — 编辑

只有作者能改。响应返回更新后的完整帖子对象。

```json
// 请求
{ "userId": "u_123", "text": "Edited text" }
```

错误：`400` 文本为空；`403` 不是作者；`404` 帖子不存在。

### `DELETE /posts/:id` — 删除

只有作者能删。删除时要连带清掉这篇帖子的点赞、转发、收藏和评论记录。

```json
// 请求
{ "userId": "u_123" }        // 也接受 ?userId=u_123

// 响应 200
{ "message": "Post deleted" }
```

错误：`403` 不是作者；`404` 帖子不存在。

## 点赞 / 转发 / 收藏

三个接口都是"切换"语义：没点过就点上，点过就取消。重复调用不能报错，计数不能变成负数。

### `POST /posts/:id/like`

```json
// 请求
{ "userId": "u_123" }

// 响应 200
{ "liked": true, "likeCount": 4 }
```

### `POST /posts/:id/repost`

```json
// 响应 200
{ "reposted": true, "repostCount": 2 }
```

### `POST /posts/:id/bookmark`

```json
// 响应 200
{ "bookmarked": true }
```

错误：`400` 缺 userId；`404` 帖子不存在。

## 评论

评论对象：`{ id, author, text, createdAt }`，按时间正序返回。

### `GET /posts/:id/comments`

```json
[ { "id": "c_1", "author": "Bob", "text": "The turn works.", "createdAt": "2026-10-22T08:20:00.000Z" } ]
```

### `POST /posts/:id/comments`

```json
// 请求
{ "userId": "u_123", "text": "The turn works." }

// 响应 201
{ "id": "c_1", "author": "Alice", "text": "The turn works.", "createdAt": "2026-10-22T08:20:00.000Z" }
```

错误：`400` 内容为空；`404` 用户或帖子不存在。

## 收藏列表

### `GET /users/:username/bookmarks?userId=`

按收藏时间倒序返回完整帖子对象，每篇的 `bookmarked` 为 true。被删除的帖子直接跳过。

## 用户资料

### `GET /users/:username` — 现有接口，需补字段

线上已有这个接口，但要补上 `location`、`status`、`profileImageUrl`、`followerCount`、`followingCount`，并把 `createdAt` 改成 ISO 字符串。

```json
{
  "userId": "u_123",
  "username": "alice",
  "displayName": "Alice",
  "bio": "Design student",
  "location": "Pittsburgh",
  "status": "Building",
  "profileImageUrl": "",
  "followerCount": 12,
  "followingCount": 7,
  "createdAt": "2026-10-01T00:00:00.000Z"
}
```

### `PATCH /users/:username` — 编辑资料

只有本人能改（`userId` 必须匹配该用户）。所有字段可选，但至少传一个。

```json
// 请求
{ "userId": "u_123", "displayName": "Alice", "bio": "…", "location": "…", "status": "…", "profileImageUrl": "…" }

// 响应 200
{ "message": "Profile updated" }
```

错误：`403` 不是本人；`404` 用户不存在。

已有的 `POST /auth/register`、`POST /auth/login`、`POST/DELETE /users/:username/follow`、`POST /users/:username/image` 保持不变。

## 数据结构

### 帖子对象（响应）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 帖子 id |
| `authorId` | string | 作者的用户文档 id |
| `authorName` | string | 作者显示名（发帖时快照） |
| `authorHandle` | string | `@username` |
| `text` / `image` / `video` | string | 空字符串表示没有 |
| `createdAt` / `updatedAt` | ISO string | updatedAt 没改过可为空字符串 |
| `likedByMe` | boolean | 当前请求用户是否点过赞 |
| `likeCount` | number | 点赞总数 |
| `repostedByMe` / `repostCount` | boolean / number | 转发 |
| `bookmarked` | boolean | 当前请求用户是否收藏 |
| `viewCount` | number | 暂时可以为 0 |
| `comments` | Comment[] | 信息流里直接内嵌最新评论 |

### 参考实现的集合设计（可自由替换）

只要求响应格式一致，数据库怎么设计由后端同学决定。下面是参考实现的做法。

| 集合 | 字段 | 说明 |
|---|---|---|
| `posts` | `author_id, author_username, author_display_name, text, image, video, created_at, updated_at, like_count, repost_count, bookmark_count, comment_count, view_count` | 作者信息在发帖时快照，避免每次读用户 |
| `likes` / `reposts` / `bookmarks` | `post_id, user_id, created_at` | 文档 id 用 `${postId}_${userId}`，切换时可直接按 id 读写，不用查询 |
| `comments` | `post_id, user_id, author_name, text, created_at` | 作者名快照 |
| `follows` | `follower_id, following_id, created_at` | 已有，用来算粉丝/关注数 |

避免复合索引：参考实现里所有"多条件 + 排序"的查询都拆成单字段等值查询，再在内存里排序。这样 Firebase 不需要手动建复合索引，部署完就能用。

## 前端依赖与验收

- `GET /posts` 空库返回 `200 []`，不能 404。
- 所有成功响应是 JSON，字段名 camelCase，时间是 ISO 字符串。
- 切换类接口每次调用翻转状态，重复调用不报错，计数不小于 0。
- 编辑/删除非本人的帖子返回 `403`，前端不会显示操作菜单，但接口仍要拦住。
- `GET /users/:username` 带粉丝/关注数；编辑资料后重新请求能读到新值。
- CORS 允许 `http://localhost:5173` 和线上前端域名。

快速确认部署：

```bash
curl -s "https://unfinished.onrender.com/api/posts?limit=1"

# 还没部署：Express 默认 404 HTML 页面
# 部署成功：[] 或一个帖子数组
```

## 转给后端同学（可直接复制）

```text
Hi，前端的帖子/书签/评论之前一直用本地假数据，因为后端只有 auth 和 users 接口。现在需要补一组数据接口。

接口契约我放在仓库的 docs/posts-api.md，另外整理了一版：

- 帖子 CRUD：POST /posts、GET /posts、GET /users/:username/posts、PATCH/DELETE /posts/:id
- 互动切换：POST /posts/:id/like、/repost、/bookmark
- 评论：GET/POST /posts/:id/comments
- 收藏列表：GET /users/:username/bookmarks
- 用户资料：GET /users/:username 补 followerCount/followingCount/location/status/profileImageUrl，新增 PATCH /users/:username

我已经按契约写了一版实现，放在新分支 backend-posts-api（基于 fix-login-validation，再往下是 Backend-Monica），用内存 Firestore 测过 36 项。你可以直接 review 后合并到 Backend-Monica，也可以按契约自己实现 —— 只要路径、字段名、状态码一致，前端不用改。

上线只需要合并到 Render 部署的那个分支（大概率是 Backend-Monica，跑的是根目录的 server.js，不是 Final_project-Backend-Monica/ 那个旧副本），Render 会自动重新部署。

注意两点：
1. GET /posts 空库要返回 200 []，不能 404，前端用 404 判断接口还没上线。
2. 时间返回 ISO 字符串，不要直接返回 Firestore Timestamp 对象。

谢谢！
```
