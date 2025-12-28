"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import AdvisorProductCard from "./AdvisorProductCard";

export default function AdvisorResult({
  answers,
}: {
  answers: Record<string, string>;
}) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });

        const data = await res.json();

        // ✅ HARD GUARANTEE: results is always an array
        const safeResults = Array.isArray(data.recommendations)
          ? data.recommendations
          : Array.isArray(data.recommendations?.items)
          ? data.recommendations.items
          : [];

        setResults(safeResults);

        if (data.advisorSessionId) {
          localStorage.setItem(
            "advisorSessionId",
            data.advisorSessionId
          );
        }
      } catch (err) {
        console.error("Advisor fetch failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [answers]);

  if (loading) {
    return (
      <Section>
        <Text>Curating silks for you…</Text>
      </Section>
    );
  }

  return (
    <Section>
      <div className="max-w-4xl">
        <Text as="h1">Your GoldenWeft Edit</Text>

        {results.length === 0 ? (
          <Text className="mt-6">
            No close matches found. Try adjusting preferences.
          </Text>
        ) : (
          <div className="mt-10 space-y-8">
            {results.map((item, index) => (
              <AdvisorProductCard
                key={item.product.id}
                product={item.product}
                reasons={item.reasons}
                confidence={item.confidence}
                highlight={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
