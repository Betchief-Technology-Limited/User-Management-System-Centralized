function normalizeSegment(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9._]/g, "_")
        .replace(/_+/g, "_")
}

export function normalizePermissionKey(value) {
    return normalizeSegment(value)
}

export function buildPermissionDefinition({ name, resource, action }) {
    if (resource || action) {
        if (!resource || !action) {
            throw new Error("Both resource and action are required together");
        }

        const normalizedResource = normalizeSegment(resource);
        const normalizedAction = normalizeSegment(action);

        return {
            name: `${normalizedResource}.${normalizedAction}`,
            resource: normalizedResource,
            action: normalizedAction
        }
    }

    const normalizedName = normalizeSegment(name);
    const [derivedResource, derivedAction, ...rest] = normalizedName.split(".");

    if (!normalizedName) {
        throw new Error("Permission identifier is required")
    }

    if (!rest.length && derivedResource && derivedAction) {
        return {
            name: normalizedName,
            resource: derivedResource,
            action: derivedAction
        }
    }

    return {
        name: normalizedName,
        resource: null,
        action: null
    }
}

export function flattenPermissionGroups(permissionGroups = []) {
    const flattenedPermissions = [];

    for (const permissionGroup of permissionGroups) {
        const { resource, actions = [] } = permissionGroup;

        for (const action of actions) {
            flattenedPermissions.push(
                buildPermissionDefinition({
                    resource,
                    action
                })
            )
        }
    }

    return flattenedPermissions;
}