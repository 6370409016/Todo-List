//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose"); // require mongoose
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");//require lodash

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//create a todolistDB database and connect it
mongoose.connect("mongodb://127.0.0.1/todolistDB", {
  useNewUrlParser: true
});

//create a Schema of only name feild
const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema); // create a model of Items

const Item1 = new Item({
  name: "Welcome to the todolist"
});

const Item2 = new Item({
  name: "Click + button to add items"
});

const Item3 = new Item({
  name: "click delete to remove item"
});

const defaultItem = [Item1, Item2, Item3]; // create a array of items doc

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  //Item.find({}) will read all the documents present in Item
  Item.find({}).then(function(foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItem)
        .then(function() {
          console.log("Successfully saved defult items to DB");
        })
        .catch(function(err) {
          console.log(err);
        });
      res.redirect('/');
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: foundItem
      });
    }

  });

  const day = "Today";


});


//add a custom route to the todolist
app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName);//Use lodash to Capitalize the letters

  List.findOne({
    name: customListName
  }).then(function(foundList) {

    // if(!err){
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItem
      });

      list.save();
      res.redirect('/'+customListName);
        // console.log(foundList);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });

    }


  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list;
  // console.log(listName);
  const item = new Item({
    name: itemName
  });
  if (itemName !== '' && listName==="Today") {
    item.save();
    res.redirect('/');
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.deleteItem;
  const listName= req.body.listName;
  // console.log(checkedItemId);
  //here we should give a callback to delete the item

if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId)
    .then(function() {
      console.log("Successfully deleted checked Item");
    })
    .catch(function(err) {
      console.log(err);
    });
  res.redirect('/');

}else{
  List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}}).then(function(err){
    res.redirect("/"+listName);
  });

}

});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
