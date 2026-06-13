import { NextResponse } from "next/server";
import { tftData } from "@/lib/tft/data";

export function GET() {
  return NextResponse.json(tftData.traits);
}
