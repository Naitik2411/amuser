import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { prismaClient } from "@/lib/db";
//@ts-ignore
import youtubesearchapi from "youtube-search-api"

var YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/

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
        const isYt = data.url.match(YT_REGEX);
        if(!isYt){
            return NextResponse.json({message:"Invalid URL! Only YouTube URLs are allowed."},{
                status: 400,
                statusText: "Bad Request"
            })
        }

        const extractedId = data.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails = res.thumbnail.thumbnails
        const thumbnail = thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1,
    );
         

        const stream = await prismaClient.stream.create({
            data : {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                upvotes: 0,
                title: res.title,
                smallImg: (thumbnails.length > 1
                ? thumbnails[thumbnails.length - 2].url
                : thumbnails[thumbnails.length - 1].url) ??
                "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                bigImg:thumbnails[thumbnails.length - 1].url ??
                "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg"
            }
        })
        return NextResponse.json({message:"Stream Added!",
            id:stream.id
        },{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message:"Invalid Request.....Try Again!"},{
            status: 400,
            statusText: "Bad Request"
        })
    }
}

export async function GET(req: NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId")
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? undefined
        }
    })
    return NextResponse.json({streams})
}