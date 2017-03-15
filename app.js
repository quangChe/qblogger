var bodyParser  = require("body-parser"),
expressSanitizer = require("express-sanitizer"),
methodOverride  = require("method-override"),
mongoose        = require("mongoose"),
express         = require("express"),
app             = express();


//App Config:
var url = process.env.DATABASEURL || "mongodb://localhost/gen_blog"
mongoose.connect(url);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//Mongoose/Model Config:
var postSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    date: {type: Date, default: Date.now}
});

var Post = mongoose.model("Post", postSchema);


//RESTful Routes:

//1a. LANDING (redirects to INDEX):
app.get("/", function(req, res){
    res.redirect("/posts");
});

//1b. INDEX:
app.get("/posts", function(req, res){
    Post.find({}, function(err, allPosts){
        if (err) {
            console.log("Error! See details: " + err);
        } else {
            res.render("index", {posts: allPosts});
        }
    });
});

//2. NEW:
app.get("/posts/new", function(req, res){
    res.render("new");
});

//3. CREATE:
app.post("/posts", function(req, res){
    req.body.posts.body = req.sanitize(req.body.posts.body);
    Post.create(req.body.posts, function(err, newPost){
        if (err) {
            console.log("Error! Cannot submit new blog post! More details: " + err);
        } else {
            console.log("New post successfully submitted!");
            console.log(newPost);
            res.redirect("/posts");
        }
    });
});

//4. SHOW:
app.get("/posts/:id", function(req, res){
    Post.findById(req.params.id, function(err, postFound){
        if (err) {
            console.log("Error! Cannot open selected blog post! More details: " + err);
        } else {
            res.render("show", {postShown: postFound});
        }
    });
});

//5. EDIT:
app.get("/posts/:id/edit", function(req,res){
    Post.findById(req.params.id, function(err, postFound){
        if (err) {
            console.log("Error! Cannot find post to edit! More details:" + err);
        } else {
            res.render("edit", {editPost: postFound});
        }
    });
});

//6. UPDATE:
app.put("/posts/:id", function(req, res){
    req.body.postEdit.body = req.sanitize(req.body.postEdit.body);
    Post.findByIdAndUpdate(req.params.id, req.body.postEdit, function(err, newPost){
        if (err) {
            res.redirect("/posts");
            console.log("Error! Failed to edit the post! More details: " + err);
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

//7. DESTROY
app.delete("/posts/:id", function(req,res){
    Post.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.redirect("/posts");
            console.log("Error! Could not remove target post! More details: " + err);
        } else {
            res.redirect("/posts");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The blog is up and running!");
});