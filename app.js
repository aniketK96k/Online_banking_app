import dotenv from "dotenv"
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs";
import mongoose from "mongoose"
import bcrypt from "bcrypt"
const saltRounds = 10;
dotenv.config();
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/bank", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    balance: Number,
    password: String
});


const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/secrets", (req, res) => {
    res.render("secrets");
});
app.get("/sendmoney", (req, res) => {
    res.render("sendmoney");
});

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash,
            balance: req.body.balance
        });

        newUser.save().then(() => {
            res.render("youracc");
        }).catch((err) => {
            console.log(err);
        })
    });

});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username, }).then((foundUser) => {
        if (!foundUser) {
            console.log("err");
        }
        else {
            bcrypt.compare(password, foundUser.password, function (err, result) {
                if (result === true) {
                    res.render("youracc");
                }
            });


        }
    });
});

app.post("/sendmoney", function (req, res) {

    console.log(req.user);
});



app.listen(3000, function () {
    console.log("running")
})