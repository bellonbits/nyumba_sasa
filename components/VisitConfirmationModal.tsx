"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, ThumbsUp, ThumbsDown, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface VisitConfirmationModalProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

type Answer = "yes" | "no" | null;

interface Answers {
  was_real: Answer;
  pricing_accurate: Answer;
  was_available: Answer;
}

export default function VisitConfirmationModal({ listingId, listingTitle, onClose }: VisitConfirmationModalProps) {
  const [answers, setAnswers] = useState<Answers>({ was_real: null, pricing_accurate: null, was_available: null });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = [
    {
      key: "was_real" as const,
      question: "Did the property actually exist as listed?",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
    {
      key: "pricing_accurate" as const,
      question: "Was the price accurate to what was advertised?",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    },
    {
      key: "was_available" as const,
      question: "Was the property actually available for rent/purchase?",
      icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />,
    },
  ];

  const allAnswered = Object.values(answers).every((a) => a !== null);

  async function handleSubmit() {
    if (!allAnswered) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/visits/confirm", {
        method: "POST",
        body: JSON.stringify({
          listing_id: listingId,
          was_real: answers.was_real === "yes",
          pricing_accurate: answers.pricing_accurate === "yes",
          was_available: answers.was_available === "yes",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch (e) {
      setError("Could not submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const negativeCount = Object.values(answers).filter((a) => a === "no").length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-t-3xl px-5 pt-5 pb-safe shadow-2xl"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          {/* Handle bar */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <ThumbsUp className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Thanks for your feedback!</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Your community report helps keep Nyumba Sasa honest and fake-listing free.
              </p>
              {negativeCount >= 2 && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 text-left">
                  ⚠️ This listing has been flagged for review based on your report.
                </div>
              )}
              <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-semibold">
                Done
              </button>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Post-Visit Report</h2>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{listingTitle}</p>
                </div>
                <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Help other renters by confirming what you experienced. Your report is anonymous and contributes to the landlord&apos;s trust score.
              </p>

              <div className="space-y-3">
                {questions.map(({ key, question, icon }) => (
                  <div key={key} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start gap-2 mb-3">
                      {icon}
                      <p className="text-sm font-medium text-gray-800 leading-snug">{question}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAnswers((a) => ({ ...a, [key]: "yes" }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          answers[key] === "yes"
                            ? "bg-green-500 text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-green-50"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> Yes
                      </button>
                      <button
                        onClick={() => setAnswers((a) => ({ ...a, [key]: "no" }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          answers[key] === "no"
                            ? "bg-red-500 text-white"
                            : "bg-gray-50 text-gray-600 hover:bg-red-50"
                        }`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" /> No
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-xs text-red-500 text-center mt-3">{error}</p>
              )}

              <button
                disabled={!allAnswered || loading}
                onClick={handleSubmit}
                className={`mt-4 w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  allAnswered && !loading
                    ? "bg-gray-900 text-white hover:bg-black"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
