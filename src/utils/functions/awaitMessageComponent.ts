import type { AwaitMessageCollectorOptionsParams, ComponentType, Message, MessageComponentType } from "discord.js";

type AwaitMessageCollectorOptionsModified = Omit<AwaitMessageCollectorOptionsParams<any>, "componentType">

/**
 * Awaits for a component interaction that has been attached to an message.
 * Created to streamline the process of waiting for a component interaction while providing better error handling.
 */
export async function awaitMessageComponent<T extends MessageComponentType>(message: Message, componentType: T, options?: AwaitMessageCollectorOptionsModified, onFail?: (msg: Message) => any) {
    let response

    try {
        response = await message.awaitMessageComponent<typeof componentType>({
            componentType,
            ...options
        })
    } catch (e) {
        if (onFail) {
            onFail(message)
        }
    }

    return response
}