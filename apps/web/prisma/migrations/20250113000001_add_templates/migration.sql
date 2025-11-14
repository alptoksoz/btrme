-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templates_category_idx" ON "templates"("category");

-- CreateIndex
CREATE INDEX "templates_published_idx" ON "templates"("published");

-- CreateIndex
CREATE INDEX "templates_usage_count_idx" ON "templates"("usage_count");

-- Insert sample templates
INSERT INTO "templates" ("id", "name", "description", "code", "category", "tags", "published", "created_at", "updated_at") VALUES
(
    'tpl_001',
    'Todo App',
    'Simple todo application with CRUD operations',
    'export default function TodoApp() { return <div>Todo App</div> }',
    'productivity',
    ARRAY['react', 'crud', 'todo'],
    true,
    NOW(),
    NOW()
),
(
    'tpl_002',
    'Landing Page',
    'Modern landing page with hero and features section',
    'export default function LandingPage() { return <div>Landing Page</div> }',
    'marketing',
    ARRAY['landing', 'marketing', 'hero'],
    true,
    NOW(),
    NOW()
),
(
    'tpl_003',
    'Dashboard',
    'Admin dashboard with charts and metrics',
    'export default function Dashboard() { return <div>Dashboard</div> }',
    'admin',
    ARRAY['admin', 'dashboard', 'analytics'],
    true,
    NOW(),
    NOW()
);
