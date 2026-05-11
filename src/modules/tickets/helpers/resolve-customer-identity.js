import { findExistingTicketCustomer } from "../ticket.repository.js";

function normalizeEmail(email) {
    return email?.trim().toLowerCase() || null;
}

function normalizePhone(phone) {
    return phone?.trim() || null;
}

export async function resolveCustomerIdentity({
    customerEmail,
    customerPhone,
    customerName
} = {}) {
    const normalizedEmail = normalizeEmail(customerEmail);
    const normalizedPhone = normalizePhone(customerPhone);
    const normalizedName = customerName?.trim() || null;

    const existingCustomer = await findExistingTicketCustomer({
        customerEmail: normalizedEmail,
        customerPhone: normalizedPhone
    });

    if (existingCustomer?.customerId) {
        return {
            customerId: existingCustomer.customerId,
            customerEmail: normalizedEmail || existingCustomer.customerEmail || undefined,
            customerPhone: normalizedPhone || existingCustomer.customerPhone || undefined,
            customerName: normalizedName || existingCustomer.customerName || undefined
        };
    }

    const customerId = normalizedPhone || normalizedEmail || null;

    return {
        ...(customerId ? { customerId } : {}),
        ...(normalizedEmail ? { customerEmail: normalizedEmail } : {}),
        ...(normalizedPhone ? { customerPhone: normalizedPhone } : {}),
        ...(normalizedName ? { customerName: normalizedName } : {})
    };
}

export default resolveCustomerIdentity;
