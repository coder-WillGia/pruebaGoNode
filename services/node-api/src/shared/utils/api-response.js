export class ApiResponse {
  static ok(res, data, message = '') {
    return res.status(200).json({
      status: 'success',
      ...(message && { message }),
      data
    });
  }

  static badRequest(res, message, detail = null) {
    return res.status(400).json({
      status: 'error',
      message,
      ...(detail && { error: detail })
    });
  }

  static internalError(res, message = 'Error interno del servidor', detail = null) {
    return res.status(500).json({
      status: 'error',
      message,
      ...(detail && { error: detail })
    });
  }
}
