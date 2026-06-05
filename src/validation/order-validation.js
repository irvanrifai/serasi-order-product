import Joi from "joi";

const createOrderValidation = Joi.object({
  payment_method: Joi.string().valid("CREDIT_CARD", "BANK_TRANSFER", "QRIS").required(),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

const getOrderValidation = Joi.number().min(1).positive().required();

const historyOrderValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(50).default(10),
});

export { createOrderValidation, getOrderValidation, historyOrderValidation };
