    if(process.env.NODE_ENV != "production"){
         require('dotenv').config()
    }
    const express = require("express");
    const app = express();
    const mongoose = require("mongoose");
    const path = require("path");
    const listing = require("./models/listings.js");
    const methodOverride = require("method-override");
    const ejsmate = require("ejs-mate"); 
    const wrapAsync = require("./utils/wrapAsync.js");
    const ExpressError = require("./utils/expreserr.js");
    const {ListingSchema,reviewSchema} = require("./schema.js");  
    const Review = require("./models/review.js");
    const session = require("express-session");
    const MongoStore = require('connect-mongo');
    const flash = require("connect-flash");
    const passport = require("passport");
    const localStrategy = require("passport-local");
    const user = require("./models/user.js");
    

    app.use(methodOverride("_method"));
    app.set("view engine", "ejs")
    app.set("views",path.join(__dirname,"views"));
    app.use(express.urlencoded({extended: true}));
    app.engine('ejs', ejsmate);
    app.use(express.static(path.join(__dirname,"public")));
    const listings = require("./routes/listing.js");
    const reviews = require("./routes/review.js");
    const users = require("./routes/users.js");
const { error } = require('console');

    const dblink = process.env.ATLASDB;
    main()
    .then((res)=>{
        console.log("database is working");
    })
    .catch(err => console.log(err));

    async function main() {
    await mongoose.connect(dblink);
    }

     app.get("/",(req,res)=>{
        console.log("root page is workig");
        res.send("everything is working");
    });


    const store = MongoStore.create({
        mongoUrl: dblink,
        crypto:{
            secret:process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", ()=>{
        console.log("ERROR in mongo session store", err);
    });

    const sessionoptions = {
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    };

    app.use(session(sessionoptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new localStrategy(user.authenticate()));

   passport.serializeUser(user.serializeUser());
   passport.deserializeUser(user.deserializeUser());


    app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
     });

    //  app.get("/demouser", async (req,res)=>{
    //     const fakeuser = new user({
    //         email: "example14@gmail.com",
    //         username: "example_username",
    //     });

    //     let registereduser = await user.register(fakeuser,"helloword");
    //     res.send("fake user registered");
    //  });
   
    app.use("/listings", listings);
    app.use("/listings/:id/reviews", reviews);
    app.use("/",users);

    

    app.use((req,res,next) =>{
        next(new ExpressError(404,"Page Not found"));
    });

    app.use((err,req,res,next)=>{
        let {statusCode = 500 ,message = "something went wrong"} = err;
        res.status(statusCode).render("./layouts/error.ejs", {message});
    });

    app.listen(8888, ()=> {
        console.log("server is working on 8888");


    });



