const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { JWT_SECRET } = require("../config/env.js");

const verifyToken = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "You need to login first" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token", error: error.message });
    }
};

module.exports = { verifyToken };