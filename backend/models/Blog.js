const mongoose = require('mongoose');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot be more than 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  featuredImage: {
    type: String,
    default: 'no-image.jpg'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Create blog slug from the title and sanitize content
BlogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });

  if (this.content) {
    this.content = sanitizeHtml(this.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'div']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['style', 'class'],
        'img': ['src', 'alt']
      }
    });
  }
  next();
});

// Indexing for search optimization
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1 });

module.exports = mongoose.model('Blog', BlogSchema);
