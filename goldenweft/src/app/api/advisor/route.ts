import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    // 1️⃣ Fetch products from DB
    const products = await prisma.product.findMany({
      where: { isActive: true },
    });

    // 2️⃣ Call ML service
    const mlRes = await fetch("http://127.0.0.1:8001/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        products: products.map((p) => ({
          id: p.slug,
          fabric: p.fabric,
          weight: p.weight,
          style: p.style,
          tier: p.tier,
          tones: p.tones,
          occasions: p.occasions,
        })),
      }),
    });

    const mlResponse = await mlRes.json();

    // 🔥 IMPORTANT FIX
    const mlRecommendations = Array.isArray(mlResponse)
      ? mlResponse
        : mlResponse.recommendations ?? [];

      // Store advisor session
      const session = await prisma.advisorSession.create({
        data: {
          answers,
          recommendations: mlRecommendations.map((r: any) => ({
            productId: r.productId,
            score: r.confidence,
            reasons: r.reasons,
          })),
        },
      });


    // 4️⃣ Attach full product info for frontend
    const recommendations = mlRecommendations.map((r: any) => {
      const product = products.find((p) => p.slug === r.productId);
      return {
        product: {
          id: product!.slug,
          name: product!.name,
          fabric: product!.fabric,
          weight: product!.weight,
          style: product!.style,
          tier: product!.tier,
          tones: product!.tones,
          occasion: product!.occasions,
          isNew: product!.isNew,
        },
        confidence: r.confidence,
        reasons: r.reasons,
      };
    });

    return NextResponse.json({
      advisorSessionId: session.id,
      recommendations,
    });
  } catch (err) {
    console.error("Advisor ML integration error:", err);
    return NextResponse.json(
      { error: "Advisor ML failed" },
      { status: 500 }
    );
  }
}
