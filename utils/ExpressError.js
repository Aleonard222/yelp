
//擴展常見錯誤(傳入自訂錯誤語句和狀態碼)
class ExpressError extends Error{
  constructor(message,statusCode){
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;