import { Link } from '@tanstack/react-router'
import { Bot, Zap, Shield, MessageSquare, Code2, Globe, ChevronRight, Check, Sparkles, Star } from 'lucide-react'

const features = [
  { icon: Bot, title: 'Advanced AI Models', desc: 'Powered by GPT-4.1, Claude, and Gemini — the most capable language models available.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Streaming responses with sub-second latency. No waiting, just instant intelligent answers.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your conversations are encrypted and never used to train models. Full data sovereignty.' },
  { icon: MessageSquare, title: 'Multi-Conversation', desc: 'Manage dozens of ongoing chats. Organize, search, and resume any conversation instantly.' },
  { icon: Code2, title: 'Code Intelligence', desc: 'Syntax-highlighted code blocks, debugging assistance, and multi-language support.' },
  { icon: Globe, title: 'Context-Aware', desc: 'Attach files, share context, and get responses tailored to your specific needs.' },
]

const packages = [
  { name: 'Starter', tokens: 5000, price: 5, popular: false, desc: 'Perfect for light use', features: ['5,000 tokens', 'All AI models', 'Chat history', 'Code formatting'] },
  { name: 'Pro', tokens: 25000, price: 19, popular: true, desc: 'Most popular choice', features: ['25,000 tokens', 'All AI models', 'Unlimited history', 'Priority support', 'File uploads'] },
  { name: 'Ultimate', tokens: 100000, price: 59, popular: false, desc: 'For power users', features: ['100,000 tokens', 'All AI models', 'Unlimited history', 'Priority support', 'File uploads', 'API access'] },
]

const faqs = [
  { q: 'What are tokens?', a: 'Tokens are units of text processed by AI models. Roughly 750 words = 1,000 tokens. Each message you send and receive uses tokens.' },
  { q: 'Do unused tokens expire?', a: 'No. Your purchased tokens never expire and remain in your account until used.' },
  { q: 'Can I switch between AI models?', a: 'Yes. All plans have access to our full suite of AI models. Switch any time within a conversation.' },
  { q: 'Is there a free trial?', a: 'Yes! New accounts receive 1,000 complimentary tokens to explore the platform.' },
  { q: 'How secure is my data?', a: 'All conversations are encrypted in transit and at rest. We never share your data or use it to train models.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">NexusAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</Link>
            <Link to="/signup" className="btn-glow text-sm text-white font-medium px-4 py-1.5 rounded-lg">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6 animate-fade-in">
            <Star className="w-3 h-3" />
            1,000 free tokens with every account
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            The AI that{' '}
            <span className="gradient-text">thinks with you</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">
            NexusAI combines the world's best language models with a beautifully designed interface. Chat, code, create — powered by tokens you control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
            <Link to="/signup" className="btn-glow text-white font-semibold px-8 py-3.5 rounded-xl text-base flex items-center gap-2 justify-center">
              Start for free <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl text-base font-medium border border-border hover:border-primary/50 hover:bg-secondary transition-all flex items-center gap-2 justify-center">
              Sign in
            </Link>
          </div>

          {/* Hero mockup */}
          <div className="mt-16 relative animate-fade-in-up stagger-4">
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg" style={{ boxShadow: '0 32px 80px hsl(257 93% 68% / 0.15)' }}>
              <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-yellow-500/70" /><div className="w-3 h-3 rounded-full bg-green-500/70" /></div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-mono">nexusai.app — chat</div>
              </div>
              <div className="bg-background p-6 space-y-4 text-left">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-sm">U</div>
                  <div className="message-user rounded-2xl rounded-tl-sm px-4 py-3 text-sm">Explain quantum entanglement like I'm 10 years old</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-white" /></div>
                  <div className="message-assistant rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                    Imagine you have two magic coins 🪙🪙 that are best friends. No matter how far apart they are — even if one is on Mars — when you flip one and it lands on heads, the other one <em>instantly</em> lands on tails. That's quantum entanglement! Einstein called it "spooky action at a distance."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built for individuals and teams who take AI seriously.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={f.title} className={`p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group relative border-beam animate-fade-in-up stagger-${i + 1}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple token pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Pay only for what you use. No subscriptions, no hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <div key={pkg.name} className={`p-6 rounded-2xl border relative overflow-hidden transition-all animate-fade-in-up stagger-${i + 1} ${pkg.popular ? 'border-primary/60 bg-card' : 'border-border bg-card hover:border-primary/30'}`} style={pkg.popular ? { boxShadow: '0 0 40px hsl(257 93% 68% / 0.15)' } : {}}>
                {pkg.popular && (
                  <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'var(--gradient-primary)' }} />
                )}
                {pkg.popular && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary mb-3">
                    <Star className="w-3 h-3" /> Most popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${pkg.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">one-time</span>
                  <div className="text-sm text-primary font-medium mt-1">{pkg.tokens.toLocaleString()} tokens</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${pkg.popular ? 'btn-glow text-white' : 'border border-border hover:border-primary/50 hover:bg-secondary'}`}>
                  Get started <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Questions answered</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`p-6 rounded-2xl border border-border bg-card animate-fade-in-up stagger-${i + 1}`}>
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl border border-primary/20 bg-card relative overflow-hidden" style={{ boxShadow: '0 0 80px hsl(257 93% 68% / 0.1)' }}>
            <div className="absolute inset-0 opacity-10" style={{ background: 'var(--gradient-hero)' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Start for free today</h2>
              <p className="text-muted-foreground mb-8">1,000 free tokens. No credit card required.</p>
              <Link to="/signup" className="btn-glow text-white font-semibold px-10 py-4 rounded-xl text-base inline-flex items-center gap-2">
                Create free account <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded btn-glow flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">NexusAI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 NexusAI. Built with advanced AI models.</p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/signup" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
