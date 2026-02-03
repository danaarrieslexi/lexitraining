import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({items:[{id:1, title:"Hello Dana"}]}, { status: 200 });
  }  

//export async function POST() {
//  return NextResponse.json({ hello: "World" }, { status: 200 });
//}
