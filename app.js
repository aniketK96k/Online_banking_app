import dotenv from "dotenv"
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs";
import mongoose from "mongoose"
import session from "express-session"
import passport from "passport"
import passportLocalMongoose from "passport-local-mongoose"
dotenv.config();
const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'our little secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/bank", { useNewUrlParser: true, useUnifiedTopology: true });


const userSchema = new mongoose.Schema({
    email: String,
    balance: Number,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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
app.get("/youracc", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("youracc");
    }
    else {
        res.redirect("/login");
    }
});
app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
    })

    res.redirect("/");
})

app.post("/register", function (req, res) {
    User.register({ username: req.body.username, balance: req.body.balance }, req.body.password, function (err, User) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/youracc");
            })
        }
    })
});
app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/youracc");
            })
        }
    })
});

app.get("/sendmoney", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("sendmoney");
    }
    else {
        res.redirect("/login");
    }

});
app.post("/sendmoney", function (req, res) {
    const deductedMoney = req.body.money;
    const receiverid = req.body.id;
    const donarmoney = req.user.balance;
    User.findById(receiverid).then(function (foundUser) {
        if (foundUser) {
            foundUser.balance = foundUser.balance + deductedMoney;
            foundUser.save().then(function(){
                res.redirect("youracc");
            })
        }
        else {
            console.log("user not found");
        }
    })

    User.findById(req.user.id).then(function (foundUser) {
        if (foundUser) {
            foundUser.balance = donarmoney - deductedMoney;
            foundUser.save().then(function(){
                res.redirect("youracc");
            })
        }
        else {
            console.log("user not found");
        }
    })
    console.log(deductedMoney);
    console.log(receiverid);
    console.log(req.user.id);
    console.log(donarmoney);

})



app.listen(3000, function () {
    console.log("running")
})