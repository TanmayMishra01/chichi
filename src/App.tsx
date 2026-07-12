import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coffee, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight
} from "lucide-react";

interface SampleReview {
  id: string;
  type: "positive" | "negative" | "mixed";
  text: string;
}

const SAMPLE_REVIEWS: SampleReview[] = [
  {
    id: "1",
    type: "positive",
    text: "The cardamom chai was absolutely incredible, and the warm vegetable cutlets were perfectly spiced! The staff is incredibly friendly. Easily the best chai spot in Kolkata!",
  },
  {
    id: "2",
    type: "negative",
    text: "I was super excited to try this place, but the ginger chai was lukewarm and tasted mostly of hot water. Plus, we had to wait 25 minutes just for two cups.",
  },
  {
    id: "3",
    type: "mixed",
    text: "The kulhad chai has a wonderfully authentic aroma, but the cafe is extremely cramped and they don't have enough tables during the evening rush.",
  },
];

export default function App() {
  const [review, setReview] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;

    setIsLoading(true);
    setError(null);
    setReply("");
    setIsCopied(false);

    try {
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ review }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while generating the reply.");
      }

      setReply(data.reply);
    } catch (err: any) {
      setError(err.message || "Unable to connect to the server. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const selectSample = (text: string) => {
    setReview(text);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFFBEB] font-sans">
      {/* Header Section */}
      <header className="bg-[#1E3A8A] text-white py-5 px-6 md:px-10 shadow-xl flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-inner text-[#1E3A8A]">
            <Coffee className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-display text-white">
              Chai Point
            </h1>
            <p className="text-[#FDE68A] text-[10px] md:text-xs font-semibold uppercase tracking-widest">
              Est. Kolkata • Feedback Intelligence
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="bg-[#F59E0B] text-[#1E3A8A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
            Owner Mode
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8 items-stretch">
        
        {/* Left Column: Input Panel */}
        <section className="flex-1 flex flex-col">
          <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 shadow-xl border-4 border-[#FDE68A] flex flex-col flex-1 h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-2.5 h-8 bg-[#F59E0B] rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] font-display">
                Customer Review
              </h2>
            </div>
            
            <form onSubmit={handleGenerate} className="flex flex-col flex-1 gap-4">
              <div className="flex justify-between items-center">
                <label 
                  htmlFor="review-input" 
                  className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide"
                >
                  Paste the customer review here
                </label>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                  {review.length} chars
                </span>
              </div>
              
              <textarea
                id="review-input"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Example: The masala chai was excellent but the samosas took quite long to arrive..."
                className="flex-1 w-full min-h-[160px] lg:min-h-[220px] p-5 sm:p-6 bg-amber-50/40 rounded-3xl border-2 border-transparent focus:border-[#F59E0B] focus:bg-white outline-none text-slate-700 resize-none leading-relaxed text-sm sm:text-base transition-all shadow-inner"
              />

              {/* Quick Test Samples */}
              <div className="space-y-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick-test Review Templates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_REVIEWS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => selectSample(sample.text)}
                      className="flex items-start gap-2 text-left bg-amber-50/50 hover:bg-amber-100/60 border border-amber-100 hover:border-amber-300 rounded-xl p-2.5 transition-all duration-200 text-xs text-slate-600 cursor-pointer"
                    >
                      <span className="mt-0.5 shrink-0">
                        {sample.type === "positive" && <ThumbsUp className="w-3.5 h-3.5 text-green-600" />}
                        {sample.type === "negative" && <ThumbsDown className="w-3.5 h-3.5 text-red-500" />}
                        {sample.type === "mixed" && <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />}
                      </span>
                      <span className="line-clamp-2 leading-tight font-medium">
                        {sample.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isLoading || !review.trim()}
                className="mt-4 w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-[#1E3A8A] py-4 sm:py-5 rounded-full font-black text-lg sm:text-xl shadow-lg disabled:shadow-none hover:shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>CRAFTING RESPONSE...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Reply</span>
                    <Sparkles className="h-6 w-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Suggested Reply Panel */}
        <section className="flex-1 flex flex-col">
          <div className="bg-[#1E3A8A] rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl flex flex-col flex-1 h-full relative overflow-hidden text-white border-4 border-[#1E3A8A]">
            
            {/* Decorative Background Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F59E0B] opacity-10 rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#FDE68A] opacity-5 rounded-full pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-5 z-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-8 bg-[#F59E0B] rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Suggested Reply
                </h2>
              </div>
              
              {reply && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-white/10 hover:bg-white/20 text-[#FDE68A] hover:text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/10"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-300" />
                      <span className="text-green-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Response Content Frame */}
            <div className="flex-1 flex flex-col justify-between z-10">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="vibrant-error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-grow flex flex-col justify-center items-center text-center p-6 bg-red-500/10 border-2 border-red-500/30 rounded-3xl min-h-[220px]"
                  >
                    <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                    <h3 className="text-base font-bold text-red-200 uppercase tracking-wider font-display">
                      Generation Failed
                    </h3>
                    <p className="text-sm text-red-300/95 leading-relaxed mt-1.5 max-w-sm">
                      {error}
                    </p>
                  </motion.div>
                )}

                {!error && !reply && !isLoading && (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col justify-center items-center text-center p-6 sm:p-8 text-white/50 border border-white/10 bg-white/5 rounded-3xl min-h-[220px]"
                  >
                    <Coffee className="w-14 h-14 text-[#F59E0B] mb-4 opacity-70 animate-pulse" />
                    <h3 className="font-display font-bold text-lg text-white/90">
                      No reply generated yet
                    </h3>
                    <p className="text-xs text-white/40 max-w-xs mt-2 leading-relaxed">
                      Enter or select a customer review on the left and click "Generate Reply" to draft an exceptional responder message.
                    </p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    key="loading-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col justify-center items-center text-center p-6 sm:p-8 text-white/80 border border-white/10 bg-white/5 rounded-3xl min-h-[220px]"
                  >
                    <RefreshCw className="w-14 h-14 text-[#F59E0B] mb-4 animate-spin" />
                    <h3 className="font-display font-bold text-lg text-[#FDE68A]">
                      Chai Point Owner is thinking...
                    </h3>
                    <p className="text-xs text-white/50 max-w-xs mt-2 leading-relaxed">
                      Drafting a short, warm, and genuine reply under 90 words. Just a moment!
                    </p>
                  </motion.div>
                )}

                {reply && !isLoading && !error && (
                  <motion.div
                    key="reply-state"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="flex-grow flex flex-col justify-between bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 min-h-[220px]"
                  >
                    <p className="text-lg sm:text-xl text-white font-medium leading-relaxed italic whitespace-pre-wrap relative pl-4">
                      <span className="absolute left-0 top-0 text-amber-400 font-serif text-3xl select-none leading-none">“</span>
                      {reply}
                    </p>
                    
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[#FDE68A] font-bold tracking-wider uppercase">
                        Ready to send
                      </span>
                      <span className="text-white/40 font-mono">
                        {reply.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="bg-amber-100/40 py-4 px-6 md:px-10 border-t border-amber-200/50 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] gap-2 sm:gap-0 mt-auto">
        <span>Chai Point AI Responder v2.0</span>
        <span>Handcrafted for the heart of Kolkata</span>
        <span>Gemini Powered</span>
      </footer>
    </div>
  );
}
