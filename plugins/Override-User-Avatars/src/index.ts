import { findByProps } from "@revenge/modules/webpack";
import { before, Unpatch } from "@revenge/modules/patcher";

interface User {
    id: string;
    username?: string;
    [key: string]: any;
}

const TAG = "[avatar-override]";
const TARGET_USER_ID = "376407743776686094";
const OVERRIDE_IMAGE_URL =
    "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

let UserUtils: { getAvatarURL: (user: User) => string };
let unpatch: Unpatch | null;

export function onLoad(): void {
    console.log(`${TAG} loading`);

    try {
        UserUtils = findByProps < { getAvatarURL: (user: User) => string } > ("getAvatarURL");
        console.log(`${TAG} UserUtils found`, UserUtils);
    } catch (e) {
        console.error(`${TAG} failed to find UserUtils`, e);
        return;
    }

    unpatch = before("getAvatarURL", UserUtils, (args: [User]) => {
        const [user] = args;

        if (!user) {
            console.log(`${TAG} getAvatarURL called with no user`);
            return;
        }

        console.log(`${TAG} avatar request for user`, user.id);

        if (user.id !== TARGET_USER_ID) return;

        console.log(`${TAG} overriding avatar for target user`);
        return OVERRIDE_IMAGE_URL;
    });

    console.log(`${TAG} patch applied`);
}

export function onUnload(): void {
    console.log(`${TAG} unloading`);

    if (unpatch) {
        unpatch();
        console.log(`${TAG} patch removed`);
        unpatch = null;
    }
}
