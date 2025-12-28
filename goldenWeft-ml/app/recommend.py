from typing import List
from .schemas import Product, Recommendation


def recommend_products(
    answers: dict,
    products: List[Product]
) -> List[Recommendation]:

    print("🔥 ML RECEIVED ANSWERS:", answers)
    print("🔥 ML RECEIVED PRODUCTS COUNT:", len(products))

    recommendations: List[Recommendation] = []

    for p in products:
        score = 0
        reasons = []

        print("----")
        print("Checking product:", p.id)
        print("Occasions:", p.occasions)
        print("Style:", p.style, "| Tier:", p.tier)

        # 1️⃣ Occasion
        if answers.get("occasion") in p.occasions:
            score += 30
            reasons.append("Matches your occasion")

        # 2️⃣ Drape
        if answers.get("drape"):
            if "light" in answers["drape"].lower() and p.weight.lower() == "light":
                score += 20
                reasons.append("Preferred light drape")
            elif "heavy" in answers["drape"].lower() and p.weight.lower() == "heavy":
                score += 20
                reasons.append("Preferred rich drape")

        # 3️⃣ Style
        if answers.get("style") == p.style:
            score += 20
            reasons.append("Aligns with your style preference")

        # 4️⃣ Tone
        if answers.get("tone") in p.tones:
            score += 15
            reasons.append("Complements your undertone")

        # 5️⃣ Investment
        if answers.get("investment") == p.tier:
            score += 15
            reasons.append("Fits your investment preference")

        print("Final score:", score)

        if score > 0:
            recommendations.append(
                Recommendation(
                    productId=p.id,
                    confidence=min(score, 100),
                    reasons=reasons[:3],
                )
            )

    print("🔥 ML FINAL RECOMMENDATIONS:", recommendations)

    return recommendations
