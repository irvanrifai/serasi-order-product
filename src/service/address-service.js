import { prismaClient } from "../application/database.js"
import { ResponseError } from "../error/response-error.js";
import { createAddressValidation, getAddressValidation, updateAddressValidation } from "../validation/address-validation";
import { getContactValidation } from "../validation/contact-validation"
import { validate } from "../validation/validation.js"

const checkContactExist = async (user, contactId) => {
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

  return contactId;
};

const create = async (user, contactId, request) => {
  contactId = await checkContactExist(user, contactId);
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
  contactId = await checkContactExist(user, contactId);
  addressId = validate(getAddressValidation, addressId);

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

const update = async(user, contactId, request) => {
  contactId = await checkContactExist(user, contactId);
  const address = validate(updateAddressValidation, request);

  const addressExist = await prismaClient.address.count({
    where: {
      contact_id: contactId,
      id: address.id
    }
  });

  if (addressExist === 0) {
    throw new ResponseError(404, "Address is not found");
  }

  return prismaClient.address.update({
    where: {
      id: address.id
    },
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

const remove = async (user, contactId, addressId) => {
  contactId = await checkContactExist(user, contactId);
  addressId = validate(getAddressValidation, addressId);

  const address = await prismaClient.address.findFirst({
    where: {
      id: addressId,
      contact_id: contactId
    }
  });

  if (!address) {
    throw new ResponseError(404, "Address is not found");
  }

  return prismaClient.address.delete({
    where: {
      id: addressId
    }
  });
}

const list = async (user, contactId) => {
  contactId = await checkContactExist(user, contactId);

  return prismaClient.address.findMany({
    where: {
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
}

export default {
  create,
  get,
  update,
  remove,
  list
}