import Link from 'next/link';
import { Cpu, Zap, Shield, Sparkles, LayoutGrid, MessageSquare } from 'lucide-react';

const PUTER_MODELS = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Flagship high-intelligence model', color: 'from-green-400 to-emerald-600' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Affordable, small model for fast tasks', color: 'from-emerald-400 to-teal-600' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Most intelligent Claude model', color: 'from-orange-400 to-red-600' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fastest and most compact Claude model', color: 'from-amber-400 to-orange-600' },
    { id: 'meta-llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta', description: 'High-performance open-source model', color: 'from-blue-400 to-indigo-600' },
    { id: 'meta-llama-3-8b-instruct', name: 'Llama 3 8B', provider: 'Meta', description: 'Efficient open-source model', color: 'from-indigo-400 to-purple-600' },
];

export default function Home() {
    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                {/* Header */}
                <header className="mb-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-6 tracking-wider uppercase">
                        <Sparkles className="w-3 h-3" /> Powered by Puter.js
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        WandererTrade <span className="text-purple-500">v1</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        Unlimited OpenAI-compatible API endpoint for all Puter AI models. 
                        Zero limits, zero latency.
                    </p>
                </header>

                {/* API Info Section */}
                <section className="mb-24 grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl group hover:border-purple-500/30 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Unlimited Throughput</h3>
                        <p className="text-white/40 leading-relaxed">Unlimited RPD and RPM for mission-critical applications and high-frequency trading.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Compatible API</h3>
                        <p className="text-white/40 leading-relaxed">Drop-in replacement for OpenAI. Just point your base URL to our endpoint.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl group hover:border-emerald-500/30 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <LayoutGrid className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">All Puter Models</h3>
                        <p className="text-white/40 leading-relaxed">Access the full fleet of intelligence from GPT-4o to Llama 3 in one place.</p>
                    </div>
                </section>

                {/* Models Grid */}
                <section className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Cpu className="text-purple-500" /> Available Intelligence
                        </h2>
                        <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PUTER_MODELS.map((model) => (
                            <div key={model.id} className="relative group overflow-hidden rounded-[32px] p-[1px] bg-white/10 hover:bg-gradient-to-br transition-all duration-500 hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                                <div className="h-full rounded-[31px] bg-[#0A0A0A] p-8 flex flex-col justify-between backdrop-blur-3xl overflow-hidden relative">
                                    {/* Accent background */}
                                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${model.color} opacity-[0.03] group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`} />
                                    
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-xs font-bold tracking-widest uppercase text-white/30">{model.provider}</span>
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${model.color} shadow-[0_0_12px_rgba(255,255,255,0.2)]`} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors duration-300">{model.name}</h3>
                                        <p className="text-white/40 text-sm leading-relaxed mb-8">{model.description}</p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/60 group-hover:text-white/80 transition-colors">
                                            <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{model.id}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer / CTA */}
                <footer className="mt-40 pt-10 border-t border-white/5 text-center">
                    <p className="text-white/20 text-sm font-light">
                        Model context size: <span className="text-white/40">Unlimited</span> • 
                        WandererTrade API <span className="text-white/40">Active</span> • 
                        © 2026
                    </p>
                </footer>
            </div>
        </main>
    );
}
