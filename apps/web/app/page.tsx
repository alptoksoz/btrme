import Link from 'next/link'
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@btrme/ui'
import {
  Sparkles,
  Zap,
  Code2,
  Rocket,
  Layers,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  Heart,
  Terminal,
  GitBranch,
  Box,
  Palette,
  ChevronRight,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="container mx-auto px-6 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered No-Code Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Ideas into{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient-x">
                Deployed Apps
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              No code, no limits. Build production-ready React components with AI in seconds.
              From concept to deployment in minutes, not months.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/studio">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Layers className="mr-2 h-5 w-5" />
                  Browse Templates
                </Button>
              </Link>
            </div>

            {/* Demo Video/Screenshot Placeholder */}
            <div className="relative rounded-xl border-4 border-primary/20 shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <Terminal className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-sm text-muted-foreground">AI Studio Demo</p>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text mb-2">
                10K+
              </div>
              <p className="text-sm text-muted-foreground">Projects Created</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text mb-2">
                50K+
              </div>
              <p className="text-sm text-muted-foreground">Generations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text mb-2">
                5K+
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-primary text-transparent bg-clip-text mb-2">
                99.9%
              </div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to build
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features that make development faster, smarter, and more enjoyable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate production-ready components in seconds with our optimized AI models
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart AI Models</h3>
              <p className="text-muted-foreground">
                Multiple AI models (GPT-4, Claude, Gemini) optimized for different use cases
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Template Library</h3>
              <p className="text-muted-foreground">
                Start from 100+ professionally designed templates or build from scratch
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Iterative Refinement</h3>
              <p className="text-muted-foreground">
                Refine and iterate on your components with natural language instructions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-muted-foreground">
                Generated code follows best practices, fully typed, and ready to deploy
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all group">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">One-Click Deploy</h3>
              <p className="text-muted-foreground">
                Deploy your components to Vercel, Netlify, or export as standalone projects
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">
              <GitBranch className="h-3 w-3 mr-1" />
              Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From idea to reality in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Describe</h3>
              <p className="text-muted-foreground">
                Tell the AI what you want to build in plain English
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate</h3>
              <p className="text-muted-foreground">
                Watch as AI creates production-ready code in seconds
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Deploy</h3>
              <p className="text-muted-foreground">
                One click to deploy or export your project anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4">
            <Heart className="h-3 w-3 mr-1" />
            Testimonials
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by developers worldwide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "BTRMe has completely transformed how I prototype. What used to take days now takes minutes. The AI understands exactly what I need."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  SJ
                </div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Frontend Lead @ TechCorp</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "As a designer who codes, BTRMe is a game-changer. I can now bring my designs to life without getting stuck on implementation details."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  MC
                </div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Product Designer @ StartupXYZ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The quality of generated code is exceptional. Type-safe, follows best practices, and actually maintainable. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  EP
                </div>
                <div>
                  <p className="font-semibold">Emma Peterson</p>
                  <p className="text-sm text-muted-foreground">Engineering Manager @ DevStudio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Plans that scale with you
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full mb-6">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">10 generations per month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">3 projects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic AI model (GPT-3.5)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Community templates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Code export</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="border-4 border-primary relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/auth/signup">
                  <Button className="w-full mb-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited generations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited projects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced AI models (GPT-4, Claude)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Premium templates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">One-click deployment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Version history</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/contact">
                  <Button variant="outline" className="w-full mb-6">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Team collaboration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom AI models</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Private templates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SSO & Advanced security</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SLA guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4">
            <Palette className="h-3 w-3 mr-1" />
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                What AI models does BTRMe use?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  BTRMe supports multiple AI models including GPT-4, Claude 3, and Gemini Pro. Free users get access to GPT-3.5, while Pro and Enterprise users can choose from our full range of models for different use cases.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Can I export the generated code?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Yes! All generated code is yours to keep. You can export it as a standalone project, copy individual components, or deploy directly to platforms like Vercel or Netlify with one click.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Is the generated code production-ready?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Absolutely. Our AI generates TypeScript code that follows industry best practices, includes proper typing, handles edge cases, and is optimized for performance. Every component is tested and ready to deploy.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                What frameworks are supported?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  BTRMe currently specializes in React components with TypeScript. We support Next.js, Create React App, Vite, and other React frameworks. Support for Vue, Svelte, and Angular is coming soon.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                How does billing work?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Billing is monthly and you can cancel anytime. Free plan requires no credit card. Pro plan starts at $29/month with a 14-day free trial. Enterprise plans are custom-priced based on your team's needs.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Can I collaborate with my team?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Team collaboration is available on Enterprise plans. You can share projects, templates, and work together in real-time. Contact our sales team to learn more about team features.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-24">
        <Card className="border-4 border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to build the future?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building faster with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/studio">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Users className="mr-2 h-5 w-5" />
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial on Pro
            </p>
          </CardContent>
        </Card>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  )
}
