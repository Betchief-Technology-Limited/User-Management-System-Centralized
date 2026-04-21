import successResponse from "../../../shared/utils/apiResponse.js";
import { addTicketTag, removeTicketTag } from "./tag.service.js";

export async function addTicketTagHandler(req, res) {
    const result = await addTicketTag(
        req.validatedParams.ticketId,
        req.validatedBody.name
    );

    return successResponse(res, "Tag added successfully", result, 201);
}

export async function removeTicketTagHandler(req, res) {
    const result = await removeTicketTag(
        req.validatedParams.ticketId,
        req.validatedParams.tagId
    );

    return successResponse(res, "Tag removed successfully", result);
}