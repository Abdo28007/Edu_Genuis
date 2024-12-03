exports.notFound = async (req,res ,next) => {
    const error = new Error( `the path ${req.originalUrl} does not exist`)
    res.status(404)
    next(error)
}
exports.errorHandler = async (err,req,res, next) => {
    const statusCode = res.statusCode ===200 ? 500 : res.statusCode
    res.status(statusCode).json({err:err.message})
}