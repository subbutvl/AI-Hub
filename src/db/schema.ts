import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  instructions: text('instructions').notNull(),
  category: text('category'),
  language: text('language'),
  version: text('version').notNull().default('1.0.0'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const repos = sqliteTable('repos', {
  id: text('id').primaryKey(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  repo: text('repo').notNull(),
  stars: integer('stars'),
  language: text('language'),
  topics: text('topics', { mode: 'json' }).$type<string[]>(),
  category: text('category').notNull(),
  recursive: integer('recursive', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  pipelineTested: integer('pipeline_tested', { mode: 'boolean' }),
  readmeContextId: text('readme_context_id'),
  createdAt: integer('created_at').notNull(), // Swapped to integer for unix ms
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  enableRepoHub: integer('enable_repo_hub', { mode: 'boolean' }).notNull().default(true),
  enableSkillHub: integer('enable_skill_hub', { mode: 'boolean' }).notNull().default(true),
  enableWebHub: integer('enable_web_hub', { mode: 'boolean' }).notNull().default(true),
  enableStackBuilder: integer('enable_stack_builder', { mode: 'boolean' }).notNull().default(true),
  enableRssFeeds: integer('enable_rss_feeds', { mode: 'boolean' }).notNull().default(true),
  enablePodcasts: integer('enable_podcasts', { mode: 'boolean' }).notNull().default(true),
  enableBackgroundQuerying: integer('enable_background_querying', { mode: 'boolean' }).notNull().default(false),
  webHubLayout: text('web_hub_layout').notNull().default('grid'),
  hasSeenWelcome: integer('has_seen_welcome', { mode: 'boolean' }).notNull().default(false),
});

export const webHubItems = sqliteTable('web_hub_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  type: text('type').notNull(), // article, resource, tool, etc.
  addedAt: text('added_at').notNull(),
});

export const featuredItems = sqliteTable('featured_items', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  type: text('type').notNull(),
  addedAt: text('added_at').notNull(),
});

export const useCases = sqliteTable('use_cases', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    tools: text('tools', { mode: 'json' }).$type<string[]>().notNull(),
    steps: text('steps', { mode: 'json' }).$type<string[]>().notNull(),
    createdAt: text('created_at').notNull(),
});

export const podcasts = sqliteTable('podcasts', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    source: text('source').notNull(),
    url: text('url').notNull(),
    description: text('description'),
    publishedAt: text('published_at').notNull(),
});

export const pipelines = sqliteTable('pipelines', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    status: text('status').notNull(), // success, failed, running
    repoId: text('repo_id').notNull(),
    logs: text('logs'),
    startedAt: text('started_at').notNull(),
    completedAt: text('completed_at'),
});

export const rssFeeds = sqliteTable('rss_feeds', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    source: text('source').notNull(),
    publishedAt: text('published_at').notNull(),
});
