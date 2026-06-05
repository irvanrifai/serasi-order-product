import orderService from "../service/order-service.js";

const create = async (req, res, next) => {
  try {
    const user = req.user;
    const request = req.body;
    const headerKey = req.get("x-idempotency-key");
    const idempotencyKey = headerKey;
    const result = await orderService.create(user, request, idempotencyKey);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const user = req.user;
    const result = await orderService.get(orderId, user);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const history = async (req, res, next) => {
  try {
    const request = {
      page: req.query.page,
      size: req.query.size,
    };
    const user = req.user;
    const result = await orderService.history(user, request);
    res.status(200).json({
      data: result.data,
      paging: result.paging,
    });
  } catch (e) {
    next(e);
  }
};

export default {
  create,
  get,
  history,
};
