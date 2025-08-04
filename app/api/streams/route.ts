import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { prismaClient } from "@/lib/db";
const YT_REGEX = new RegExp("^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$");


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
//     platform: z.string().refine(
//         val => ["youtube", "spotify"].includes(val),
//         { message: "Invalid Platform! Only Youtube and Spotify are admissible" }
//     )
// }
})

export async function POST(req: NextRequest){
    try{
        const data = CreateStreamSchema.parse(await req.json())
        const isYt = YT_REGEX.test(data.url);
        if(!isYt){
            return NextResponse.json({message:"Invalid URL! Only YouTube URLs are allowed."},{
                status: 400,
                statusText: "Bad Request"
            })
        }

        const extractedId = data.url.split("?v=")[1];
        await prismaClient.stream.create({
            data : {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                upvotes: 0
            }
        })
    } catch (error) {
        return NextResponse.json({message:"Invalid Request.....Try Again!"},{
            status: 400,
            statusText: "Bad Request"
        })
    }
}

export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId")
    const streams = await prismaClient.user.findMany({
        where: {
            id: creatorId ?? undefined
        }
    })
    return NextResponse.json({streams})
}