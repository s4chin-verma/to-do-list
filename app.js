const express = require("express");
const app = express();

require('dotenv').config();

const bodyParser = require("body-parser");
const date = require(__dirname + ("/date.js"));

const _ = require("lodash");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Error connecting to MongoDB', error);
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

//schema for mongodb


const itemSchema = new mongoose.Schema({
    name: {
        type: String
    }
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})


const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

//route

app.get("/", function (req, res) {
    const day = date.getDate();

    Item.find()
        .then((items) => {
            res.render("list", { date: day, listtitle: "Today", tasklist: items });
        })
        .catch((error) => {
            console.log("Error occurred: ", error);
        });
});

app.post("/", function (req, res) {
    const taskName = req.body.firstinput;
    const listName = req.body.list;

    const item = new Item({
        name: taskName
    });
    const day = date.getDate();
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then(foundList => {
                if (foundList) { // add null check here
                    foundList.items.push(item);
                    foundList.save();
                    res.redirect("/" + listName);
                } else {
                    console.log(`List with name '${listName}' not found.`);
                    res.redirect("/");
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
});

app.post("/delete", function (req, res) {
    const id = req.body.deletedTask;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndRemove(id)
            .then(() => {
                res.redirect("/");
            })
            .catch((error) => {
                console.log(error);
            });
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: id } } }
        )
            .then(() => {
                res.redirect("/" + listName);
            })
            .catch((error) => {
                console.log(error);
            });
    }
});


app.get("/:topic", function (req, res) {
    const customListName = _.capitalize(req.params.topic);

    List.findOne({ name: customListName }).then((list) => {
        if (!list) {
            const newList = new List({
                name: customListName
            });
            newList.save().then(() => {
                res.redirect("/" + customListName);
            }).catch((error) => {
                console.error(error);
                res.status(500).send("Error creating new list");
            });
        } else {
            res.render("list", { listtitle: list.name, tasklist: list.items });
        }
    }).catch((error) => {
        console.error(error);
        res.status(500).send("Error finding list");
    });
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`The server is running on port ${port}`);
});
