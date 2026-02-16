const db = require("../config/db");

exports.getPublicPosts = async (req, res) => {
  const [posts] = await db.query(
    "SELECT * FROM posts WHERE is_published = 1 ORDER BY published_at DESC"
  );

  const ids = posts.map(p => p.id);
  if (!ids.length) return res.json([]);

  const [images] = await db.query(
    "SELECT * FROM post_images WHERE post_id IN (?) ORDER BY position ASC",
    [ids]
  );

  const enriched = posts.map(p => ({
    ...p,
    images: images.filter(i => i.post_id === p.id)
  }));

  res.json(enriched);
};

exports.getAllPosts = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM posts ORDER BY published_at DESC"
  );
  res.json(rows);
};

exports.getPostById = async (req, res) => {
  const [[post]] = await db.query(
    "SELECT * FROM posts WHERE id = ?",
    [req.params.id]
  );

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json(post);
};

exports.createPost = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { title, content, type, event_date, venue, is_published } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const files = req.files || [];
    const firstImage = files.length ? files[0].filename : null;

    await conn.beginTransaction();

    const [postResult] = await conn.query(
      `INSERT INTO posts
        (title, content, type, event_date, venue, is_published, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        type,
        event_date || null,
        venue || null,
        is_published ? 1 : 0,
        firstImage
      ]
    );

    const postId = postResult.insertId;

    if (files.length) {
      const placeholders = files.map(() => "(?, ?, ?)").join(", ");
      const params = [];
      files.forEach((f, i) => {
        params.push(postId, f.filename, i + 1);
      });

      await conn.query(
        `INSERT INTO post_images (post_id, file_name, position) VALUES ${placeholders}`,
        params
      );
    }

    await conn.commit();
    res.json({ message: "Post created", id: postId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  } finally {
    conn.release();
  }
};

exports.updatePost = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { title, content, event_date, venue, is_published } = req.body;
    const postId = req.params.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const files = req.files || [];
    const firstImage = files.length ? files[0].filename : null;

    await conn.beginTransaction();

    await conn.query(
      `UPDATE posts SET
        title = ?, content = ?, event_date = ?, venue = ?, is_published = ?,
        image = COALESCE(?, image)
       WHERE id = ?`,
      [
        title,
        content,
        event_date || null,
        venue || null,
        is_published ? 1 : 0,
        firstImage,
        postId
      ]
    );

    // If new images were uploaded, replace old post_images
    if (files.length) {
      await conn.query("DELETE FROM post_images WHERE post_id = ?", [postId]);

      const placeholders = files.map(() => "(?, ?, ?)").join(", ");
      const params = [];
      files.forEach((f, i) => {
        params.push(postId, f.filename, i + 1);
      });

      await conn.query(
        `INSERT INTO post_images (post_id, file_name, position) VALUES ${placeholders}`,
        params
      );
    }

    await conn.commit();
    res.json({ message: "Post updated" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Failed to update post" });
  } finally {
    conn.release();
  }
};


exports.deletePost = async (req, res) => {
  await db.query("DELETE FROM posts WHERE id=?", [req.params.id]);
  res.json({ message: "Post deleted" });
};
