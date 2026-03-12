
const roleMiddleware = {};

roleMiddleware.memberChecker = (req, res, next) => {
    if (req.user.Role === 'member' || req.user.Role === 'Member') {
        next();
    } else {
        res.status(403).json({success: false, message: 'Access denied. Only members can access this resource.' });
    }
};

roleMiddleware.adminChecker = (req, res, next) => {
    if (req.user.Role === 'admin' || req.user.Role === 'Admin') {
        next();
    } else {
        res.status(403).json({success: false, message: 'Access denied. Only admins can access this resource.' });
    }
    
};

module.exports = roleMiddleware;