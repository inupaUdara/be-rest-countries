const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { JWT_SECRET } = require("../config/env.js");

const signUp = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      
      let userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
  
      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      next(error);
    }
};

const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User doesn't exist" });
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
    
        res.json(user);
    } catch (error) {
        next(error);
    }
}

module.exports = { signUp, signIn, getProfile };