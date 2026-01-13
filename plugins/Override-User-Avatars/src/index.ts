const TAG = "[simple-plugin]";

export function onLoad(): void {
    console.log(`${TAG} loaded`);
}

export function onUnload(): void {
    console.log(`${TAG} unloaded`);
}
