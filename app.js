require("./config/db.config")
const express = require("express");
const app = express();
const userModel = require("./models/user.model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Route to respond with a simple message
app.get("/", function(req, res) {
    res.send("Hello world");
});
app.get("/profile", function(req, res) {
    let token = req.cookies.token;
    jwt.verify(token,"screte",(err,decoded)=>{
        res.send(decoded);

    })
});
app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    const { name, email, password } = req.body;
    bcrypt.genSalt(10,function(err,salt){
        console.log(salt)
        bcrypt.hash(password,salt,async function(err,hash){
            console.log(hash)
            const user = await userModel.create({
                name,
                email,
                password:hash,
            })
            const token = jwt.sign({ email },"screte");
            res.cookie("token",token);
            res.send(user);
            
        })
    })

});
app.get("/login", function(req, res) {
    res.render("login");
});
app.post("/login", async (req, res)=> {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if(!user) return res.send("email or password incorrect");
    bcrypt.compare(password,user.password, function(err, result){
        if(result) return res.send("loggedin")
    })
    
});




// Start the server on port 3000 and log that it's running
app.listen(3000, function() {
    console.log("Server is running on port 3000");
});
