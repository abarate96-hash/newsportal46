import { getStore } from "@netlify/blobs";

// Default content (initial data)
const defaultContent = {
  news: [
    {
      _id: "news_1",
      title: "Global Climate Summit Reaches Historic Agreement",
      category: "Environment",
      time: "2 hours ago",
      excerpt: "World leaders unite on unprecedented climate action plan, setting ambitious targets for carbon neutrality by 2035...",
      href: "articles/climate-summit.html"
    },
    {
      _id: "news_2",
      title: "Tech Giants Announce AI Ethics Initiative",
      category: "Technology",
      time: "5 hours ago",
      excerpt: "Major technology companies collaborate on new standards for responsible AI development and deployment...",
      href: "articles/ai-ethics-initiative.html"
    },
    {
      _id: "news_3",
      title: "Space Tourism Industry Sees Major Breakthrough",
      category: "Space",
      time: "8 hours ago",
      excerpt: "New propulsion technology makes space travel more accessible and affordable for civilian passengers...",
      href: "articles/space-tourism-breakthrough.html"
    },
    {
      _id: "news_4",
      title: "Revolutionary Medical Treatment Shows Promise",
      category: "Health",
      time: "12 hours ago",
      excerpt: "Clinical trials reveal breakthrough therapy could transform treatment for rare genetic disorders...",
      href: "articles/medical-treatment-promise.html"
    }
  ],
  videos: [
    {
      _id: "video_1",
      youtubeId: "JjH8AfUIB8E",
      title: "News Podcast Episode",
      channel: "Your Channel",
      description: "Embedded YouTube episode."
    },
    {
      _id: "video_2",
      youtubeId: "45OISlCdnDk",
      title: "News Podcast Episode 2",
      channel: "Your Channel",
      description: "Embedded YouTube episode."
    },
    {
      _id: "video_3",
      youtubeId: "fuRRCZRcE0qMAUPn",
      title: "News Podcast Episode 3",
      channel: "Your Channel",
      description: "Embedded YouTube episode."
    }
  ],
  trending: []
};

// Helper to generate unique IDs
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get content from Blobs or return default
async function getContent() {
  try {
    const store = getStore("content");
    const data = await store.get("data", { type: "json" });
    if (data) {
      return data;
    }
  } catch (error) {
    console.log("Using default content (Blobs not available or empty)");
  }
  return { ...defaultContent };
}

// Save content to Blobs
async function saveContent(content) {
  try {
    const store = getStore("content");
    await store.setJSON("data", content);
  } catch (error) {
    console.error("Failed to save to Blobs:", error);
    throw error;
  }
}

// Parse request path to extract resource and id
function parseApiPath(path) {
  // Remove /api/ prefix and clean up
  const cleanPath = path.replace(/^\/api\//, "").replace(/\/$/, "");
  const parts = cleanPath.split("/");

  return {
    resource: parts[0] || "",
    id: parts[1],
    subResource: parts[2]
  };
}

// Create JSON response
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

// Error response
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// News handlers
async function handleNews(method, id, req) {
  const content = await getContent();

  switch (method) {
    case "GET":
      if (id) {
        const item = content.news.find(n => n._id === id);
        return item ? jsonResponse(item) : errorResponse("Not found", 404);
      }
      return jsonResponse(content.news);

    case "POST": {
      const body = await req.json();
      const newItem = {
        _id: generateId("news"),
        title: body.title || "",
        category: body.category || "",
        time: body.time || "",
        excerpt: body.excerpt || "",
        href: body.href || ""
      };
      content.news.unshift(newItem);
      await saveContent(content);
      return jsonResponse(newItem, 201);
    }

    case "PUT": {
      if (!id) return errorResponse("ID required");
      const idx = content.news.findIndex(n => n._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      const updates = await req.json();
      content.news[idx] = { ...content.news[idx], ...updates };
      await saveContent(content);
      return jsonResponse(content.news[idx]);
    }

    case "DELETE": {
      if (!id) return errorResponse("ID required");
      const idx = content.news.findIndex(n => n._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      content.news.splice(idx, 1);
      await saveContent(content);
      return jsonResponse({ success: true });
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Videos handlers
async function handleVideos(method, id, req) {
  const content = await getContent();

  switch (method) {
    case "GET":
      if (id) {
        const item = content.videos.find(v => v._id === id);
        return item ? jsonResponse(item) : errorResponse("Not found", 404);
      }
      return jsonResponse(content.videos);

    case "POST": {
      const body = await req.json();
      const newItem = {
        _id: generateId("video"),
        youtubeId: body.youtubeId || "",
        title: body.title || "",
        channel: body.channel || "",
        description: body.description || ""
      };
      content.videos.push(newItem);
      await saveContent(content);
      return jsonResponse(newItem, 201);
    }

    case "PUT": {
      if (!id) return errorResponse("ID required");
      const idx = content.videos.findIndex(v => v._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      const updates = await req.json();
      content.videos[idx] = { ...content.videos[idx], ...updates };
      await saveContent(content);
      return jsonResponse(content.videos[idx]);
    }

    case "DELETE": {
      if (!id) return errorResponse("ID required");
      const idx = content.videos.findIndex(v => v._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      content.videos.splice(idx, 1);
      await saveContent(content);
      return jsonResponse({ success: true });
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Trending handlers
async function handleTrending(method, id, req) {
  const content = await getContent();

  switch (method) {
    case "GET":
      if (id) {
        const item = content.trending.find(t => t._id === id);
        return item ? jsonResponse(item) : errorResponse("Not found", 404);
      }
      return jsonResponse(content.trending);

    case "POST": {
      const body = await req.json();
      const newItem = {
        _id: generateId("trending"),
        number: body.number || content.trending.length + 1,
        title: body.title || "",
        description: body.description || "",
        href: body.href || ""
      };
      content.trending.push(newItem);
      await saveContent(content);
      return jsonResponse(newItem, 201);
    }

    case "PUT": {
      if (!id) return errorResponse("ID required");
      const idx = content.trending.findIndex(t => t._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      const updates = await req.json();
      content.trending[idx] = { ...content.trending[idx], ...updates };
      await saveContent(content);
      return jsonResponse(content.trending[idx]);
    }

    case "DELETE": {
      if (!id) return errorResponse("ID required");
      const idx = content.trending.findIndex(t => t._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      content.trending.splice(idx, 1);
      await saveContent(content);
      return jsonResponse({ success: true });
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Articles handlers (for article editor)
async function handleArticles(method, filename, req) {
  if (!filename) return errorResponse("Filename required");

  const store = getStore("articles");

  switch (method) {
    case "GET": {
      try {
        const content = await store.get(filename, { type: "text" });
        if (content) {
          return jsonResponse({ content });
        }
        return errorResponse("Article not found", 404);
      } catch (e) {
        return errorResponse("Article not found", 404);
      }
    }

    case "PUT": {
      try {
        const body = await req.json();
        await store.set(filename, body.content);
        return jsonResponse({ success: true, filename });
      } catch (error) {
        return errorResponse("Failed to save article");
      }
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Newsletter subscription handler
async function handleSubscribe(method, req) {
  if (method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await req.json();
    const email = body.email;

    if (!email || !email.includes("@")) {
      return errorResponse("Valid email required");
    }

    // Store subscription in Blobs
    const store = getStore("subscriptions");
    let subscriptions = [];
    try {
      subscriptions = await store.get("emails", { type: "json" }) || [];
    } catch (e) {
      subscriptions = [];
    }

    if (!subscriptions.includes(email)) {
      subscriptions.push(email);
      await store.setJSON("emails", subscriptions);
    }

    return jsonResponse({
      success: true,
      message: "Thank you for subscribing! You'll be notified when new podcasts are added."
    });
  } catch (error) {
    return errorResponse("Subscription failed");
  }
}

// File upload handler (placeholder - actual file uploads need different handling)
async function handleUpload(method, uploadType, req) {
  if (method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  // Note: Actual file upload handling requires multipart form data parsing
  // This is a placeholder that acknowledges the upload request
  return jsonResponse({
    success: true,
    message: `Upload endpoint for ${uploadType} received. For production use, implement proper file handling.`,
    filename: `uploaded_${Date.now()}`
  });
}

export default async (req, context) => {
  const url = new URL(req.url);
  const method = req.method;
  const { resource, id } = parseApiPath(url.pathname);

  // Handle different resources
  switch (resource) {
    case "news":
      return handleNews(method, id, req);
    case "videos":
      return handleVideos(method, id, req);
    case "trending":
      return handleTrending(method, id, req);
    case "articles":
      return handleArticles(method, id, req);
    case "subscribe":
      return handleSubscribe(method, req);
    case "upload":
      return handleUpload(method, id, req);
    default:
      return errorResponse("Not found", 404);
  }
};

export const config = {
  path: "/api/*"
};
