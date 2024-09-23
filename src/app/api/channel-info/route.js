import getYtChannelInfo from "@/services/yt-info";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { url, searchTerms } = body;
  if (!url) {
    throw new ApiError(400, "Url or userName Required!");
  }
  try {
    let userName = url.includes("@") && url.split("@")[1];
    
    const channel = await getYtChannelInfo(`@${userName}`);

    return NextResponse.json(
      {
        message:"Channel Info found successfully",
        data: channel,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error.message);
    return NextResponse.json(
      {
        error: error.message,
        statusCode: error.statusCode,
      },
      { status: error.statusCode || 500 },
    );
  }
}
