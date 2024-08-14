//異步錯誤捕捉函式

module.exports = func => { //傳入函式
  return (req,res,next) => { //返回新函式
    func(req,res,next).catch(next); //調用傳入的函式，捕獲任何錯誤並傳遞到錯誤處理中間件
  }
}