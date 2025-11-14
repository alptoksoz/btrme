'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Textarea,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Avatar,
} from '@btrme/ui'
import {
  ArrowLeft,
  Settings,
  User,
  Key,
  Sliders,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Upload,
  Save,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function SettingsPage() {
  // Profile state
  const [name, setName] = useState('John Doe')
  const [email, setEmail] = useState('[email protected]')
  const [bio, setBio] = useState('AI enthusiast and developer')

  // Preferences state
  const [theme, setTheme] = useState('system')
  const [defaultModel, setDefaultModel] = useState('gpt-4')
  const [codeStyle, setCodeStyle] = useState('typescript')
  const [autoSave, setAutoSave] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Key', key: 'btrme_*********************abc', createdAt: '2024-01-15', lastUsed: '2 hours ago' },
    { id: '2', name: 'Development Key', key: 'btrme_*********************xyz', createdAt: '2024-01-10', lastUsed: 'Never' },
  ])
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newGeneratedKey, setNewGeneratedKey] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Danger zone state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Profile functions
  const handleProfileUpdate = async () => {
    // TODO: API call to update profile
    console.log('Updating profile...', { name, email, bio })
  }

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload
    console.log('Upload avatar')
  }

  // Preferences functions
  const handlePreferencesUpdate = async () => {
    // TODO: API call to update preferences
    console.log('Updating preferences...', { theme, defaultModel, codeStyle, autoSave, emailNotifications })
  }

  // API Keys functions
  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return

    // TODO: API call to create key
    const newKey = `btrme_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setNewGeneratedKey(newKey)

    const newApiKey = {
      id: String(apiKeys.length + 1),
      name: newKeyName,
      key: newKey.substring(0, 10) + '*********************' + newKey.substring(newKey.length - 3),
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    }

    setApiKeys([...apiKeys, newApiKey])
    setNewKeyName('')
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
  }

  // Danger zone functions
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return

    // TODO: API call to delete account
    console.log('Deleting account...')
    setShowDeleteDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and public details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <div className="h-full w-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      JD
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <Label>Profile Picture</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Avatar
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="[email protected]"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your primary email for notifications and account recovery
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description for your profile. Max 160 characters.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your experience and default settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred theme
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Default AI Model */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="model">Default AI Model</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred AI model for generations
                    </p>
                  </div>
                  <Select value={defaultModel} onValueChange={setDefaultModel}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Code Style */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="code-style">Code Style</Label>
                    <p className="text-sm text-muted-foreground">
                      Preferred code style for generated components
                    </p>
                  </div>
                  <Select value={codeStyle} onValueChange={setCodeStyle}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript-strict">TypeScript (Strict)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Auto Save */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save generations to your projects
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <Separator />

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account activity
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePreferencesUpdate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage your API keys for programmatic access
                    </CardDescription>
                  </div>
                  <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New API Key</DialogTitle>
                        <DialogDescription>
                          Give your API key a descriptive name to remember its purpose
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="key-name">Key Name</Label>
                          <Input
                            id="key-name"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g., Production API, Development"
                          />
                        </div>
                        {newGeneratedKey && (
                          <div className="space-y-2">
                            <Label>Your New API Key</Label>
                            <div className="flex gap-2">
                              <Input value={newGeneratedKey} readOnly className="font-mono text-xs" />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyKey(newGeneratedKey)}
                              >
                                {copiedKey === newGeneratedKey ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-destructive">
                              Make sure to copy your API key now. You won't be able to see it again!
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewKeyDialog(false)
                            setNewKeyName('')
                            setNewGeneratedKey('')
                          }}
                        >
                          {newGeneratedKey ? 'Done' : 'Cancel'}
                        </Button>
                        {!newGeneratedKey && (
                          <Button onClick={handleCreateApiKey} disabled={!newKeyName.trim()}>
                            Create Key
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No API keys yet</p>
                      <p className="text-sm mt-1">Create your first API key to get started</p>
                    </div>
                  ) : (
                    apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{apiKey.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              Created {apiKey.createdAt}
                            </Badge>
                          </div>
                          <p className="text-sm font-mono text-muted-foreground truncate">
                            {apiKey.key}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last used: {apiKey.lastUsed}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyKey(apiKey.key)}
                          >
                            {copiedKey === apiKey.key ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete API Key</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "{apiKey.name}"? This action cannot be undone and will immediately revoke access.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteApiKey(apiKey.id)}
                                >
                                  Delete Key
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that require careful consideration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-destructive/50 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-destructive mb-1">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. All your projects,
                        generations, and data will be permanently deleted.
                      </p>
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete My Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-destructive">
                              Are you absolutely sure?
                            </DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove all your data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="delete-confirm">
                                Type <span className="font-bold">DELETE</span> to confirm
                              </Label>
                              <Input
                                id="delete-confirm"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="DELETE"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowDeleteDialog(false)
                                setDeleteConfirmation('')
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={deleteConfirmation !== 'DELETE'}
                            >
                              Delete My Account
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
