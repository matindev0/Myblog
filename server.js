
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Schema and Models
const postSchema = new mongoose.Schema({ title: String, content: String });
const Post = mongoose.model("Post", postSchema);

const pageSchema = new mongoose.Schema({ title: String, slug: String, content: String });
const Page = mongoose.model("Page", pageSchema);

// Routes
app.get("/", async (req, res) => {
  const posts = await Post.find();
  res.send(posts.map(post => `<h2>${post.title}</h2><p>${post.content}</p>`).join(""));
});

app.get("/admin", (req, res) => res.sendFile(__dirname + "/public/admin.html"));
app.get("/admin/posts", async (req, res) => res.json(await Post.find()));
app.post("/admin/compose", async (req, res) => {
  const newPost = new Post({ title: req.body.title, content: req.body.content });
  await newPost.save();
  res.redirect("/admin");
});

app.post("/admin/delete", async (req, res) => {
  await Post.findByIdAndDelete(req.body.id);
  res.redirect("/admin");
});

app.get("/admin/pages", async (req, res) => res.json(await Page.find()));
app.post("/admin/pages/add", async (req, res) => {
  const newPage = new Page({ title: req.body.title, slug: req.body.slug, content: req.body.content });
  await newPage.save();
  res.redirect("/admin/pages");
});

app.post("/admin/pages/update", async (req, res) => {
  await Page.findByIdAndUpdate(req.body.id, { title: req.body.title, slug: req.body.slug, content: req.body.content });
  res.redirect("/admin/pages");
});

app.post("/admin/pages/delete", async (req, res) => {
  await Page.findByIdAndDelete(req.body.id);
  res.redirect("/admin/pages");
});

app.get("/:slug", async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) res.status(404).send("Page not found");
  else res.send(`<h1>${page.title}</h1><div>${page.content}</div>`);
});

// Start Server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
