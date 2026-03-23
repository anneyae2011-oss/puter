import fallbackModels from '@/lib/models_fallback.json';
import { Cpu, Sparkles, MessageSquare, Globe } from 'lucide-react';

async function getModels() {
    // We use the static fallback for the home page to ensure maximum reliability
    // The dropdown and registry will always show the 427 models.
    return fallbackModels.map(id => ({
        id: id,
        key: id,
        name: id.split('/').pop()?.split(':').pop() || id,
        provider: id.includes(':') ? id.split(':')[0] : (id.includes('/') ? id.split('/')[0] : 'Puter')
    }));
}

export default async function Home() {
    const models = await getModels();
    
    // Show top 200 for the grid
    const displayModels = models.slice(0, 200);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                {/* Header */}
                <header className="mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-6 tracking-wider uppercase">
                        <Sparkles className="w-3 h-3" /> Real-time Puter.js Intelligence
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        WandererTrade <span className="text-purple-500">v1</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        The ultimate OpenAI-compatible proxy for Puter's entire AI fleet.
                        Access {models.length} + models with zero limits and global edge routing.
                    </p>
                </header>

                {/* Models Grid */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Cpu className="text-purple-500" /> Live Model Registry ({models.length})
                        </h2>
                        <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayModels.map((model) => (
                            <div key={model.id} className="group relative rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-6 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate max-w-[120px]">
                                        {model.provider}
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                </div>
                                <h3 className="text-sm font-bold mb-2 group-hover:text-purple-400 transition-colors truncate">
                                    {model.name}
                                </h3>
                                <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-black/50 border border-white/5 text-[9px] font-mono text-white/40 group-hover:text-white/70 transition-colors">
                                    <code className="truncate flex-1">{model.id}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {models.length > 200 && (
                        <p className="text-center text-white/20 mt-12 text-sm italic">
                            Showing first 200 models. All {models.length} models are available via the API.
                        </p>
                    )}
                </section>

                {/* API Info Section */}
                <section className="mt-40 grid md:grid-cols-2 gap-12">
                     <div className="p-10 rounded-[40px] bg-gradient-to-br from-purple-500/10 to-transparent border border-white/5 backdrop-blur-3xl">
                        <MessageSquare className="w-10 h-10 text-purple-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Streaming & Sync</h3>
                        <p className="text-white/40 leading-relaxed mb-8">
                            Fully supports both streaming and synchronous completions. Perfect for real-time chat interfaces and background processing alike.
                        </p>
                        <div className="flex items-center gap-3 text-sm font-medium text-white/60">
                            <span className="flex h-2 w-2 rounded-full bg-green-500" /> API Gateway Active
                        </div>
                    </div>
                    <div className="p-10 rounded-[40px] bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5 backdrop-blur-3xl">
                        <Globe className="w-10 h-10 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">WandererTrade Edge</h3>
                        <p className="text-white/40 leading-relaxed mb-8">
                            Low-latency routing across Puter's decentralized compute network. Unlimited throughput with zero regional restrictions.
                        </p>
                        <div className="flex items-center gap-3 text-sm font-medium text-white/60">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500" /> global-edge-v1
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-40 pt-10 border-t border-white/5 text-center">
                    <p className="text-white/20 text-xs font-light tracking-widest uppercase mb-4">
                        Unlimited Tokens • Unlimited Context • No RPD/RPM Limits
                    </p>
                    <p className="text-white/10 text-[10px] font-light">
                         © 2026 WandererTrade • Powered by Puter.js
                    </p>
                </footer>
            </div>
        </main>
    );
}
