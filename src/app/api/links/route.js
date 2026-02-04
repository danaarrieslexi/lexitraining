import { NextResponse } from "next/server";
import { addLink } from "../../lib/db";

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    const newLink = await addLink(url);
    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error("Error adding link:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    });
    
    // In development, return the actual error message
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: "Failed to add link",
        message: isDev ? error?.message : undefined,
        details: isDev ? {
          name: error?.name,
          code: error?.code
        } : undefined
      },
      { status: 500 }
    );
  }
}
