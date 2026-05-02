export interface CategoryDef {
  slug: string;
  name: string;
  emoji: string;
  thumbnail: string;
  blurb: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "business", name: "Business", emoji: "💼", thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80", blurb: "Founders, strategy & markets" },
  { slug: "technology", name: "Technology", emoji: "💻", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", blurb: "Software, AI & innovation" },
  { slug: "finance", name: "Finance", emoji: "📈", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", blurb: "Money, investing & fintech" },
  { slug: "health", name: "Health & Wellness", emoji: "🩺", thumbnail: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80", blurb: "Mind, body & medicine" },
  { slug: "entertainment", name: "Entertainment", emoji: "🎬", thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80", blurb: "Film, music & pop culture" },
  { slug: "education", name: "Education", emoji: "🎓", thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", blurb: "Learn anything, anytime" },
  { slug: "news", name: "News & Politics", emoji: "📰", thumbnail: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80", blurb: "Current affairs & analysis" },
  { slug: "sports", name: "Sports", emoji: "⚽", thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80", blurb: "Football, athletics & more" },
  { slug: "society", name: "Society & Culture", emoji: "🌍", thumbnail: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80", blurb: "Stories from the continent" },
  { slug: "comedy", name: "Comedy", emoji: "😂", thumbnail: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80", blurb: "Laugh out loud" },
  { slug: "religion", name: "Religion & Spirituality", emoji: "🙏", thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80", blurb: "Faith & inner life" },
  { slug: "lifestyle", name: "Lifestyle", emoji: "✨", thumbnail: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80", blurb: "Living well, your way" },
];

export const getCategory = (slug?: string | null) =>
  CATEGORIES.find((c) => c.slug === (slug || "").toLowerCase());
