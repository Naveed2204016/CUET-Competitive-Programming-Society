const jwt = require("jsonwebtoken");
const checkLogin = (req, res, next) =>
{
    const { authorization } = req.headers;
    try
    {
        if (!authorization) {
            return res.status(401).json({ message: "Authorization header missing" });
        }
        else
        {
            const token = authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Token missing" });
            }
            else
            {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                next();
            }
        }
    }
    catch(err)
    {
        res.status(401).json({ message: "Invalid token", error: err.message });
    }
};

module.exports = checkLogin;