import { Attachment } from "discord.js";

export function attachmentIsImage(attachment: Attachment): boolean {
    const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    // Check if the attachment has a contentType (MIME type)
    if (attachment.contentType && imageMimeTypes.includes(attachment.contentType)) {
        return true;
    }

    // Check by file extension if MIME type isn't available
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileName = attachment.name?.toLowerCase() || '';
    return imageExtensions.some(ext => fileName.endsWith(ext));
}
