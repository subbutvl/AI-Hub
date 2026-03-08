import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbManager } from '../db';
import { useWebHubStore } from '../hooks/useWebHubStore';
import { useFeaturedStore } from '../hooks/useFeaturedStore';
// Need to import Drizzle migration utilities and the compiled schema
// Since we don't have node.js 'fs' to run drizzle-kit migrate directly in browser, 
// we normally either:
// 1. Manually run CREATE TABLE statements on first boot.
// 2. Use a bundled migration script generated from drizzle-kit.

interface DatabaseContextType {
  isInitialized: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const applyInitialSchema = async () => {
    // Initialize tables if they don't exist (Simple baseline fallback if no migrations)
    // We'll execute raw CREATE statements if it's a completely empty database.
    const res = dbManager.sqliteInstance.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='skills';
    `);
    
    if (res.length === 0) {
       console.log("Empty DB detected, applying initial schema...");
       try {
         // In a perfect world we use drizzle migrations, but for simplicity in SQLite WASM
         // we will trigger a quick sync of tables based on our schema definitions.
         // We can hardcode the initial tables for this first migration step.
         dbManager.sqliteInstance.run(INITIAL_SCHEMA);
         dbManager.save();
       } catch(e) {
         console.error("Failed executing initial schema", e);
         throw e; // Re-throw to be caught by the main init error handler
       }
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await dbManager.init();
        
        // Ensure schemas are present the first time
        await applyInitialSchema();

        if (mounted) {
          useWebHubStore.getState().init();
          useFeaturedStore.getState().init();
          setIsInitialized(true);
        }
      } catch (err) {
        console.error("Failed to initialize database", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Failed to initialize local database: {error.message}</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
       <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
             <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
             <p className="text-muted-foreground animate-pulse">Initializing local database...</p>
          </div>
       </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}


const INITIAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS "featured_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"tags" text,
	"type" text NOT NULL,
	"badge" text,
	"created_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "pipelines" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"repo_id" text NOT NULL,
	"logs" text,
	"started_at" text NOT NULL,
	"completed_at" text
);

CREATE TABLE IF NOT EXISTS "podcasts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"published_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "repos" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"repo" text NOT NULL,
	"stars" integer,
	"language" text,
	"topics" text,
	"category" text NOT NULL,
	"recursive" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"tags" text,
	"pipeline_tested" integer,
	"readme_context_id" text,
	"created_at" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "rss_feeds" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"source" text NOT NULL,
	"published_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"enable_repo_hub" integer DEFAULT 1 NOT NULL,
	"enable_skill_hub" integer DEFAULT 1 NOT NULL,
	"enable_web_hub" integer DEFAULT 1 NOT NULL,
	"enable_stack_builder" integer DEFAULT 1 NOT NULL,
	"enable_rss_feeds" integer DEFAULT 1 NOT NULL,
	"enable_podcasts" integer DEFAULT 1 NOT NULL,
	"enable_background_querying" integer DEFAULT 0 NOT NULL,
	"web_hub_layout" text DEFAULT 'grid' NOT NULL,
	"has_seen_welcome" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"instructions" text NOT NULL,
	"category" text NOT NULL,
	"language" text NOT NULL,
	"version" text NOT NULL,
	"tags" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "use_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"tools" text NOT NULL,
	"steps" text NOT NULL,
	"created_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "featured_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"category" text NOT NULL,
	"tags" text,
	"type" text NOT NULL,
	"added_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "web_hub_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"category" text NOT NULL,
	"tags" text,
	"type" text NOT NULL,
	"added_at" text NOT NULL
);
`;
