import {findByProps} from "@revenge/modules/webpack";

const TAG = "[custom-avatars]";
const target_id = "376407743776686094";

export function onLoad(): void {
    console.log(`${TAG} loaded`);

    const UserStore = findByProps("getUser");

    if (!UserStore) {
        console.log(`${TAG} not found`);
        return;
    }
    else {
        console.log(`${TAG} found`);
        return;
    }


}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);
}
