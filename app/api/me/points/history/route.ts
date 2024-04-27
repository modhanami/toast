// export async function fetchAppUserPointsHistory(
//     app: AppResponse,
//     userId: string,
// ) {
//     const { data } = await instance.get<AppUserPointsHistoryResponse[]>(
//         `${API_URL}/apps/users/${userId}/points/history`,
//         {
//             headers: {
//                 ...makeAppAuthHeader(app),
//             },
//         },
//     );
//     return data;
// }

// GET /api/me/points/history
import {createServerClient} from "@/utils/supabase/server";
import {NextResponse} from "next/server";
import {ARSAHUB_API_KEY, ARSAHUB_API_URL} from "@/lib/arsahub";
import {AppUserPointsHistoryResponse} from "@/app";

export async function GET(request: Request) {
    const supabaseServerClient = createServerClient();

    const {
        data: {user},
    } = await supabaseServerClient.auth.getUser();
    if (!user) {
        return NextResponse.json({error: "Not logged in"}, {status: 401});
    }

    const response = await fetch(`${ARSAHUB_API_URL}/apps/users/${user.id}/points/history`, {
        method: "GET",
        headers: {
            "X-Api-Key": ARSAHUB_API_KEY,
        },
    });

    const json = (await response.json()) as AppUserPointsHistoryResponse[];
    console.log("Trigger response", response.status, json);
    if (!response.ok) {
        return NextResponse.json({error: json}, {status: response.status});
    }

    return NextResponse.json(json);
}