import {findByProps} from "@revenge/modules/webpack";

const TAG = "[custom-avatars]";
const target_id = "376407743776686094";

export function onLoad(): void {
    console.log(`${TAG} loaded`);

    const UserStore = findByProps("getUser");

    if (!UserStore) {
        console.log(`${TAG} userstore not found`);
        return;
    }

    const user = UserStore.getUser(target_id);

    if (!user) {
        console.log(`${TAG} user not found`);
        return;
    }

    console.log(`{TAG} username: ${user.username}#${user.discriminator}`);
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);
}
