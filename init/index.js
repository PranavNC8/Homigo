const mongoose = require("mongoose");
const data = require("./data.js");
const listing = require("../models/listings.js");
const dblink = process.env.ATLASDB;
main()
.then((res)=>{
    console.log("database is working");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongourl");
}

const initdb = async () => {
    await listing.deleteMany({}); 
    data.data = data.data.map((obj)=> ({...obj, owner: "68f71bbf257c19fc1b21f2d2"}));
    await listing.insertMany(data.data);
    console.log("data is uploaded");
};

initdb();