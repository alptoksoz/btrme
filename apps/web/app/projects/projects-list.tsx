'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@btrme/ui'
import {
  Grid3x3,
  List,
  Search,
  SortAsc,
  SortDesc,
  Clock,
  FileCode2,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

type Project = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    generations: number
  }
}

type ProjectsListProps = {
  projects: Project[]
}

type ViewMode = 'grid' | 'list'
type SortBy = 'updated' | 'created' | 'name' | 'generations'
type SortOrder = 'asc' | 'desc'

export function ProjectsList({ projects }: ProjectsListProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'updated':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'generations':
          comparison = b._count.generations - a._count.generations
          break
      }

      return sortOrder === 'asc' ? -comparison : comparison
    })

    return result
  }, [projects, searchQuery, sortBy, sortOrder])

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) return

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete project')

      router.refresh()
    } catch (error) {
      alert('Failed to delete project')
    }
  }

  const handleDuplicate = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to duplicate project')

      router.refresh()
    } catch (error) {
      alert('Failed to duplicate project')
    }
  }

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>No projects yet</CardTitle>
          <CardDescription className="mt-2">
            Create your first AI-generated project to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 justify-center">
            <Link href="/studio">
              <Button size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Open AI Studio
              </Button>
            </Link>
            <Link href="/generate">
              <Button size="lg" variant="outline">
                Quick Generate
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              {sortOrder === 'asc' ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              Sort: {sortBy === 'updated' ? 'Updated' : sortBy === 'created' ? 'Created' : sortBy === 'name' ? 'Name' : 'Generations'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleSort('updated')}>
              <Clock className="mr-2 h-4 w-4" />
              Last Updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort('created')}>
              <Clock className="mr-2 h-4 w-4" />
              Date Created
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort('name')}>
              <FileCode2 className="mr-2 h-4 w-4" />
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort('generations')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedProjects.length === projects.length ? (
          <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        ) : (
          <span>
            {filteredAndSortedProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Projects Grid/List */}
      {filteredAndSortedProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">No projects match your search</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project) => (
            <Card key={project.id} className="group relative overflow-hidden transition-all hover:shadow-lg">
              {/* Project Icon/Thumbnail */}
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(project.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(project.id, project.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href={`/projects/${project.id}`}>
                <div className="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center border-b">
                  <FileCode2 className="h-12 w-12 text-primary/40" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">
                      <Sparkles className="mr-1 h-3 w-3" />
                      {project._count.generations}
                    </Badge>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedProjects.map((project) => (
            <Card key={project.id} className="group transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-background flex items-center justify-center border">
                    <FileCode2 className="h-6 w-6 text-primary/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="font-semibold hover:underline line-clamp-1">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {project._count.generations} generation{project._count.generations !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/projects/${project.id}`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(project.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(project.id, project.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
