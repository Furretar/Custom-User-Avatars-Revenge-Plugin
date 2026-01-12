import { findByProps } from "@revenge/modules/webpack";
import { before } from "@revenge/modules/patcher";

const TARGET_USER_ID = "376407743776686094";
const OVERRIDE_IMAGE_URL = "https://cdn.donmai.us/sample/a5/f2/__furina_genshin_impact_drawn_by_overlord_overlord80000__sample-a5f2de3aa9623900360f7c867f42519c.jpg";

const UserUtils = findByProps{"getAvatarURL"};

let unpatch;

export function onLoad() {
    unpatch = before("getAvatarURL", UserUtils, (args) => {
        const [user] = args;
        if (!user || user.id != TARGET_USER_ID) return;
        return OVERRIDE_IMAGE_URL;
    });
}

export function onUnload() {
    if (unpatch) unpatch();
}