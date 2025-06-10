import { prismaClient } from "../application/database.js"
import { ResponseError } from "../error/response-error.js";
import { createAddressValidation, getAddressValidation } from "../validation/address-validation";
import { getContactValidation } from "../validation/contact-validation"
import { validate } from "../validation/validation.js"

const create = async (user, contactId, request) => {
  contactId = validate(getContactValidation, contactId);
  const contactExist = await prismaClient.contact.count({
    where: {
      username: user.username,
      id: contactId
    }
  });

  if (contactExist === 0) {
    throw new ResponseError(404, "Contact is not found");
  }

  const address = validate(createAddressValidation, request);
  address.contact_id = contactId;

  return prismaClient.address.create({
    data: address,
    select: {
      id: true,
      street: true,
      city: true,
      province: true,
      country: true,
      postal_code: true
    }
  });
}

const get = async (user, contactId, addressId) => {
  contactId = validate(getContactValidation, contactId);
  addressId = validate(getAddressValidation, addressId);

  const contactExist = await prismaClient.contact.count({
    where: {
      username: user.username,
      id: contactId
    }
  });

  if (contactExist === 0) {
    throw new ResponseError(404, "Contact is not found");
  }

  const address = await prismaClient.address.findFirst({
    where: {
      id: addressId,
      contact_id: contactId
    },
    select: {
      id: true,
      street: true,
      city: true,
      province: true,
      country: true,
      postal_code: true
    }
  });

  if (!address) {
    throw new ResponseError(404, "Address is not found");
  }

  return address;
}

export default {
  create,
  get
}