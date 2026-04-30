function sendSuccess(res, calculator, result) {
  return res.status(200).json({
    success: true,
    error: null,
    meta: {
      calculator,
      version: "1.0",
      computedAt: new Date().toISOString(),
      currency: "MAD",
    },
    result,
  });
}

function sendError(res, calculator, status, code, message, fields) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[" + calculator + "]", code, message);
  } else if (status === 500) {
    console.error("[" + calculator + "]", code, message);
  }

  const body = {
    success: false,
    error: {
      code,
      message,
    },
    meta: {
      calculator,
      version: "1.0",
      computedAt: new Date().toISOString(),
      currency: "MAD",
    },
    result: null,
  };

  if (fields) body.error.fields = fields;
  return res.status(status).json(body);
}

module.exports = { sendSuccess, sendError };
