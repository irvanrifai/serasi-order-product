import Joi from "joi";

const createProductValidation = Joi.object({
  sku: Joi.string().max(150).required(),
  name: Joi.string().max(250).required(),
  description: Joi.string().max(5000).optional(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
});

const getProductValidation = Joi.number().min(1).positive().required();

const updateProductValidation = Joi.object({
  id: Joi.number().min(1).positive().required(),
  sku: Joi.string().max(150).required(),
  name: Joi.string().max(250).required(),
  description: Joi.string().max(5000).optional(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
});

const searchProductValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(50).default(10),
  name: Joi.string().max(250).optional(),
});

export {
  createProductValidation,
  getProductValidation,
  updateProductValidation,
  searchProductValidation
}