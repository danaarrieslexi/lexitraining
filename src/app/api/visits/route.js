import { NextResponse } from "next/server";
import { saveLinkVisit } from "../../lib/db";

export async function POST(request) {
  try {
    const data = await request.json();
    const { linkId } = data;
    
    if (!linkId) {
      return NextResponse.json(
        { error: "linkId is required" },
        { status: 400 }
      );
    }
    
    const result = await saveLinkVisit(linkId);
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("Error saving visit:", error);
    return NextResponse.json(
      { error: "Failed to save visit", message: error?.message },
      { status: 500 }
    );
  }
}