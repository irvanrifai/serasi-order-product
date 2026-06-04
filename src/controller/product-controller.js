import productService from "../service/product-service.js";

const create = async (req, res, next) => {
  try {
    const user = req.user;
    const request = req.body;
    const result = await productService.create(user, request);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e)
  }
}

const get = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const result = await productService.get(productId);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e)
  }
}

const update = async (req, res, next) => {
  try {
    const user = req.user;
    const productId = req.params.productId;
    const request = req.body;
    request.id = productId;
    const result = await productService.update(user, request);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e)
  }
}

const search = async (req, res, next) => {
  try {
    const request = {
      name: req.query.name,
      page: req.query.page,
      size: req.query.size
    };
    const result = await productService.search(request);
    res.status(200).json({
      data : result.data,
      paging: result.paging
    });
  } catch (e) {
    next(e)
  }
}

const remove = async (req, res, next) => {
  try {
    const user = req.user;
    const productId = req.params.productId;
    await productService.remove(user, productId);
    res.status(200).json({
      data: "OK"
    });
  } catch (e) {
    next(e)
  }
}

export default {
  create,
  get,
  update,
  search,
  remove
}